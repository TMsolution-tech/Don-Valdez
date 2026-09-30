'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminBookings } from './AdminBookings'
import { AdminServices } from './AdminServices'
import { AdminHours } from './AdminHours'
import { AdminBlocked } from './AdminBlocked'
import { AdminComments } from './AdminComments'

const TABS = [
  { id: 'turnos', label: 'Turnos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'horarios', label: 'Horarios' },
  { id: 'bloqueos', label: 'Días bloqueados' },
  { id: 'comentarios', label: 'Comentarios' },
] as const

type Tab = (typeof TABS)[number]['id']

export function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('turnos')

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wider text-verde">
          PANEL · DON VALDEZ
        </h1>
        <button
          onClick={signOut}
          className="text-sm text-ink-soft hover:text-ink"
        >
          Cerrar sesión
        </button>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-verde text-crema'
                : 'bg-card text-ink-soft border border-line hover:border-verde-3'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === 'turnos' && <AdminBookings />}
        {tab === 'servicios' && <AdminServices />}
        {tab === 'horarios' && <AdminHours />}
        {tab === 'bloqueos' && <AdminBlocked />}
        {tab === 'comentarios' && <AdminComments />}
      </div>
    </div>
  )
}
