'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Service } from '@/lib/types'
import { BOOKING_WINDOW_DAYS } from '@/lib/time'
import { Calendar } from './Calendar'

interface SlotInfo {
  time: string
  available: boolean
}

interface DayAvailability {
  open: boolean
  slots: SlotInfo[]
}

export function BookingWizard({
  services,
  preselectedServiceId,
  todayStr,
  openWeekdays,
  blockedDates,
}: {
  services: Service[]
  preselectedServiceId: string | null
  todayStr: string
  openWeekdays: number[]
  blockedDates: string[]
}) {
  const [serviceId, setServiceId] = useState<string | null>(preselectedServiceId)
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [slotsResp, setSlotsResp] = useState<{
    key: string
    data: DayAvailability
  } | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const service = services.find((s) => s.id === serviceId) ?? null
  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates])
  const slotsKey = service && date ? `${service.id}|${date}` : null
  const day = slotsKey && slotsResp?.key === slotsKey ? slotsResp.data : null
  const loadingSlots = !!slotsKey && !day

  useEffect(() => {
    if (!service || !date) return
    const key = `${service.id}|${date}`
    let alive = true
    fetch(`/api/slots?date=${date}&service_id=${service.id}`)
      .then((r) => r.json())
      .then((d: DayAvailability) => {
        if (alive) setSlotsResp({ key, data: d })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [service, date])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!service || !date || !time) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          date,
          time,
          name,
          phone,
          email: email || undefined,
          website,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo crear el turno')
      window.location.assign(data.init_point)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full rounded border border-line bg-white px-3 py-2 text-sm focus:border-verde-3 focus:outline-none'

  return (
    <div className="mt-8 space-y-8">
      {/* Paso 1 — servicio */}
      <section>
        <h2 className="font-display text-xl tracking-wide text-verde">
          1 · SERVICIO
        </h2>
        <div className="mt-3 grid gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id)
                setTime(null)
              }}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
                serviceId === s.id
                  ? 'border-verde bg-verde text-crema'
                  : 'border-line bg-card hover:border-verde-3'
              }`}
            >
              <span>
                <span className="block font-medium">{s.name}</span>
                <span
                  className={`text-xs ${serviceId === s.id ? 'text-crema/70' : 'text-ink-soft'}`}
                >
                  {s.duration_min} min · seña ${s.deposit.toLocaleString('es-AR')}
                </span>
              </span>
              <span className="font-semibold">
                ${s.price.toLocaleString('es-AR')}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Paso 2 — día */}
      {service && (
        <section>
          <h2 className="font-display text-xl tracking-wide text-verde">
            2 · DÍA
          </h2>
          <div className="mt-3">
            <Calendar
              todayStr={todayStr}
              openWeekdays={openWeekdays}
              blockedDates={blockedSet}
              selected={date}
              maxDays={BOOKING_WINDOW_DAYS}
              onSelect={(d) => {
                setDate(d)
                setTime(null)
              }}
            />
          </div>
        </section>
      )}

      {/* Paso 3 — horario */}
      {service && date && (
        <section>
          <h2 className="font-display text-xl tracking-wide text-verde">
            3 · HORARIO
          </h2>
          {loadingSlots && (
            <p className="mt-3 text-sm text-ink-soft">Cargando horarios…</p>
          )}
          {!loadingSlots && day && !day.open && (
            <p className="mt-3 rounded border border-line bg-card p-3 text-sm text-ink-soft">
              No hay atención este día. Elegí otra fecha.
            </p>
          )}
          {!loadingSlots && day?.open && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {day.slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setTime(s.time)}
                  className={`rounded border px-2 py-2 text-sm transition ${
                    time === s.time
                      ? 'border-verde bg-verde text-crema'
                      : s.available
                        ? 'border-line bg-card hover:border-verde-3'
                        : 'cursor-not-allowed border-line/50 bg-crema/40 text-ink-soft/40'
                  }`}
                >
                  {s.time}
                </button>
              ))}
              {day.slots.length === 0 && (
                <p className="col-span-full text-sm text-ink-soft">
                  Sin horarios disponibles para este día.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Paso 4 — datos */}
      {service && date && time && (
        <section>
          <h2 className="font-display text-xl tracking-wide text-verde">
            4 · TUS DATOS
          </h2>
          <form
            onSubmit={submit}
            className="mt-3 space-y-3 rounded-lg border border-line bg-card p-5"
          >
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
              className={inputCls}
            />
            <input
              required
              type="tel"
              maxLength={30}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Teléfono / WhatsApp"
              className={inputCls}
            />
            <input
              type="email"
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (opcional)"
              className={inputCls}
            />
            <div className="rounded bg-verde-soft p-3 text-sm text-verde">
              <p className="font-medium">
                {service.name} — {date} a las {time}
              </p>
              <p className="mt-1 text-xs">
                Seña a pagar ahora:{' '}
                <strong>${service.deposit.toLocaleString('es-AR')}</strong> ·
                Resto en el local:{' '}
                <strong>
                  ${(service.price - service.deposit).toLocaleString('es-AR')}
                </strong>
              </p>
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-verde py-3 font-display text-lg tracking-wider text-crema hover:bg-verde-2 disabled:opacity-50"
            >
              {submitting ? 'GENERANDO PAGO…' : 'PAGAR SEÑA CON MERCADO PAGO'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
