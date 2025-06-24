import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDPI - Perhimpunan Dokter Paru Indonesia',
  description: 'Sistem Informasi Manajemen Anggota PDPI',
  keywords: ['PDPI', 'dokter', 'paru', 'indonesia', 'anggota'],
  authors: [{ name: 'PDPI Development Team' }],
  creator: 'PDPI',
  publisher: 'PDPI',
  metadataBase: new URL('https://pdpi.vercel.app'),
  openGraph: {
    title: 'PDPI - Perhimpunan Dokter Paru Indonesia',
    description: 'Sistem Informasi Manajemen Anggota PDPI',
    url: 'https://pdpi.vercel.app',
    siteName: 'PDPI',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PDPI Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDPI - Perhimpunan Dokter Paru Indonesia',
    description: 'Sistem Informasi Manajemen Anggota PDPI',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#4caf50',
                },
              },
              error: {
                style: {
                  background: '#f44336',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}