import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { StatsCards } from '@/components/admin/stats-cards'
import { ActivityLog } from '@/components/admin/activity-log'
import { BranchOverview } from '@/components/admin/branch-overview'
import { RecentMembers } from '@/components/admin/recent-members'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Building2, TrendingUp } from 'lucide-react'

async function getDashboardStats() {
  const [
    totalMembers,
    activeMembers,
    totalBranches,
    totalAdmins,
    recentActivities,
    recentMembers
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { statusKeanggotaan: 'AKTIF' } }),
    prisma.member.distinct({ select: { cabang: true } }).then(branches => branches.length),
    prisma.user.count({ where: { role: 'BRANCH_ADMIN', isActive: true } }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, username: true }
        }
      }
    }),
    prisma.member.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        npa: true,
        namaLengkap: true,
        gelarDepan: true,
        gelarBelakang: true,
        cabang: true,
        statusKeanggotaan: true,
        tanggalBergabung: true
      }
    })
  ])

  return {
    totalMembers,
    activeMembers,
    totalBranches,
    totalAdmins,
    recentActivities,
    recentMembers
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CENTRAL_ADMIN') {
    redirect('/auth/signin')
  }

  const stats = await getDashboardStats()

  const statsData = [
    {
      title: 'Total Anggota',
      value: stats.totalMembers.toLocaleString('id-ID'),
      description: 'Seluruh anggota PDPI',
      icon: Users,
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Anggota Aktif',
      value: stats.activeMembers.toLocaleString('id-ID'),
      description: 'Anggota dengan status aktif',
      icon: UserCheck,
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Total Cabang',
      value: stats.totalBranches.toString(),
      description: 'Cabang di seluruh Indonesia',
      icon: Building2,
      trend: 'Stabil',
      trendUp: true
    },
    {
      title: 'Admin Cabang',
      value: stats.totalAdmins.toString(),
      description: 'Admin cabang aktif',
      icon: TrendingUp,
      trend: '+2',
      trendUp: true
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Selamat datang kembali, {session.user.name}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={statsData} />

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                  Log aktivitas sistem dalam 24 jam terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityLog activities={stats.recentActivities} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Members */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Anggota Terbaru</CardTitle>
                <CardDescription>
                  5 anggota yang baru bergabung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentMembers members={stats.recentMembers} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Branch Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Cabang</CardTitle>
            <CardDescription>
              Distribusi anggota per cabang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BranchOverview />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}