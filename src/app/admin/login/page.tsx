import Image from 'next/image'
import Link from 'next/link'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-bosque px-4">
      <div className="w-full max-w-sm rounded-2xl border border-rivera bg-pino p-8 shadow-2xl shadow-black/40">
        <div className="flex justify-center">
          <Image
            src="/logo-light.png"
            alt="Don Valdez — Barber Studio"
            width={807}
            height={399}
            className="h-14 w-auto"
            priority
          />
        </div>
        <p className="mt-1 text-center text-xs uppercase tracking-widest text-ink-soft">
          Acceso dueño
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
        <Link
          href="/"
          className="mt-4 block text-center text-xs text-ink-soft hover:text-salvia"
        >
          ← Volver al sitio
        </Link>
      </div>
    </main>
  )
}
