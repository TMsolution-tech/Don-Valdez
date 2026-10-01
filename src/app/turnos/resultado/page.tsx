import Image from 'next/image'
import Link from 'next/link'
import { BookingResult } from '@/components/booking/BookingResult'

export const dynamic = 'force-dynamic'

export default async function ResultadoPage({
  searchParams,
}: PageProps<'/turnos/resultado'>) {
  const { b } = await searchParams
  const bookingId = typeof b === 'string' ? b : null

  return (
    <main className="flex min-h-full flex-1 flex-col bg-bosque">
      <header className="border-b border-rivera bg-pino/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link href="/" aria-label="Don Valdez — inicio">
            <Image
              src="/logo-white.png"
              alt="Don Valdez — Barber Studio"
              width={807}
              height={399}
              className="h-9 w-auto"
              priority
            />
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-xl px-4 py-16">
        {bookingId ? (
          <BookingResult bookingId={bookingId} />
        ) : (
          <p className="text-center text-tinta-soft">
            Falta la referencia del turno.
          </p>
        )}
      </div>
    </main>
  )
}
