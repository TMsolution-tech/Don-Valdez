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

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

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
    <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90">
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
  )
}

export function AdminMovements({ today }: { today: string }) {
  const [supabase] = useState(() => createClient())
  const [ty, tm] = today.split('-').map(Number)

  const [rows, setRows] = useState<Movement[]>([])
  const [earliest, setEarliest] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY, fecha: today })
  const [mode, setMode] = useState<'mes' | 'año'>('mes')
  const [y, setY] = useState(ty)
  const [m, setM] = useState(tm) // 1-12
  const [view, setView] = useState<'gasto' | 'ingreso'>('gasto')
  const [msg, setMsg] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  // El filtro por año aparece recién cuando pasó un año desde el primer movimiento
  const showYearMode = useMemo(() => {
    if (!earliest) return false
    const [ey, em, ed] = earliest.split('-').map(Number)
    return `${ey + 1}-${String(em).padStart(2, '0')}-${String(ed).padStart(2, '0')}` <= today
  }, [earliest, today])

  const effMode = showYearMode ? mode : 'mes'

  useEffect(() => {
    supabase
      .from('movements')
      .select('fecha')
      .order('fecha', { ascending: true })
      .limit(1)
      .then(({ data }) => setEarliest(data?.[0]?.fecha ?? null))
  }, [supabase, refreshKey])

  useEffect(() => {
    let alive = true
    const mm = String(m).padStart(2, '0')
    const from = effMode === 'mes' ? `${y}-${mm}-01` : `${y}-01-01`
    const to =
      effMode === 'mes'
        ? m === 12
          ? `${y + 1}-01-01`
          : `${y}-${String(m + 1).padStart(2, '0')}-01`
        : `${y + 1}-01-01`
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
  }, [supabase, refreshKey, y, m, effMode])

  function shift(delta: number) {
    if (effMode === 'año') {
      setY((v) => v + delta)
      return
    }
    const d = new Date(Date.UTC(y, m - 1 + delta, 1))
    setY(d.getUTCFullYear())
    setM(d.getUTCMonth() + 1)
  }

  const atCurrent =
    effMode === 'año' ? y >= ty : y > ty || (y === ty && m >= tm)

  const totals = useMemo(() => {
    let ingresos = 0
    let gastos = 0
    for (const r of rows) {
      if (r.tipo === 'ingreso') ingresos += Number(r.monto)
      else gastos += Number(r.monto)
    }
    return { ingresos, gastos, balance: ingresos - gastos }
  }, [rows])

  const viewTotal = view === 'gasto' ? totals.gastos : totals.ingresos

  const byCategory = useMemo(
    () =>
      MOVEMENT_CATEGORIES.map((c) => ({
        label: c,
        color: CATEGORY_COLORS[c],
        value: rows
          .filter((r) => r.tipo === view && r.categoria === c)
          .reduce((a, r) => a + Number(r.monto), 0),
      }))
        .filter((c) => c.value > 0)
        .sort((a, b) => b.value - a.value),
    [rows, view],
  )

  // Desglose por mes (solo en vista anual)
  const byMonth = useMemo(() => {
    if (effMode !== 'año') return []
    const acc = Array.from({ length: 12 }, () => 0)
    for (const r of rows) {
      if (r.tipo === view) acc[Number(r.fecha.slice(5, 7)) - 1] += Number(r.monto)
    }
    return acc
  }, [rows, view, effMode])

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
  const arrowCls =
    'flex h-10 w-10 items-center justify-center rounded-xl bg-musgo text-salvia transition hover:bg-rivera disabled:opacity-30 disabled:hover:bg-musgo'

  const periodLabel = effMode === 'mes' ? MONTHS[m - 1] : String(y)
  const balanceFmt =
    (totals.balance < 0 ? '−' : '') +
    '$' +
    Math.abs(totals.balance).toLocaleString('es-AR')

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
        {showYearMode && (
          <div className="mb-3 inline-flex rounded-lg border border-rivera bg-pino p-1 text-xs font-semibold">
            {(['mes', 'año'] as const).map((md) => (
              <button
                key={md}
                onClick={() => setMode(md)}
                className={`rounded-md px-4 py-1.5 capitalize transition ${
                  effMode === md ? 'bg-salvia text-pino' : 'text-ink-soft hover:text-salvia'
                }`}
              >
                {md === 'mes' ? 'Mensual' : 'Anual'}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-rivera bg-pino p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-ink-soft">
                Balance de {periodLabel}
                {effMode === 'mes' && y !== ty ? ` ${y}` : ''}
              </p>
              <p
                className={`mt-1 font-tag text-5xl leading-none ${totals.balance >= 0 ? 'text-crema' : 'text-red-400'}`}
              >
                {balanceFmt}
              </p>
              <p className="mt-1 text-xs text-ink-soft">Ingresos menos egresos</p>
            </div>
            <div className="flex gap-2">
              <button aria-label="Anterior" onClick={() => shift(-1)} className={arrowCls}>
                ‹
              </button>
              <button
                aria-label="Siguiente"
                disabled={atCurrent}
                onClick={() => shift(1)}
                className={arrowCls}
              >
                ›
              </button>
            </div>
          </div>

          <dl className="mt-5 space-y-2 border-t border-rivera pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Ingresos</dt>
              <dd className="font-semibold text-salvia">{fmt(totals.ingresos)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Egresos</dt>
              <dd className="font-semibold text-red-400">{fmt(totals.gastos)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 rounded-xl border border-rivera bg-pino p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Por categoría
            </p>
            <div className="flex gap-2 text-xs font-semibold">
              {(['gasto', 'ingreso'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-full px-3 py-1 transition ${
                    view === v
                      ? 'bg-salvia text-pino'
                      : 'border border-rivera text-ink-soft hover:border-salvia'
                  }`}
                >
                  {v === 'gasto' ? 'Egresos' : 'Ingresos'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-5">
            <Donut data={byCategory} />
            <p className="text-xs text-ink-soft">
              {byCategory.length === 0
                ? 'Sin movimientos en este período.'
                : `Total de ${view === 'gasto' ? 'egresos' : 'ingresos'}: ${fmt(viewTotal)}`}
            </p>
          </div>

  <ul className="mt-4 divide-y divide-rivera/60">
    {byCategory.map((c) => (
      <li key={c.label} className="flex items-center gap-3 py-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase text-pino"
          style={{ background: c.color }}
        >
          {c.label[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium capitalize text-crema">{c.label}</p>
          <p className="text-xs text-ink-soft">
            {Math.round((c.value / viewTotal) * 100)}% de{' '}
            {view === 'gasto' ? 'los egresos' : 'los ingresos'}
          </p>
        </div>
        <span className="font-semibold text-crema">{fmt(c.value)}</span>
      </li>
    ))}
  </ul>
        </div>

        {effMode === 'año' && (
          <div className="mt-4 rounded-xl border border-rivera bg-pino p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Por mes — {y}
            </p>
            <ul className="divide-y divide-rivera/60">
              {byMonth.map((v, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      setM(i + 1)
                      setMode('mes')
                    }}
                    className="flex w-full items-center justify-between py-2.5 text-sm hover:text-salvia"
                  >
                    <span className="capitalize text-crema">{MONTHS[i]}</span>
                    <span className={v > 0 ? 'font-semibold text-crema' : 'text-ink-soft'}>
                      {fmt(v)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}


        <ul className="mt-4 space-y-2">
          {rows.map((mv) => (
            <li
              key={mv.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-rivera bg-pino p-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-crema">{mv.descripcion}</p>
                <p className="text-xs capitalize text-ink-soft">
                  {mv.fecha} · {mv.categoria}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={mv.tipo === 'ingreso' ? 'font-semibold text-salvia' : 'font-semibold text-red-400'}>
                  {mv.tipo === 'ingreso' ? '+' : '−'}
                  {fmt(Number(mv.monto))}
                </span>
                <button onClick={() => remove(mv.id)} className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                  Borrar
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-ink-soft">No hay movimientos en este período.</p>
          )}
        </ul>
      </div>
    </section>
  )
}
