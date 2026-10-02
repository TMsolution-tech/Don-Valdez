import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code')?.trim()
  if (!code) {
    return NextResponse.json({ ok: false, error: 'Ingresá un código' })
  }

  const { data } = await createAdminClient()
    .from('promo_codes')
    .select('code, discount')
    .eq('is_active', true)
    .ilike('code', code)
    .maybeSingle()

  if (!data) {
    return NextResponse.json({ ok: false, error: 'Código inválido' })
  }

  return NextResponse.json({
    ok: true,
    code: data.code,
    discount: Number(data.discount),
  })
}
