'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/lib/types'

const EMPTY = {
  name: '',
  description: '',
  duration_min: 30,
  price: 0,
  deposit: 0,
  sort_order: 0,
}

export function AdminServices() {
  const [supabase] = useState(() => createClient())
  const [rows, setRows] = useState<Service[]>([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let alive = true
    supabase
      .from('services')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (alive) setRows((data ?? []) as Service[])
      })
    return () => {
      alive = false
    }
  }, [supabase, refreshKey])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    const payload = { ...form }
    const { error } = editingId
      ? await supabase.from('services').update(payload).eq('id', editingId)
      : await supabase.from('services').insert(payload)
    setMsg(error ? error.message : 'Guardado')
    if (!error) {
      setForm(EMPTY)
      setEditingId(null)
      reload()
    }
  }

  async function toggleActive(s: Service) {
    await supabase
      .from('services')
      .update({ is_active: !s.is_active })
      .eq('id', s.id)
    reload()
  }

  function edit(s: Service) {
    setEditingId(s.id)
    setForm({
      name: s.name,
      description: s.description ?? '',
      duration_min: s.duration_min,
      price: s.price,
      deposit: s.deposit,
      sort_order: s.sort_order,
    })
  }

  const inputCls =
    'w-full rounded-lg border border-rivera bg-musgo px-3 py-2 text-sm text-crema placeholder:text-ink-soft/60 focus:border-salvia focus:outline-none'

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-3 rounded-xl border border-rivera bg-pino p-5">
        <h3 className="font-tag text-xl text-crema">
          {editingId ? 'Editar servicio' : 'Nuevo servicio'}
        </h3>
        <input required maxLength={80} placeholder="Nombre" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        <input maxLength={300} placeholder="Descripción" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-ink-soft">
            Duración (min)
            <input required type="number" min={15} step={15} value={form.duration_min}
              onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })}
              className={inputCls} />
          </label>
          <label className="text-xs text-ink-soft">
            Orden
            <input type="number" value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className={inputCls} />
          </label>
          <label className="text-xs text-ink-soft">
            Precio $
            <input required type="number" min={0} value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className={inputCls} />
          </label>
          <label className="text-xs text-ink-soft">
            Seña $
            <input required type="number" min={0} value={form.deposit}
              onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })}
              className={inputCls} />
          </label>
        </div>
        {msg && <p className="text-sm text-ink-soft">{msg}</p>}
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-salvia px-5 py-2 text-sm font-bold text-bosque hover:bg-crema">
            Guardar
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY) }}
              className="rounded-lg border border-rivera px-5 py-2 text-sm text-ink-soft hover:border-salvia">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {rows.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-lg border border-rivera bg-pino p-4 text-sm">
            <div>
              <p className="font-medium text-crema">
                {s.name} {!s.is_active && <span className="text-xs text-red-400">(inactivo)</span>}
              </p>
              <p className="text-xs text-ink-soft">
                {s.duration_min} min · ${s.price.toLocaleString('es-AR')} · seña ${s.deposit.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <button onClick={() => edit(s)} className="rounded border border-rivera px-3 py-1 text-ink-soft hover:border-salvia hover:text-salvia">
                Editar
              </button>
              <button
                onClick={() => toggleActive(s)}
                className={`rounded px-3 py-1 ${s.is_active ? 'bg-red-100 text-red-700' : 'bg-musgo text-salvia'}`}
              >
                {s.is_active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
