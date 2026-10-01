'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Comment } from '@/lib/types'

export function AdminComments() {
  const [supabase] = useState(() => createClient())
  const [rows, setRows] = useState<Comment[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let alive = true
    supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (alive) setRows((data ?? []) as Comment[])
      })
    return () => {
      alive = false
    }
  }, [supabase, refreshKey])

  async function toggle(c: Comment) {
    await supabase
      .from('comments')
      .update({ is_approved: !c.is_approved })
      .eq('id', c.id)
    reload()
  }

  async function remove(id: string) {
    await supabase.from('comments').delete().eq('id', id)
    reload()
  }

  return (
    <section>
      <p className="text-sm text-ink-soft">
        Los comentarios aprobados aparecen en la página principal.
      </p>
      <ul className="mt-4 space-y-3">
        {rows.map((c) => (
          <li
            key={c.id}
            className={`rounded-lg border p-4 text-sm ${
              c.is_approved ? 'border-rivera bg-pino' : 'border-red-900 bg-red-950/30'
            }`}
          >
            <p className="text-crema">{c.content}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-soft">
                — {c.author_name} · {c.created_at.slice(0, 10)}
                {!c.is_approved && ' · oculto'}
              </span>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => toggle(c)}
                  className="rounded border border-rivera px-3 py-1 text-ink-soft hover:border-salvia hover:text-salvia"
                >
                  {c.is_approved ? 'Ocultar' : 'Mostrar'}
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="rounded bg-red-900/50 px-3 py-1 text-red-300"
                >
                  Borrar
                </button>
              </div>
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-ink-soft">Todavía no hay comentarios.</p>
        )}
      </ul>
    </section>
  )
}
