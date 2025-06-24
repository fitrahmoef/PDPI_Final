import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { HomeHero } from '@/components/home/hero'
import { HomeStats } from '@/components/home/stats'
import { HomeBranches } from '@/components/home/branches'
import { HomeAbout } from '@/components/home/about'
import { HomeHeader } from '@/components/home/header'
import { HomeFooter } from '@/components/home/footer'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Redirect authenticated users to dashboard
  if (session) {
    if (session.user.role === 'CENTRAL_ADMIN') {
      redirect('/admin/dashboard')
    } else if (session.user.role === 'BRANCH_ADMIN') {
      redirect('/branch/dashboard')
    } else {
      redirect('/member/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-600 to-green-400">
      <HomeHeader />
      <main>
        <HomeHero />
        <HomeStats />
        <HomeBranches />
        <HomeAbout />
      </main>
      <HomeFooter />
    </div>
  )
}