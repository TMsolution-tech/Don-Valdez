import { NextResponse } from 'next/server'
import { WebhookSignatureValidator } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'
import { mpPayment } from '@/lib/mercadopago'
import { notifyNewBooking } from '@/lib/mail'
import { env } from '@/lib/env'

// MP envía el aviso como ?type=payment&data.id=123 o en el body JSON.
// También existe el formato viejo: ?topic=payment&id=123
async function extractPaymentId(request: Request): Promise<string | null> {
  const url = new URL(request.url)
  const q = url.searchParams
  const isPayment =
    q.get('type') === 'payment' || q.get('topic') === 'payment'
  const fromQuery = q.get('data.id') ?? q.get('id')
  if (isPayment && fromQuery) return fromQuery

  try {
    const body = await request.json()
    if (body?.type === 'payment' && body?.data?.id) return String(body.data.id)
  } catch {
    // body vacío o no-JSON: ya tenemos lo de la query
  }
  return null
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const dataId = url.searchParams.get('data.id')

  // Validación de firma (si está configurado el secreto en MP)
  const secret = env.mpWebhookSecret()
  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get('x-signature'),
        xRequestId: request.headers.get('x-request-id'),
        dataId,
        secret,
      })
    } catch {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }
  } else {
    console.warn('[mp/webhook] MP_WEBHOOK_SECRET no configurado — sin validación de firma')
  }

  const paymentId = await extractPaymentId(request)
  if (!paymentId) {
    // Otros topics (merchant_order, etc.) no nos interesan: 200 para no reintentar
    return NextResponse.json({ ok: true })
  }

  const supabase = createAdminClient()

  let payment
  try {
    payment = await mpPayment().get({ id: Number(paymentId) })
  } catch (err) {
    console.error('[mp/webhook] no se pudo obtener el pago', paymentId, err)
    return NextResponse.json({ error: 'payment fetch failed' }, { status: 502 })
  }

  const bookingId = payment.external_reference
  if (!bookingId) return NextResponse.json({ ok: true })

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, booking_date, start_time, client_name, client_phone, payment_method, promo_code, discount_amount, services(name)')
    .eq('id', bookingId)
    .maybeSingle()

  if (!booking) return NextResponse.json({ ok: true })

  // Idempotente: si el pago ya estaba registrado con el mismo estado final
  const alreadyConfirmed =
    booking.status === 'confirmed' &&
    payment.status === 'approved'
  if (alreadyConfirmed) return NextResponse.json({ ok: true })

  if (payment.status === 'approved') {
    // Si el turno expiró/canceló mientras pagaba, intentamos retomar los locks
    const { data: relocked } = await supabase.rpc('try_relock_booking', {
      p_booking_id: booking.id,
    })

    await supabase
      .from('bookings')
      .update({
        status: relocked === false ? 'payment_review' : 'confirmed',
        mp_payment_id: String(payment.id),
        expires_at: null,
      })
      .eq('id', booking.id)

    if (relocked !== false) {
      try {
        await notifyNewBooking({
          serviceName:
            (booking.services as { name?: string } | null)?.name ?? 'Servicio',
          date: booking.booking_date,
          time: booking.start_time,
          clientName: booking.client_name,
          clientPhone: booking.client_phone,
          paymentMethod: booking.payment_method as 'mp' | 'cash',
          promoCode: booking.promo_code,
          discount: Number(booking.discount_amount),
        })
      } catch (err) {
        console.error('[mp/webhook] mail de notificación falló', err)
      }
    }
  } else if (
    payment.status === 'rejected' ||
    payment.status === 'cancelled' ||
    payment.status === 'refunded' ||
    payment.status === 'charged_back'
  ) {
    await supabase
      .from('bookings')
      .update({
        status: payment.status === 'rejected' ? 'cancelled' : 'payment_review',
        mp_payment_id: String(payment.id),
      })
      .eq('id', booking.id)
  } else {
    // pending / in_process: el cliente eligió un medio de pago diferido
    // (efectivo, etc.). Extendemos la ventana de espera a 72 h.
    await supabase
      .from('bookings')
      .update({
        mp_payment_id: String(payment.id),
        expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      })
      .eq('id', booking.id)
  }

  return NextResponse.json({ ok: true })
}
