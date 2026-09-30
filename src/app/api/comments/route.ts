import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const commentSchema = z.object({
  author_name: z.string().trim().min(1, 'Ingresá tu nombre').max(80),
  content: z.string().trim().min(1, 'Escribí un comentario').max(600),
  website: z.string().max(0).optional(), // honeypot
})

export async function POST(request: Request) {
  const parsed = commentSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('comments').insert({
    author_name: parsed.data.author_name,
    content: parsed.data.content,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}
