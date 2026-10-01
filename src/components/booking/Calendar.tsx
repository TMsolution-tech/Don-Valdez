'use client'

import { useMemo, useState } from 'react'
import { addDays } from '@/lib/time'

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface CalendarProps {
  todayStr: string // "YYYY-MM-DD" calculado en el server (zona del negocio)
  openWeekdays: number[] // días de semana con atención (0=dom)
  blockedDates: Set<string>
  selected: string | null
  onSelect: (date: string) => void
  maxDays: number
}

function toStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function Calendar({
  todayStr,
  openWeekdays,
  blockedDates,
  selected,
  onSelect,
  maxDays,
}: CalendarProps) {
  const [ty, tm] = todayStr.split('-').map(Number)
  const [cursor, setCursor] = useState({ y: ty, m: tm - 1 }) // m: 0-11

  const maxStr = addDays(todayStr, maxDays)
  const minMonth = `${ty}-${String(tm).padStart(2, '0')}`
  const maxMonth = maxStr.slice(0, 7)
  const cursorMonth = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}`

  const cells = useMemo(() => {
    const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate()
    // offset: cuántas celdas vacías antes del 1 (semana empieza lunes)
    const firstDow = new Date(Date.UTC(cursor.y, cursor.m, 1)).getUTCDay()
    const offset = (firstDow + 6) % 7
    const out: (string | null)[] = Array.from({ length: offset }, () => null)
    for (let d = 1; d <= daysInMonth; d++) out.push(toStr(cursor.y, cursor.m, d))
    return out
  }, [cursor])

  function move(delta: number) {
    setCursor((c) => {
      const d = new Date(Date.UTC(c.y, c.m + delta, 1))
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() }
    })
  }

  function isDisabled(dateStr: string): boolean {
    if (dateStr < todayStr || dateStr > maxStr) return true
    const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
    if (!openWeekdays.includes(dow)) return true
    return blockedDates.has(dateStr)
  }

  const arrowCls =
    'flex h-8 w-8 items-center justify-center rounded-full text-salvia transition hover:bg-musgo disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <div className="rounded-xl border border-rivera bg-bosque/40 p-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-semibold text-crema">
          {MONTHS[cursor.m]} {cursor.y}
        </h4>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Mes anterior"
            disabled={cursorMonth <= minMonth}
            onClick={() => move(-1)}
            className={arrowCls}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Mes siguiente"
            disabled={cursorMonth >= maxMonth}
            onClick={() => move(1)}
            className={arrowCls}
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-soft"
          >
            {d}
          </span>
        ))}
        {cells.map((dateStr, i) =>
          dateStr === null ? (
            <span key={`e${i}`} />
          ) : (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled(dateStr)}
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-lg text-xs transition ${
                selected === dateStr
                  ? 'bg-salvia font-bold text-bosque'
                  : isDisabled(dateStr)
                    ? 'cursor-not-allowed text-ink-soft/25'
                    : 'text-crema hover:bg-musgo'
              } ${
                dateStr === todayStr && selected !== dateStr
                  ? 'ring-1 ring-salvia/60'
                  : ''
              }`}
            >
              {Number(dateStr.slice(8))}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
