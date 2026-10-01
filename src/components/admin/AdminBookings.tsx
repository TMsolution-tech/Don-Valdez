'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/types'

interface Row {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  client_name: string
  client_phone: string
  status: BookingStatus
  deposit_amount: number
  services: { name: string } | null
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-verde-soft text-verde',
  pending_payment: 'bg-crema text-ink-soft',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-verde text-crema',
  no_show: 'bg-gold/20 text-ink',
  payment_review: 'bg-gold text-white',
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
      .select('id, booking_date, start_time, end_time, client_name, client_phone, status, deposit_amount, services(name)')
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

  return (
    <section>
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-line bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={reload}
          className="rounded border border-line bg-card px-3 py-2 text-sm hover:border-verde-3"
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
            className="rounded-lg border border-line bg-card p-4 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-display text-lg text-verde">
                  {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                </span>
                <span className="ml-3 font-medium">{b.client_name}</span>
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
                {b.services?.name} · seña ${b.deposit_amount.toLocaleString('es-AR')}
              </span>
              <div className="flex gap-2 text-xs">
                {b.status === 'pending_payment' && (
                  <button
                    onClick={() => setStatus(b.id, 'confirmed')}
                    className="rounded bg-verde px-3 py-1 text-crema"
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
                      className="rounded border border-verde px-3 py-1 text-verde"
                    >
                      Completado
                    </button>
                    <button
                      onClick={() => setStatus(b.id, 'no_show')}
                      className="rounded border border-gold px-3 py-1 text-gold"
                    >
                      No vino
                    </button>
                  </>
                )}
                {b.status === 'payment_review' && (
                  <>
                    <button
                      onClick={() => setStatus(b.id, 'confirmed')}
                      className="rounded bg-verde px-3 py-1 text-crema"
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
