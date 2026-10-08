'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  MOVEMENT_CATEGORIES,
  type Movement,
  type MovementCategory,
} from '@/lib/types'

const EMPTY = {
  tipo: 'ingreso' as 'ingreso' | 'gasto',
  descripcion: '',
  monto: '',
  categoria: 'varios' as MovementCategory,
  fecha: '',
}

const fmt = (n: number) => '$' + n.toLocaleString('es-AR')

const CATEGORY_COLORS: Record<MovementCategory, string> = {
  'corte de pelo': '#aad8b8',
  indumentaria: '#d9c98f',
  insumos: '#5e8f72',
  varios: '#8b9a92',
}

function Donut({
  data,
}: {
  data: { label: string; value: number; color: string }[]
}) {
  const total = data.reduce((a, d) => a + d.value, 0)
  const R = 40
  const C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#235347" strokeWidth="18" />
        {total > 0 &&
          data.map((d) => {
            const frac = d.value / total
            const el = (
              <circle
                key={d.label}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={d.color}
                strokeWidth="18"
                strokeDasharray={`${frac * C} ${C}`}
                strokeDashoffset={-offset * C}
              />
            )
            offset += frac
            return el
          })}
      </svg>
      <ul className="space-y-1 text-xs">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            <span className="capitalize text-crema">{d.label}</span>
            <span className="text-ink-soft">
              {fmt(d.value)} · {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
        {total === 0 && (
          <li className="text-ink-soft">Sin movimientos este mes.</li>
        )}
      </ul>
    </div>
  )
}

export function AdminMovements({ today }: { today: string }) {
  const [supabase] = useState(() => createClient())
  const [rows, setRows] = useState<Movement[]>([])
  const [form, setForm] = useState({ ...EMPTY, fecha: today })
  const [month, setMonth] = useState(today.slice(0, 7)) // "YYYY-MM"
  const [msg, setMsg] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let alive = true
    const [y, m] = month.split('-').map(Number)
    const to =
      m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
    const from = `${month}-01`
    supabase
      .from('movements')
      .select('*')
      .gte('fecha', from)
      .lt('fecha', to)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (alive) setRows((data ?? []) as Movement[])
      })
    return () => {
      alive = false
    }
  }, [supabase, refreshKey, month])

  const totals = useMemo(() => {
    let ingresos = 0
    let gastos = 0
    for (const r of rows) {
      if (r.tipo === 'ingreso') ingresos += Number(r.monto)
      else gastos += Number(r.monto)
    }
    return { ingresos, gastos, balance: ingresos - gastos }
  }, [rows])

  const byCategory = useMemo(
    () =>
      MOVEMENT_CATEGORIES.map((c) => ({
        label: c,
        color: CATEGORY_COLORS[c],
        value: rows
          .filter((r) => r.categoria === c)
          .reduce((a, r) => a + Number(r.monto), 0),
      })),
    [rows],
  )

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    const monto = Number(form.monto)
    if (!form.descripcion.trim() || !(monto > 0) || !form.fecha) {
      setMsg('Completá descripción, monto y fecha')
      return
    }
    const { error } = await supabase.from('movements').insert({
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      monto,
      categoria: form.categoria,
      fecha: form.fecha,
    })
    setMsg(error ? error.message : 'Guardado')
    if (!error) {
      setForm({ ...EMPTY, fecha: today })
      reload()
    }
  }

  async function remove(id: string) {
    await supabase.from('movements').delete().eq('id', id)
    reload()
  }

  const inputCls =
    'w-full rounded-lg border border-rivera bg-musgo px-3 py-2 text-sm text-crema placeholder:text-ink-soft/60 focus:border-salvia focus:outline-none'

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-3 self-start rounded-xl border border-rivera bg-pino p-5">
        <h3 className="font-tag text-xl text-crema">Nuevo movimiento</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['ingreso', 'gasto'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, tipo: t })}
              className={`rounded-lg border py-2 text-sm font-semibold capitalize transition ${
                form.tipo === t
                  ? t === 'ingreso'
                    ? 'border-salvia bg-salvia text-pino'
                    : 'border-red-400 bg-red-400/20 text-red-300'
                  : 'border-rivera text-ink-soft hover:border-salvia'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          required
          maxLength={120}
          placeholder="Descripción (ej: Corte, Venta remera, Cera)"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          className={inputCls}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-ink-soft">
            Monto $
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="text-xs text-ink-soft">
            Categoría
            <select
              value={form.categoria}
              onChange={(e) =>
                setForm({ ...form, categoria: e.target.value as MovementCategory })
              }
              className={inputCls}
            >
              {MOVEMENT_CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 text-xs text-ink-soft">
            Fecha
            <input
              required
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className={inputCls}
            />
          </label>
        </div>
        {msg && <p className="text-sm text-ink-soft">{msg}</p>}
        <button type="submit" className="rounded-lg bg-salvia px-5 py-2 text-sm font-bold text-pino hover:bg-crema">
          Guardar
        </button>
      </form>

      <div>
        <div className="flex items-center justify-between gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="rounded-lg border border-rivera bg-musgo px-3 py-1.5 text-sm text-crema focus:border-salvia focus:outline-none"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-rivera bg-pino p-3">
            <p className="text-xs text-ink-soft">Ingresos</p>
            <p className="font-tag text-xl text-salvia">{fmt(totals.ingresos)}</p>
          </div>
          <div className="rounded-lg border border-rivera bg-pino p-3">
            <p className="text-xs text-ink-soft">Gastos</p>
            <p className="font-tag text-xl text-red-400">{fmt(totals.gastos)}</p>
          </div>
          <div className="rounded-lg border border-rivera bg-pino p-3">
            <p className="text-xs text-ink-soft">Balance</p>
            <p className={`font-tag text-xl ${totals.balance >= 0 ? 'text-crema' : 'text-red-400'}`}>
              {fmt(totals.balance)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-rivera bg-pino p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Por categoría
          </p>
          <Donut data={byCategory} />
        </div>

        <ul className="mt-4 space-y-2">
          {rows.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-rivera bg-pino p-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-crema">{m.descripcion}</p>
                <p className="text-xs capitalize text-ink-soft">
                  {m.fecha} · {m.categoria}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={m.tipo === 'ingreso' ? 'font-semibold text-salvia' : 'font-semibold text-red-400'}>
                  {m.tipo === 'ingreso' ? '+' : '−'}
                  {fmt(Number(m.monto))}
                </span>
                <button onClick={() => remove(m.id)} className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                  Borrar
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-ink-soft">No hay movimientos en este mes.</p>
          )}
        </ul>
      </div>
    </section>
  )
}
