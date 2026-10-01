// Convierte un teléfono argentino (cualquier formato razonable) al formato
// internacional que exige wa.me: 549 + área + número (sin 0 ni 15).
// Ej: "0387-154123456" -> "5493874123456"
export function toWaNumber(phone: string): string {
  let d = phone.replace(/\D/g, '')
  d = d.replace(/^00/, '')
  if (d.startsWith('54')) d = d.slice(2)
  d = d.replace(/^9/, '').replace(/^0/, '')
  // sacar el "15" de celular que va entre el área y el número (ej: 387 15 4123456)
  const m = d.match(/^(\d{3,4})15(\d{6,8})$/)
  if (m) d = m[1] + m[2]
  return `549${d}`
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${toWaNumber(phone)}?text=${encodeURIComponent(message)}`
}
