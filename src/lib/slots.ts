import { createAdminClient } from './supabase/admin'
import { nowInShopTz, toMinutes, toTimeStr, SLOT_STEP_MIN } from './time'

// Cada turno bloquea mínimo este lapso, aunque el servicio sea más corto
const MIN_BLOCK_MIN = 60

export interface SlotInfo {
  time: string // "HH:MM"
  available: boolean
}

export interface DayAvailability {
  date: string
  open: boolean
  reason: 'closed' | 'blocked' | 'ok'
  slots: SlotInfo[]
}

// Turnos que bloquean grilla: confirmados + pendientes de pago no expirados
type BookingRow = {
  start_time: string
  end_time: string
  status: string
  expires_at: string | null
}

function occupiesGrid(b: BookingRow, nowMs: number) {
  if (b.status === 'confirmed') return true
  if (b.status === 'pending_payment' && b.expires_at) {
    return new Date(b.expires_at).getTime() > nowMs
  }
  return false
}

export async function getDayAvailability(
  date: string, // "YYYY-MM-DD"
  durationMin: number,
): Promise<DayAvailability> {
  const supabase = createAdminClient()
  await supabase.rpc('expire_stale_bookings')

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()

  const [{ data: hours }, { data: blocked }] = await Promise.all([
    supabase
      .from('business_hours')
      .select('open_time, close_time')
      .eq('weekday', weekday)
      .eq('is_active', true)
      .order('open_time'),
    supabase.from('blocked_dates').select('date').eq('date', date).maybeSingle(),
  ])

  if (blocked) return { date, open: false, reason: 'blocked', slots: [] }
  if (!hours?.length) return { date, open: false, reason: 'closed', slots: [] }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time, end_time, status, expires_at')
    .eq('booking_date', date)
    .in('status', ['confirmed', 'pending_payment'])

  const nowMs = Date.now()
  const busy = ((bookings ?? []) as BookingRow[])
    .filter((b) => occupiesGrid(b, nowMs))
    .map((b) => {
      const start = toMinutes(b.start_time)
      return { start, end: Math.max(toMinutes(b.end_time), start + MIN_BLOCK_MIN) }
    })

  const now = nowInShopTz()
  const isToday = date === now.date
  const nowMin = toMinutes(now.time)

  const slots: SlotInfo[] = []
  for (const range of hours) {
    const open = toMinutes(range.open_time)
    const close = toMinutes(range.close_time)
    for (let t = open; t + durationMin <= close; t += SLOT_STEP_MIN) {
      const end = t + durationMin
      if (isToday && t <= nowMin) continue
      const overlaps = busy.some((b) => t < b.end && end > b.start)
      slots.push({ time: toTimeStr(t), available: !overlaps })
    }
  }

  // Un mismo horario puede surgir de dos rangos superpuestos; dedup
  const seen = new Map<string, SlotInfo>()
  for (const s of slots) {
    const prev = seen.get(s.time)
    seen.set(s.time, { time: s.time, available: (prev?.available ?? true) && s.available })
  }

  return { date, open: true, reason: 'ok', slots: [...seen.values()] }
}
