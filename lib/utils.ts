import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function generateNPA(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const day = String(new Date().getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `${year}${month}${day}${random}`
}

export function exportToExcel(data: any[], filename: string) {
  // This would implement Excel export functionality
  // For now, we'll create a CSV download
  const csvContent = convertToCSV(data)
  downloadCSV(csvContent, filename)
}

function convertToCSV(data: any[]): string {
  if (!data.length) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9+\-\s()]+$/
  return phoneRegex.test(phone) && phone.length >= 10
}

export function formatPhone(phone: string): string {
  // Format Indonesian phone numbers
  let formatted = phone.replace(/\D/g, '')
  if (formatted.startsWith('0')) {
    formatted = '+62' + formatted.slice(1)
  } else if (!formatted.startsWith('62')) {
    formatted = '+62' + formatted
  } else if (!formatted.startsWith('+')) {
    formatted = '+' + formatted
  }
  return formatted
}

export function getBranchDisplayName(branchCode: string): string {
  const branchMap: Record<string, string> = {
    'aceh': 'Cabang Aceh',
    'sumut': 'Cabang Sumatera Utara',
    'sumbar': 'Cabang Sumatera Barat',
    'riau': 'Cabang Riau',
    'kepri': 'Cabang Kepulauan Riau',
    'jambi': 'Cabang Jambi',
    'sumsel': 'Cabang Sumatera Selatan & Bangka Belitung',
    'bengkulu': 'Cabang Bengkulu',
    'lampung': 'Cabang Lampung',
    'banten': 'Cabang Banten',
    'jakarta': 'Cabang Jakarta',
    'bogor': 'Cabang Bogor',
    'bekasi': 'Cabang Bekasi',
    'depok': 'Cabang Depok',
    'jabar': 'Cabang Jawa Barat',
    'jateng': 'Cabang Jawa Tengah',
    'surakarta': 'Cabang Surakarta',
    'yogya': 'Cabang Yogyakarta',
    'jatim': 'Cabang Jawa Timur',
    'malang': 'Cabang Malang',
    'bali': 'Cabang Bali',
    'ntb': 'Cabang Nusa Tenggara Barat',
    'ntt': 'Cabang Nusa Tenggara Timur',
    'kalsel': 'Cabang Kalimantan Selatan',
    'kaltimtara': 'Cabang Kalimantan Timur & Utara',
    'kalbar': 'Cabang Kalimantan Barat',
    'kalteng': 'Cabang Kalimantan Tengah',
    'sulselbara': 'Cabang Sulawesi Selatan-Barat-Tenggara',
    'suluttenggo': 'Cabang Sulawesi Utara-Tengah-Gorontalo',
    'maluku': 'Cabang Maluku & Maluku Utara',
    'papua': 'Cabang Papua'
  }
  
  return branchMap[branchCode] || branchCode
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'aktif':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'non-aktif':
    case 'non_aktif':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'meninggal_dunia':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function parseSearchParams(searchParams: URLSearchParams) {
  const params: Record<string, string> = {}
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }
  
  return params
}