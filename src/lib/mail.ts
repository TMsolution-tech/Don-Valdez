import nodemailer, { type Transporter } from 'nodemailer'
import { env } from './env'

let transporter: Transporter | null = null

interface BookingMail {
  serviceName: string
  date: string // "YYYY-MM-DD"
  time: string // "HH:MM..."
  clientName: string
  clientPhone: string
  paymentMethod: 'mp' | 'cash'
  promoCode: string | null
  discount: number
}

// Avisa al barbero por mail cada turno confirmado.
// Si faltan las credenciales de Gmail no rompe el flujo — solo loguea.
export async function notifyNewBooking(b: BookingMail) {
  const user = env.gmailUser()
  const pass = env.gmailAppPassword()
  const to = env.notifyEmail()
  if (!user || !pass || !to) {
    console.warn('[mail] Gmail no configurado — sin notificación')
    return
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
  }

  const pago =
    b.paymentMethod === 'cash'
      ? 'Efectivo en el local'
      : 'Seña pagada con Mercado Pago'
  const promo = b.promoCode
    ? `\nPromo: ${b.promoCode} (−$${b.discount.toLocaleString('es-AR')})`
    : ''

  await transporter.sendMail({
    from: `"Don Valdez — Turnos" <${user}>`,
    to,
    subject: `Turno nuevo: ${b.clientName} — ${b.date} ${b.time.slice(0, 5)}`,
    text: [
      `Nuevo turno confirmado`,
      ``,
      `Cliente: ${b.clientName}`,
      `Teléfono: ${b.clientPhone}`,
      `Servicio: ${b.serviceName}`,
      `Fecha: ${b.date} a las ${b.time.slice(0, 5)} hs`,
      `Pago: ${pago}${promo}`,
    ].join('\n'),
  })
}
