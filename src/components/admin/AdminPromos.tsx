'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PromoCode {
  id: string
  code: string
  discount: number
  is_active: boolean
}

export function AdminPromos() {
  const [supabase] = useState(() => createClient())
  const [rows, setRows] = useState<PromoCode[]>([])
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState('')
  const [msg, setMsg] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let alive = true
    supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (alive) setRows((data ?? []) as PromoCode[])
      })
    return () => {
      alive = false
    }
  }, [supabase, refreshKey])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    const c = code.trim().toUpperCase()
    const d = Number(discount)
    if (!c || !(d > 0)) {
      setMsg('Completá código y descuento')
      return
    }
    const { error } = await supabase
      .from('promo_codes')
      .insert({ code: c, discount: d })
    setMsg(
      error
        ? error.code === '23505'
          ? 'Ese código ya existe'
          : error.message
        : 'Guardado',
    )
    if (!error) {
      setCode('')
      setDiscount('')
      reload()
    }
  }

  async function toggle(p: PromoCode) {
    await supabase
      .from('promo_codes')
      .update({ is_active: !p.is_active })
      .eq('id', p.id)
    reload()
  }

  async function remove(id: string) {
    await supabase.from('promo_codes').delete().eq('id', id)
    reload()
  }

  const inputCls =
    'w-full rounded-lg border border-rivera bg-musgo px-3 py-2 text-sm text-crema placeholder:text-ink-soft/60 focus:border-salvia focus:outline-none'

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-3 self-start rounded-xl border border-rivera bg-pino p-5">
        <h3 className="font-tag text-xl text-crema">Nuevo código</h3>
        <input
          required
          maxLength={30}
          placeholder="Código (ej: AMIGO2026)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className={inputCls}
        />
        <label className="block text-xs text-ink-soft">
          Descuento $
          <input
            required
            type="number"
            min={1}
            step="0.01"
            placeholder="2000"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className={inputCls}
          />
        </label>
        {msg && <p className="text-sm text-ink-soft">{msg}</p>}
        <button type="submit" className="rounded-lg bg-salvia px-5 py-2 text-sm font-bold text-pino hover:bg-crema">
          Guardar
        </button>
        <p className="text-xs text-ink-soft">
          El descuento se aplica al precio total — lo que paga en el local.
        </p>
      </form>

      <ul className="space-y-2">
        {rows.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-rivera bg-pino p-4 text-sm"
          >
            <div>
              <p className="font-medium text-crema">
                {p.code}{' '}
                {!p.is_active && <span className="text-xs text-red-400">(inactivo)</span>}
              </p>
              <p className="text-xs text-ink-soft">
                −${Number(p.discount).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => toggle(p)}
                className={`rounded px-3 py-1 ${p.is_active ? 'bg-rivera/50 text-ink-soft' : 'bg-salvia text-pino'}`}
              >
                {p.is_active ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => remove(p.id)}
                className="rounded bg-red-100 px-3 py-1 text-red-700"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-ink-soft">Todavía no hay códigos.</p>
        )}
      </ul>
    </section>
  )
}
