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

const row = (k: string, v: string) => `
  <tr>
    <td style="padding:6px 12px;color:#8b9a92;font-size:13px">${k}</td>
    <td style="padding:6px 12px;color:#f2f8f4;font-size:14px">${v}</td>
  </tr>`

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
    ? row('Promo', `${b.promoCode} (−$${b.discount.toLocaleString('es-AR')})`)
    : ''

  const text = [
    `Nuevo turno confirmado`,
    ``,
    `Cliente: ${b.clientName}`,
    `Teléfono: ${b.clientPhone}`,
    `Servicio: ${b.serviceName}`,
    `Fecha: ${b.date} a las ${b.time.slice(0, 5)} hs`,
    `Pago: ${pago}`,
    b.promoCode ? `Promo: ${b.promoCode} (−$${b.discount})` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const html = `
  <div style="background:#0b2b26;padding:24px;font-family:system-ui,sans-serif;max-width:420px">
    <h2 style="color:#aad8b8;font-size:18px;margin:0 0 12px">Turno nuevo — Don Valdez</h2>
    <table style="border-collapse:collapse;background:#123527;border-radius:8px">
      ${row('Cliente', b.clientName)}
      ${row('Teléfono', b.clientPhone)}
      ${row('Servicio', b.serviceName)}
      ${row('Fecha', `${b.date} — ${b.time.slice(0, 5)} hs`)}
      ${row('Pago', pago)}
      ${promo}
    </table>
    <p style="color:#8b9a92;font-size:11px;margin:12px 0 0">
      Aviso automático de don-valdez.vercel.app
    </p>
  </div>`

  await transporter.sendMail({
    from: `"Don Valdez Turnos" <${user}>`,
    to,
    subject: `Turno: ${b.clientName} — ${b.date} ${b.time.slice(0, 5)}hs`,
    text,
    html,
  })
}
