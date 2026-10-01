import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { nowInShopTz } from '@/lib/time'
import type { Service } from '@/lib/types'
import { BookingWizard } from '@/components/booking/BookingWizard'

export const dynamic = 'force-dynamic'

export default async function TurnosPage({
  searchParams,
}: PageProps<'/turnos'>) {
  const { servicio } = await searchParams
  const supabase = await createClient()
  const todayStr = nowInShopTz().date

  const [{ data: services }, { data: hours }, { data: blocked }] =
    await Promise.all([
      supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      supabase.from('business_hours').select('weekday').eq('is_active', true),
      supabase
        .from('blocked_dates')
        .select('date')
        .gte('date', todayStr),
    ])

  const list = (services ?? []) as Service[]
  const preselected =
    typeof servicio === 'string' && list.some((s) => s.id === servicio)
      ? servicio
      : null

  const openWeekdays = [...new Set((hours ?? []).map((h) => h.weekday))]
  const blockedDates = (blocked ?? []).map((b) => b.date)

  return (
    <main className="min-h-full bg-bosque">
      <header className="border-b border-rivera bg-bosque/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="Don Valdez — inicio">
            <Image
              src="/logo-light.png"
              alt="Don Valdez — Barber Studio"
              width={807}
              height={399}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <Link href="/" className="text-sm text-ink-soft hover:text-salvia">
            ← Volver
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-salvia">
          Turnos online
        </p>
        <h1 className="mt-2 font-tag text-5xl text-crema">
          Reservá tu turno
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Elegí servicio, fecha y horario. Confirmás el turno pagando la seña
          con Mercado Pago.
        </p>
        <BookingWizard
          services={list}
          preselectedServiceId={preselected}
          todayStr={todayStr}
          openWeekdays={openWeekdays}
          blockedDates={blockedDates}
        />
      </div>
    </main>
  )
}
