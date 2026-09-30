import Link from 'next/link'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-verde px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-card p-6 shadow">
        <h1 className="text-center font-display text-3xl tracking-wider text-verde">
          DON VALDEZ
        </h1>
        <p className="mt-1 text-center text-xs uppercase tracking-widest text-ink-soft">
          Acceso dueño
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
        <Link
          href="/"
          className="mt-4 block text-center text-xs text-ink-soft hover:text-ink"
        >
          ← Volver al sitio
        </Link>
      </div>
    </main>
  )
}
