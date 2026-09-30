import Link from 'next/link'
import { BookingResult } from '@/components/booking/BookingResult'

export const dynamic = 'force-dynamic'

export default async function ResultadoPage({
  searchParams,
}: PageProps<'/turnos/resultado'>) {
  const { b } = await searchParams
  const bookingId = typeof b === 'string' ? b : null

  return (
    <main className="flex min-h-full flex-1 flex-col bg-paper">
      <header className="border-b border-verde-2/40 bg-verde text-crema">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
          <Link href="/" className="font-display text-2xl tracking-wide">
            DON VALDEZ
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-xl px-4 py-16">
        {bookingId ? (
          <BookingResult bookingId={bookingId} />
        ) : (
          <p className="text-center text-ink-soft">
            Falta la referencia del turno.
          </p>
        )}
      </div>
    </main>
  )
}
