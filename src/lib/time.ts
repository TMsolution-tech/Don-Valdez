// Zona horaria del negocio (Salta, Argentina — UTC-3 fijo, sin DST)
export const SHOP_TZ = 'America/Argentina/Salta'

// Granularidad de la grilla ofrecida al cliente (los locks en DB siguen a 15
// min, que cubre cualquier intervalo; esto solo define los horarios elegibles)
export const SLOT_STEP_MIN = 30

// Cuántos días hacia adelante se puede reservar
export const BOOKING_WINDOW_DAYS = 30

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: SHOP_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

// Devuelve { date: "YYYY-MM-DD", time: "HH:MM" } del ahora en la zona del negocio
export function nowInShopTz(): { date: string; time: string } {
  const parts = fmt.formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// "HH:MM" | "HH:MM:SS" → minutos desde medianoche
export function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function toTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
