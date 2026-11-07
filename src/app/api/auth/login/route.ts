import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  FOSII_ADMIN_EMAIL,
  FOSII_ADMIN_PASSWORD,
  FosiiSlots,
  signToken,
} from '@/lib/auth';
import { checkRateLimit, getClientIp, sanitizeEmail } from '@/lib/security';

function parseFosiiSlots(raw: string | null | undefined): FosiiSlots {
  if (!raw) return { pusat: null, cabang: null, pesmi: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      pusat: typeof parsed?.pusat === 'string' ? parsed.pusat : null,
      cabang: typeof parsed?.cabang === 'string' ? parsed.cabang : null,
      pesmi: typeof parsed?.pesmi === 'string' ? parsed.pesmi : null,
    };
  } catch {
    return { pusat: null, cabang: null, pesmi: null };
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // LAPIS 1: Proteksi Brute Force IP (Maks 10 percobaan per menit per IP)
    const ipLimit = checkRateLimit(`login-ip-${ip}`, 10, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan dari perangkat ini. Silakan coba lagi dalam ${ipLimit.retryAfterSeconds} detik.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = body.email;
    const password = body.password;

    if (!rawEmail || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // LAPIS 2: Sanitasi Input
    const email = sanitizeEmail(rawEmail);

    // LAPIS 1: Proteksi Brute Force Akun (Maks 5 percobaan gagal per akun per menit)
    const accountLimit = checkRateLimit(`login-acc-${email}`, 5, 60 * 1000);
    if (!accountLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal pada akun ini. Tunggu ${accountLimit.retryAfterSeconds} detik demi keamanan.` },
        { status: 429 }
      );
    }

    // LOGIN KHUSUS ADMIN PENGAWAS FOSII (Ditanam langsung dari kode, tanpa registrasi/OTP)
    if (email === FOSII_ADMIN_EMAIL) {
      let adminUser = await prisma.user.findUnique({ where: { email: FOSII_ADMIN_EMAIL } });

      // Cek apakah cocok dengan password di kode (fosiiadmin123) atau hash di DB (jika diubah di DB)
      const isCodePasswordMatch = password === FOSII_ADMIN_PASSWORD;
      const isDbPasswordMatch = adminUser
        ? await bcrypt.compare(password, adminUser.passwordHash)
        : false;

      if (!isCodePasswordMatch && !isDbPasswordMatch) {
        return NextResponse.json({ error: 'Email atau password Admin salah' }, { status: 400 });
      }

      if (!adminUser) {
        const passwordHash = await bcrypt.hash(FOSII_ADMIN_PASSWORD, 10);
        adminUser = await prisma.user.create({
          data: {
            email: FOSII_ADMIN_EMAIL,
            name: 'Admin Pengawas FOSII',
            passwordHash,
            isVerified: true,
            otp: JSON.stringify({ pusat: null, cabang: null, pesmi: null }),
          },
        });
      }

      const slots = parseFosiiSlots(adminUser.otp);
      const targetUserId = slots.pusat || 'unassigned-fosii-slot';
      const token = signToken(adminUser.id, {
        role: 'FOSII_ADMIN',
        targetUserId,
        unit: 'pusat',
      });

      return NextResponse.json({
        message: 'Login Admin FOSII berhasil',
        token,
        user: {
          id: adminUser.id,
          name: adminUser.name || 'Admin Pengawas FOSII',
          email: adminUser.email,
          isAdmin: true,
          unit: 'pusat',
        },
      });
    }

    // Jika diakses dari subdomain fosii.*, tolak login selain akun Admin FOSII
    const host = (request.headers.get('host') || '').toLowerCase();
    if (host.startsWith('fosii.')) {
      return NextResponse.json(
        { error: 'Portal fosii.financeflowpro.my.id khusus untuk akun Admin Pengawas FOSII.' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 400 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: 'Akun belum diverifikasi. Silakan cek email Anda atau daftar ulang.' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 400 });
    }

    const token = signToken(user.id);

    return NextResponse.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: false },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal melakukan login' }, { status: 500 });
  }
}
