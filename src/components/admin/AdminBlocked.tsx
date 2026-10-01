'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Blocked {
  date: string
  reason: string | null
}

export function AdminBlocked({ today }: { today: string }) {
  const [supabase] = useState(() => createClient())
  const [rows, setRows] = useState<Blocked[]>([])
  const [date, setDate] = useState(today)
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let alive = true
    supabase
      .from('blocked_dates')
      .select('*')
      .gte('date', today)
      .order('date')
      .then(({ data }) => {
        if (alive) setRows((data ?? []) as Blocked[])
      })
    return () => {
      alive = false
    }
  }, [supabase, today, refreshKey])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase
      .from('blocked_dates')
      .insert({ date, reason: reason || null })
    setMsg(error ? error.message : 'Día bloqueado')
    setReason('')
    reload()
  }

  async function remove(d: string) {
    await supabase.from('blocked_dates').delete().eq('date', d)
    reload()
  }

  const inputCls =
    'rounded-lg border border-rivera bg-musgo px-3 py-2 text-sm text-crema placeholder:text-ink-soft/60 focus:border-salvia focus:outline-none'

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 self-start rounded-xl border border-rivera bg-pino p-5">
        <label className="text-xs text-ink-soft">
          Fecha
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`block ${inputCls}`} />
        </label>
        <label className="text-xs text-ink-soft">
          Motivo (opcional)
          <input maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Feriado, feria, etc." className={`block ${inputCls}`} />
        </label>
        <button type="submit" className="rounded-lg bg-salvia px-4 py-2 text-sm font-bold text-bosque hover:bg-crema">
          Bloquear
        </button>
        {msg && <p className="w-full text-sm text-ink-soft">{msg}</p>}
      </form>

      <ul className="space-y-2">
        {rows.length === 0 && (
          <p className="text-sm text-ink-soft">No hay días bloqueados.</p>
        )}
        {rows.map((r) => (
          <li key={r.date} className="flex items-center justify-between rounded-lg border border-rivera bg-pino p-4 text-sm">
            <div>
              <p className="font-medium text-crema">{r.date}</p>
              {r.reason && <p className="text-xs text-ink-soft">{r.reason}</p>}
            </div>
            <button
              onClick={() => remove(r.date)}
              className="rounded bg-red-900/50 px-3 py-1 text-xs text-red-300"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
