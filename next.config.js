/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Hapus header X-Powered-By agar stack teknologi tidak dibocorkan ke hacker
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' }, // Cegah Clickjacking (website dilarang di-embed di iframe situs luar)
          { key: 'X-Content-Type-Options', value: 'nosniff' }, // Cegah MIME-Type Sniffing
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, // Cegah bocornya URL referensi
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }, // Blokir akses sensor berbahaya
          { key: 'X-XSS-Protection', value: '1; mode=block' }, // Aktifkan filter XSS di browser lawas
        ],
      },
    ];
  },
};

module.exports = nextConfig;
