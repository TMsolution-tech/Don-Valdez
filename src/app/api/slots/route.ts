import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDayAvailability } from '@/lib/slots'

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  service_id: z.uuid(),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    date: url.searchParams.get('date'),
    service_id: url.searchParams.get('service_id'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: service } = await supabase
    .from('services')
    .select('duration_min')
    .eq('id', parsed.data.service_id)
    .eq('is_active', true)
    .maybeSingle()

  if (!service) {
    return NextResponse.json({ error: 'Servicio inválido' }, { status: 404 })
  }

  const day = await getDayAvailability(parsed.data.date, service.duration_min)
  return NextResponse.json(day)
}
