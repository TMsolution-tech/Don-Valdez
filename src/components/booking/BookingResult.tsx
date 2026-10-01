'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/types'

interface BookingStatusResponse {
  status: BookingStatus
  service_name: string
  booking_date: string
  start_time: string
  deposit_amount: number
}

export function BookingResult({ bookingId }: { bookingId: string }) {
  const [data, setData] = useState<BookingStatusResponse | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let tries = 0
    const tick = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`)
        if (!res.ok) throw new Error()
        const d: BookingStatusResponse = await res.json()
        setData(d)
        // seguir consultando mientras el pago esté pendiente (webhook puede tardar)
        if (d.status === 'pending_payment' && tries < 40) {
          tries++
          setTimeout(tick, 3000)
        }
      } catch {
        setFailed(true)
      }
    }
    tick()
  }, [bookingId])

  if (failed) {
    return (
      <p className="text-center text-sm text-red-400">
        No pudimos consultar el estado del turno. Si ya pagaste, contactanos por
        Instagram.
      </p>
    )
  }

  if (!data) {
    return (
      <p className="text-center text-sm text-ink-soft">
        Consultando el estado de tu turno…
      </p>
    )
  }

  const { status } = data
  const box =
    status === 'confirmed'
      ? 'border-salvia bg-musgo'
      : status === 'pending_payment' || status === 'payment_review'
        ? 'border-rivera bg-pino'
        : 'border-red-900 bg-red-950/40'

  const title =
    status === 'confirmed'
      ? '¡Turno confirmado!'
      : status === 'pending_payment'
        ? 'Esperando el pago…'
        : status === 'payment_review'
          ? 'Pago en revisión'
          : 'El turno no quedó confirmado'

  return (
    <div className={`rounded-2xl border p-8 text-center ${box}`}>
      <h1 className="font-tag text-4xl text-crema">{title}</h1>
      <p className="mt-4 text-sm text-crema">
        {data.service_name} · {data.booking_date} · {data.start_time.slice(0, 5)}hs
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">
        Estado: {BOOKING_STATUS_LABELS[status]}
      </p>
      {status === 'confirmed' && (
        <p className="mt-4 text-sm text-ink-soft">
          Te esperamos. Si no podés venir, avisanos por Instagram con tiempo.
        </p>
      )}
      {status === 'pending_payment' && (
        <p className="mt-4 text-sm text-ink-soft">
          Si ya pagaste, la confirmación puede tardar unos segundos.
        </p>
      )}
      {status === 'payment_review' && (
        <p className="mt-4 text-sm text-ink-soft">
          Recibimos un pago pero el horario necesita revisión manual.
          Contactanos por Instagram.
        </p>
      )}
      {status === 'cancelled' && (
        <p className="mt-4 text-sm text-ink-soft">
          El pago no se completó. Podés intentar reservar de nuevo.
        </p>
      )}
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-salvia px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-bosque hover:bg-crema"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
