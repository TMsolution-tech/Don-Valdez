import { createClient } from '@/lib/supabase/server'
import type { BusinessHours, Comment, Service } from '@/lib/types'
import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { ServicesSection } from '@/components/landing/ServicesSection'
import { InfoSection } from '@/components/landing/InfoSection'
import { CommentsSection } from '@/components/landing/CommentsSection'
import { Footer } from '@/components/landing/Footer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  const [{ data: services }, { data: hours }, { data: comments }] =
    await Promise.all([
      supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('business_hours')
        .select('*')
        .eq('is_active', true)
        .order('open_time'),
      supabase
        .from('comments')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(30),
    ])

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <ServicesSection services={(services ?? []) as Service[]} />
        <InfoSection hours={(hours ?? []) as BusinessHours[]} />
        <CommentsSection comments={(comments ?? []) as Comment[]} />
      </main>
      <Footer />
    </>
  )
}
