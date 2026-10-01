'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessHours } from '@/lib/types'

const DAY_NAMES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles',
  'Jueves', 'Viernes', 'Sábado',
]
const ORDER = [1, 2, 3, 4, 5, 6, 0]

export function AdminHours() {
  const [supabase] = useState(() => createClient())
  const [rows, setRows] = useState<BusinessHours[]>([])
  const [weekday, setWeekday] = useState(1)
  const [open, setOpen] = useState('09:00')
  const [close, setClose] = useState('13:00')
  const [msg, setMsg] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let alive = true
    supabase
      .from('business_hours')
      .select('*')
      .order('weekday')
      .order('open_time')
      .then(({ data }) => {
        if (alive) setRows((data ?? []) as BusinessHours[])
      })
    return () => {
      alive = false
    }
  }, [supabase, refreshKey])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.from('business_hours').insert({
      weekday,
      open_time: open,
      close_time: close,
    })
    setMsg(error ? error.message : 'Horario agregado')
    reload()
  }

  async function remove(h: BusinessHours) {
    await supabase
      .from('business_hours')
      .delete()
      .eq('weekday', h.weekday)
      .eq('open_time', h.open_time)
    reload()
  }

  async function toggle(h: BusinessHours) {
    await supabase
      .from('business_hours')
      .update({ is_active: !h.is_active })
      .eq('weekday', h.weekday)
      .eq('open_time', h.open_time)
    reload()
  }

  const inputCls =
    'rounded-lg border border-rivera bg-musgo px-3 py-2 text-sm text-crema focus:border-salvia focus:outline-none'

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div>
        <form onSubmit={add} className="flex flex-wrap items-end gap-3 rounded-xl border border-rivera bg-pino p-5">
          <label className="text-xs text-ink-soft">
            Día
            <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className={`block ${inputCls}`}>
              {ORDER.map((d) => (
                <option key={d} value={d}>{DAY_NAMES[d]}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink-soft">
            Abre
            <input type="time" value={open} onChange={(e) => setOpen(e.target.value)} className={`block ${inputCls}`} />
          </label>
          <label className="text-xs text-ink-soft">
            Cierra
            <input type="time" value={close} onChange={(e) => setClose(e.target.value)} className={`block ${inputCls}`} />
          </label>
          <button type="submit" className="rounded-lg bg-salvia px-4 py-2 text-sm font-bold text-pino hover:bg-crema">
            Agregar
          </button>
        </form>
        {msg && <p className="mt-2 text-sm text-ink-soft">{msg}</p>}
        <p className="mt-3 text-xs text-ink-soft">
          Tip: para turno mañana + tarde, cargá dos rangos en el mismo día
          (ej. 9–13 y 16–20:30).
        </p>
      </div>

      <ul className="space-y-2">
        {ORDER.map((d) => {
          const dayRows = rows.filter((r) => r.weekday === d)
          return (
            <li key={d} className="rounded-lg border border-rivera bg-pino p-4 text-sm">
              <p className="font-medium text-crema">{DAY_NAMES[d]}</p>
              {dayRows.length === 0 && (
                <p className="text-xs text-ink-soft">Cerrado</p>
              )}
              <ul className="mt-1 space-y-1">
                {dayRows.map((h) => (
                  <li key={`${h.weekday}-${h.open_time}`} className="flex items-center justify-between">
                    <span className={h.is_active ? 'text-crema' : 'text-ink-soft line-through'}>
                      {h.open_time.slice(0, 5)} – {h.close_time.slice(0, 5)}
                    </span>
                    <span className="flex gap-2 text-xs">
                      <button
                        onClick={() => toggle(h)}
                        className="rounded border border-rivera px-2 py-0.5 text-ink-soft hover:border-salvia hover:text-salvia"
                      >
                        {h.is_active ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => remove(h)}
                        className="rounded bg-red-100 px-2 py-0.5 text-red-700"
                      >
                        Borrar
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
