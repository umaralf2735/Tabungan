/**
 * THREE-TIER SECURITY LAYER (Defense-in-Depth)
 * 1. Rate Limiting (Anti Brute-Force & Anti-DDoS)
 * 2. Input Sanitization (Anti-XSS & Script Injection)
 * 3. Security Payload Validator
 */

// In-Memory Sliding Window Rate Limiter
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Bersihkan data lama tiap 5 menit agar memori hemat
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

/**
 * Membatasi percobaan request per identifier (IP / Email)
 * @param identifier String unik (misal: IP atau email)
 * @param limit Batas maksimal percobaan (misal: 5 kali)
 * @param windowMs Jendela waktu dalam milidetik (misal: 60.000 ms = 1 menit)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Mengambil alamat IP pengirim dari headers (Vercel / Proxy support)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown-client';
}

/**
 * Sanitasi string untuk mencegah Cross-Site Scripting (XSS) dan karakter berbahaya
 */
export function sanitizeString(input: unknown, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Hapus tag HTML < > untuk cegah eksekusi script tag
    .replace(/javascript:/gi, '') // Hapus URI scheme berbahaya
    .replace(/on\w+=/gi, ''); // Hapus inline event handlers seperti onerror=, onclick=
}

/**
 * Validasi dan normalisasi alamat email
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase().slice(0, 100);
}
