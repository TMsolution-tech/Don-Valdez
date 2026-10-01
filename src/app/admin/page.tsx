import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { nowInShopTz } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <main className="min-h-full bg-paper">
      <AdminDashboard today={nowInShopTz().date} />
    </main>
  )
}
