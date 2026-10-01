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

const STEPS = ['Servicio', 'Fecha y hora', 'Confirmar']

const WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function prettyDate(d: string) {
  const dt = new Date(`${d}T12:00:00Z`)
  return `${WEEKDAY_SHORT[dt.getUTCDay()]} ${dt.getUTCDate()} ${MONTH_SHORT[dt.getUTCMonth()]}`
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-salvia">
      {children}
    </h3>
  )
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
  const step = !service ? 0 : !date || !time ? 1 : 2

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
    'w-full rounded-lg border border-rivera bg-musgo px-3 py-2.5 text-sm text-crema placeholder:text-ink-soft/60 focus:border-salvia focus:outline-none'

  const ready = !!(service && date && time)

  return (
    <div className="mt-8 rounded-2xl border border-rivera bg-pino p-5 sm:p-8">
      {/* indicador de pasos */}
      <ol className="flex items-center">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  i <= step
                    ? 'bg-salvia text-pino'
                    : 'border border-rivera text-ink-soft'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-[11px] sm:text-xs ${
                  i === step ? 'font-semibold text-crema' : 'text-ink-soft'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-2 h-px flex-1 sm:mx-4 ${i < step ? 'bg-salvia' : 'bg-rivera'}`}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr_1.1fr]">
        {/* Columna 1 — servicio */}
        <div>
          <SectionTitle>Elegí el servicio</SectionTitle>
          <ul className="mt-4 space-y-2">
            {services.map((s) => {
              const active = serviceId === s.id
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceId(s.id)
                      setTime(null)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                      active
                        ? 'border-salvia bg-musgo'
                        : 'border-rivera bg-musgo hover:border-salvia/60'
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium text-crema">
                        {s.name}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {s.duration_min} min · seña $
                        {s.deposit.toLocaleString('es-AR')}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-sm font-bold text-salvia">
                        ${s.price.toLocaleString('es-AR')}
                      </span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] ${
                          active
                            ? 'border-salvia bg-salvia text-pino'
                            : 'border-rivera text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Columna 2 — fecha + horario */}
        <div>
          <SectionTitle>Elegí la fecha</SectionTitle>
          <div className="mt-4">
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

          <div className="mt-6">
            <SectionTitle>Elegí el horario</SectionTitle>
            {!date && (
              <p className="mt-4 text-xs text-ink-soft">
                Primero elegí un día.
              </p>
            )}
            {loadingSlots && (
              <p className="mt-4 text-sm text-ink-soft">Cargando horarios…</p>
            )}
            {!loadingSlots && day && !day.open && (
              <p className="mt-4 text-sm text-ink-soft">
                No hay atención este día.
              </p>
            )}
            {!loadingSlots && day?.open && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {day.slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setTime(s.time)}
                    className={`rounded-lg border px-1 py-2 text-xs font-medium transition ${
                      time === s.time
                        ? 'border-salvia bg-salvia font-bold text-pino'
                        : s.available
                          ? 'border-rivera bg-musgo text-crema hover:border-salvia/60'
                          : 'cursor-not-allowed border-rivera/40 text-ink-soft/30'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
                {day.slots.length === 0 && (
                  <p className="col-span-full text-sm text-ink-soft">
                    Sin horarios disponibles.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Columna 3 — resumen + datos */}
        <div>
          <SectionTitle>Resumen del turno</SectionTitle>
          <div className="mt-4 rounded-xl border border-rivera bg-musgo p-5">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Servicio</dt>
                <dd className="text-right">
                  <span className="block text-crema">
                    {service?.name ?? '—'}
                  </span>
                  {service && (
                    <span className="text-xs font-semibold text-salvia">
                      ${service.price.toLocaleString('es-AR')}
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Fecha</dt>
                <dd className="text-crema">{date ? prettyDate(date) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Horario</dt>
                <dd className="text-crema">{time ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Duración</dt>
                <dd className="text-crema">
                  {service ? `${service.duration_min} min` : '—'}
                </dd>
              </div>
              <div className="border-t border-rivera pt-3">
                <div className="flex justify-between">
                  <dt className="font-semibold text-crema">Seña a pagar</dt>
                  <dd className="text-lg font-bold text-salvia">
                    {service
                      ? `$${service.deposit.toLocaleString('es-AR')}`
                      : '—'}
                  </dd>
                </div>
                {service && (
                  <p className="mt-1 text-right text-xs text-ink-soft">
                    Resto en el local: $
                    {(service.price - service.deposit).toLocaleString('es-AR')}
                  </p>
                )}
              </div>
            </dl>

            <form onSubmit={submit} className="mt-5 space-y-3">
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
                inputMode="numeric"
                maxLength={15}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="WhatsApp — ej: 3874123456"
                className={inputCls}
              />
              <p className="-mt-2 text-xs text-ink-soft/70">
                Solo números, con código de área (sin 0 ni 15). Ej: 3874123456
              </p>
              <input
                type="email"
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (opcional)"
                className={inputCls}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={!ready || submitting}
                className="w-full rounded-lg bg-salvia py-3 text-sm font-bold uppercase tracking-wider text-pino transition hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? 'Generando pago…' : 'Confirmar y pagar seña'}
              </button>
              <p className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
                Pago seguro con Mercado Pago
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
