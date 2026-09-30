import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <main className="min-h-full bg-paper">
      <AdminDashboard />
    </main>
  )
}
