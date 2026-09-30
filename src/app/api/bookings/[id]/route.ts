import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Estado público del turno (para la página de resultado post-pago)
export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/bookings/[id]'>,
) {
  const { id } = await ctx.params
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('status, booking_date, start_time, deposit_amount, services(name)')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    status: data.status,
    booking_date: data.booking_date,
    start_time: data.start_time,
    deposit_amount: data.deposit_amount,
    service_name:
      (data.services as { name?: string } | null)?.name ?? 'Servicio',
  })
}
