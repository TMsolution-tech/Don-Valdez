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
    <main className="min-h-full bg-paper">
      <header className="border-b border-verde-2/40 bg-verde text-crema">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-display text-2xl tracking-wide">
            DON VALDEZ
          </Link>
          <Link href="/" className="text-sm text-crema/80 hover:text-gold">
            ← Volver
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-4xl tracking-wider text-verde">
          RESERVÁ TU TURNO
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Elegí servicio, día y horario. Confirmás el turno pagando la seña con
          Mercado Pago.
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
