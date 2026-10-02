'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/types'
import { waLink } from '@/lib/whatsapp'

interface Row {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  client_name: string
  client_phone: string
  status: BookingStatus
  deposit_amount: number
  payment_method: 'mp' | 'cash'
  promo_code: string | null
  discount_amount: number
  services: { name: string } | null
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-musgo text-salvia',
  pending_payment: 'bg-rivera/50 text-ink-soft',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-salvia text-pino',
  no_show: 'bg-rivera/50 text-crema',
  payment_review: 'bg-red-100 text-red-800',
}

export function AdminBookings({ today }: { today: string }) {
  const [supabase] = useState(() => createClient())
  const [date, setDate] = useState(today)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let alive = true
    supabase
      .from('bookings')
      .select('id, booking_date, start_time, end_time, client_name, client_phone, status, deposit_amount, payment_method, promo_code, discount_amount, services(name)')
      .eq('booking_date', date)
      .order('start_time')
      .then(({ data }) => {
        if (alive) setRows((data ?? []) as unknown as Row[])
      })
    return () => {
      alive = false
    }
  }, [supabase, date, refreshKey])

  async function setStatus(id: string, status: BookingStatus) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    reload()
  }

  function waConfirmLink(b: Row): string {
    const [y, m, d] = b.booking_date.split('-').map(Number)
    const fecha = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(y, m - 1, d))
    const msg = `Hola ${b.client_name}! Te escribimos de Don Valdez Barber Studio. Tu turno quedó confirmado: ${b.services?.name ?? 'servicio'} — ${fecha} a las ${b.start_time.slice(0, 5)} hs. Te esperamos!`
    return waLink(b.client_phone, msg)
  }

  return (
    <section>
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-rivera bg-musgo px-3 py-2 text-sm text-crema"
        />
        <button
          onClick={reload}
          className="rounded-lg border border-rivera bg-pino px-3 py-2 text-sm text-crema hover:border-salvia"
        >
          Actualizar
        </button>
      </div>

      {rows === null && <p className="mt-4 text-sm text-ink-soft">Cargando…</p>}

      {rows !== null && rows.length === 0 && (
        <p className="mt-4 text-sm text-ink-soft">Sin turnos para este día.</p>
      )}

      <ul className="mt-4 space-y-3">
        {(rows ?? []).map((b) => (
          <li
            key={b.id}
            className="rounded-lg border border-rivera bg-pino p-4 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-lg font-bold text-salvia">
                  {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                </span>
                <span className="ml-3 font-medium text-crema">{b.client_name}</span>
                <span className="ml-2 text-ink-soft">{b.client_phone}</span>
              </div>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status]}`}
              >
                {BOOKING_STATUS_LABELS[b.status]}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-ink-soft">
                {b.services?.name} ·{' '}
                {b.payment_method === 'cash'
                  ? 'Efectivo en el local'
                  : `seña $${b.deposit_amount.toLocaleString('es-AR')}`}
                {b.promo_code &&
                  ` · promo ${b.promo_code} (−$${Number(b.discount_amount).toLocaleString('es-AR')})`}
              </span>
              <div className="flex gap-2 text-xs">
                {b.client_phone && (
                  <a
                    href={waConfirmLink(b)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-[#25d366] px-3 py-1 font-semibold text-white"
                  >
                    WhatsApp
                  </a>
                )}
                {b.status === 'pending_payment' && (
                  <button
                    onClick={() => setStatus(b.id, 'confirmed')}
                    className="rounded bg-salvia px-3 py-1 font-semibold text-pino"
                  >
                    Confirmar manual
                  </button>
                )}
                {(b.status === 'confirmed' || b.status === 'pending_payment') && (
                  <button
                    onClick={() => setStatus(b.id, 'cancelled')}
                    className="rounded bg-red-700 px-3 py-1 text-white"
                  >
                    Cancelar
                  </button>
                )}
                {b.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => setStatus(b.id, 'completed')}
                      className="rounded border border-salvia px-3 py-1 text-salvia"
                    >
                      Completado
                    </button>
                    <button
                      onClick={() => setStatus(b.id, 'no_show')}
                      className="rounded border border-rivera px-3 py-1 text-ink-soft"
                    >
                      No vino
                    </button>
                  </>
                )}
                {b.status === 'payment_review' && (
                  <>
                    <button
                      onClick={() => setStatus(b.id, 'confirmed')}
                      className="rounded bg-salvia px-3 py-1 font-semibold text-pino"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setStatus(b.id, 'cancelled')}
                      className="rounded bg-red-700 px-3 py-1 text-white"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
