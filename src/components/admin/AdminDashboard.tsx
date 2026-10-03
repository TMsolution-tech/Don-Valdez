'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminBookings } from './AdminBookings'
import { AdminServices } from './AdminServices'
import { AdminHours } from './AdminHours'
import { AdminBlocked } from './AdminBlocked'
import { AdminComments } from './AdminComments'
import { AdminMovements } from './AdminMovements'
import { AdminPromos } from './AdminPromos'

const TABS = [
  { id: 'turnos', label: 'Turnos' },
  { id: 'caja', label: 'Caja' },
  { id: 'promos', label: 'Promos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'horarios', label: 'Horarios' },
  { id: 'bloqueos', label: 'Días bloqueados' },
  { id: 'comentarios', label: 'Comentarios' },
] as const

type Tab = (typeof TABS)[number]['id']

export function AdminDashboard({ today }: { today: string }) {
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
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Don Valdez"
            width={807}
            height={399}
            className="h-8 w-auto"
          />
          <h1 className="font-tag text-3xl text-tinta">Panel</h1>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-ink-soft hover:text-salvia"
        >
          Cerrar sesión
        </button>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-rivera pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-salvia text-pino'
                : 'bg-pino text-ink-soft border border-rivera hover:border-salvia'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === 'turnos' && <AdminBookings today={today} />}
        {tab === 'caja' && <AdminMovements today={today} />}
        {tab === 'promos' && <AdminPromos />}
        {tab === 'servicios' && <AdminServices />}
        {tab === 'horarios' && <AdminHours />}
        {tab === 'bloqueos' && <AdminBlocked today={today} />}
        {tab === 'comentarios' && <AdminComments />}
      </div>
    </div>
  )
}
