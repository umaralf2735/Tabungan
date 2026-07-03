import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinanceFlow Pro',
    short_name: 'FinanceFlow',
    description: 'Catat pemasukan, pengeluaran, kelola multi-wallet, dan atur anggaran bulananmu dengan mudah menggunakan FinanceFlow Pro.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
        purpose: 'any'
      },
    ],
  }
}
