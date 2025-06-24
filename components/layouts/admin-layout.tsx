'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  BarChart3,
  Building2,
  FileText,
  Hospital,
  LogOut,
  Menu,
  Settings,
  Users,
  UserCog,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
    roles: ['CENTRAL_ADMIN', 'BRANCH_ADMIN']
  },
  {
    name: 'Kelola Anggota',
    href: '/admin/members',
    icon: Users,
    roles: ['CENTRAL_ADMIN', 'BRANCH_ADMIN']
  },
  {
    name: 'Admin Cabang',
    href: '/admin/branch-admins',
    icon: UserCog,
    roles: ['CENTRAL_ADMIN']
  },
  {
    name: 'Laporan',
    href: '/admin/reports',
    icon: BarChart3,
    roles: ['CENTRAL_ADMIN', 'BRANCH_ADMIN']
  },
  {
    name: 'Cabang',
    href: '/admin/branches',
    icon: Building2,
    roles: ['CENTRAL_ADMIN']
  },
  {
    name: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings,
    roles: ['CENTRAL_ADMIN']
  }
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
      toast.success('Logout berhasil')
    } catch (error) {
      toast.error('Gagal logout')
    }
  }

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(session?.user?.role || '')
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b">
        <div className="flex items-center space-x-2">
          <Hospital className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">PDPI</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'sidebar-nav',
                isActive && 'active'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-6 border-t">
        <div className="flex items-center space-x-3 text-sm">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {session?.user?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{session?.user?.name}</p>
            <p className="text-muted-foreground truncate">
              {session?.user?.role === 'CENTRAL_ADMIN' ? 'Central Admin' : 
               session?.user?.role === 'BRANCH_ADMIN' ? `Admin ${session?.user?.branch}` : 
               'Admin'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-card">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="bg-background border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Breadcrumb */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold">
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}