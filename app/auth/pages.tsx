'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Hospital, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Username atau password salah')
        toast.error('Login gagal!')
        return
      }

      // Get session to determine redirect
      const session = await getSession()
      
      if (session?.user) {
        toast.success('Login berhasil!')
        
        // Redirect based on user role
        if (session.user.role === 'CENTRAL_ADMIN') {
          router.push('/admin/dashboard')
        } else if (session.user.role === 'BRANCH_ADMIN') {
          router.push('/branch/dashboard')
        } else {
          router.push('/member/dashboard')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Terjadi kesalahan sistem')
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pdpi-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <Hospital className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">PDPI</h1>
          <p className="text-green-100">Perhimpunan Dokter Paru Indonesia</p>
        </div>

        {/* Login Form */}
        <Card className="glass-effect border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login Member</CardTitle>
            <CardDescription className="text-center">
              Masuk ke sistem dengan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="input-focus"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="input-focus pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Belum terdaftar?{' '}
                <Link 
                  href="#" 
                  className="text-primary hover:underline font-medium"
                >
                  Hubungi Admin Cabang
                </Link>
              </p>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Demo Login:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUsername('central_admin')
                      setPassword('admin123')
                    }}
                    disabled={loading}
                  >
                    Central Admin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUsername('admin_riau')
                      setPassword('admin123')
                    }}
                    disabled={loading}
                  >
                    Branch Admin
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-white hover:text-green-200 transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}