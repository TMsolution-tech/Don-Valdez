import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { mpPreference } from '@/lib/mercadopago'
import { env } from '@/lib/env'

const bookingSchema = z.object({
  service_id: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  name: z.string().trim().min(2, 'Ingresá tu nombre').max(80),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/\D/g, ''))
    .pipe(
      z
        .string()
        .min(10, 'Ingresá un celular válido — solo números, ej: 3874123456')
        .max(15, 'Ingresá un celular válido — solo números, ej: 3874123456')
    ),
  email: z.email('Email inválido').max(120).optional().or(z.literal('')),
  website: z.string().max(0).optional(), // honeypot
})

const RPC_ERRORS: Record<string, { status: number; msg: string }> = {
  SERVICIO_INVALIDO: { status: 400, msg: 'El servicio ya no está disponible.' },
  TURNO_EN_EL_PASADO: { status: 400, msg: 'Ese horario ya pasó.' },
  FECHA_BLOQUEADA: { status: 409, msg: 'Ese día no hay atención.' },
  FUERA_DE_HORARIO: { status: 409, msg: 'El horario está fuera del rango de atención.' },
  unique_violation: { status: 409, msg: 'Ese horario acaba de ocuparse. Elegí otro.' },
}

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 },
    )
  }
  const { service_id, date, time, name, phone, email } = parsed.data

  const supabase = createAdminClient()
  const { data: bookingId, error } = await supabase.rpc('create_booking', {
    p_service_id: service_id,
    p_date: date,
    p_start: time,
    p_name: name,
    p_phone: phone,
    p_email: email || null,
  })

  if (error || !bookingId) {
    const text = error?.message ?? ''
    const key = Object.keys(RPC_ERRORS).find((k) => text.includes(k))
    const mapped = key
      ? RPC_ERRORS[key]
      : error?.code === '23505'
        ? RPC_ERRORS.unique_violation
        : null
    return NextResponse.json(
      { error: mapped?.msg ?? 'No se pudo reservar el turno.' },
      { status: mapped?.status ?? 500 },
    )
  }

  // Datos del turno para armar la preferencia de pago
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, expires_at, deposit_amount, services(name)')
    .eq('id', bookingId)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  const serviceName =
    (booking.services as { name?: string } | null)?.name ?? 'Servicio'
  const siteUrl = env.siteUrl()
  const resultUrl = `${siteUrl}/turnos/resultado?b=${booking.id}`

  try {
    const pref = await mpPreference().create({
      body: {
        items: [
          {
            id: booking.id,
            title: `Seña turno — ${serviceName}`,
            quantity: 1,
            unit_price: Number(booking.deposit_amount),
            currency_id: 'ARS',
          },
        ],
        payer: {
          name,
          email: email || undefined,
          phone: { number: phone },
        },
        external_reference: booking.id,
        back_urls: {
          success: resultUrl,
          pending: resultUrl,
          failure: resultUrl,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/mp/webhook`,
        statement_descriptor: 'DON VALDEZ',
        expires: true,
        expiration_date_to: booking.expires_at
          ? new Date(booking.expires_at).toISOString()
          : undefined,
      },
    })

    await supabase
      .from('bookings')
      .update({ mp_preference_id: pref.id ?? null })
      .eq('id', booking.id)

    const initPoint = pref.init_point ?? pref.sandbox_init_point
    if (!initPoint) {
      return NextResponse.json(
        { error: 'Mercado Pago no devolvió el link de pago.' },
        { status: 502 },
      )
    }

    return NextResponse.json(
      { booking_id: booking.id, init_point: initPoint },
      { status: 201 },
    )
  } catch (err) {
    // Si falla MP, liberamos el turno
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)
    const msg = err instanceof Error ? err.message : 'Error de Mercado Pago'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
