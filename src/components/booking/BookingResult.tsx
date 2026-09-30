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
      <p className="text-center text-sm text-red-700">
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
      ? 'border-verde-3 bg-verde-soft text-verde'
      : status === 'pending_payment' || status === 'payment_review'
        ? 'border-gold bg-crema text-ink'
        : 'border-red-300 bg-red-50 text-red-800'

  const title =
    status === 'confirmed'
      ? '¡TURNO CONFIRMADO!'
      : status === 'pending_payment'
        ? 'ESPERANDO EL PAGO…'
        : status === 'payment_review'
          ? 'PAGO EN REVISIÓN'
          : 'EL TURNO NO QUEDÓ CONFIRMADO'

  return (
    <div className={`rounded-lg border p-6 text-center ${box}`}>
      <h1 className="font-display text-4xl tracking-wider">{title}</h1>
      <p className="mt-3 text-sm">
        {data.service_name} · {data.booking_date} · {data.start_time.slice(0, 5)}hs
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide opacity-70">
        Estado: {BOOKING_STATUS_LABELS[status]}
      </p>
      {status === 'confirmed' && (
        <p className="mt-4 text-sm">
          Te esperamos. Si no podés venir, avisanos por Instagram con tiempo.
        </p>
      )}
      {status === 'pending_payment' && (
        <p className="mt-4 text-sm">
          Si ya pagaste, la confirmación puede tardar unos segundos.
        </p>
      )}
      {status === 'payment_review' && (
        <p className="mt-4 text-sm">
          Recibimos un pago pero el horario necesita revisión manual.
          Contactanos por Instagram.
        </p>
      )}
      {(status === 'cancelled') && (
        <p className="mt-4 text-sm">
          El pago no se completó. Podés intentar reservar de nuevo.
        </p>
      )}
      <Link
        href="/"
        className="mt-6 inline-block rounded bg-verde px-6 py-2 text-sm font-semibold text-crema hover:bg-verde-2"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
