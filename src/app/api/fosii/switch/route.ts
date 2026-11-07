import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  FOSII_ADMIN_EMAIL,
  FosiiSlots,
  FosiiUnitId,
  getAuthPayload,
  signToken,
  unauthorized,
} from '@/lib/auth';

const UNIT_LABELS: Record<FosiiUnitId, string> = {
  pusat: 'Pesma Pusat',
  cabang: 'Pesma Cabang',
  pesmi: 'Pesmi',
};

function parseFosiiSlots(raw: string | null | undefined): FosiiSlots {
  if (!raw) return { pusat: null, cabang: null, pesmi: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      pusat: typeof parsed?.pusat === 'string' && parsed.pusat ? parsed.pusat : null,
      cabang: typeof parsed?.cabang === 'string' && parsed.cabang ? parsed.cabang : null,
      pesmi: typeof parsed?.pesmi === 'string' && parsed.pesmi ? parsed.pesmi : null,
    };
  } catch {
    return { pusat: null, cabang: null, pesmi: null };
  }
}

// GET: Ambil konfigurasi 3 slot akun FOSII beserta daftar kandidat akun di database
export async function GET(request: Request) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || payload.role !== 'FOSII_ADMIN') {
      return unauthorized('Hanya Admin Pengawas FOSII yang memiliki akses.');
    }

    const adminUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!adminUser) return unauthorized();

    const slots = parseFosiiSlots(adminUser.otp);

    // Ambil daftar akun terverifikasi di database (selain akun Admin sendiri)
    // Hanya mengambil identitas dasar (id, name, email) untuk dipilih menjadi 3 akun FOSII
    const candidateUsers = await prisma.user.findMany({
      where: {
        isVerified: true,
        NOT: { email: FOSII_ADMIN_EMAIL },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const userMap: Record<string, { id: string; name: string | null; email: string }> = {};
    candidateUsers.forEach(u => {
      userMap[u.id] = { id: u.id, name: u.name, email: u.email };
    });

    return NextResponse.json({
      slots,
      activeUnit: payload.unit || 'pusat',
      assignedAccounts: {
        pusat: slots.pusat ? userMap[slots.pusat] || null : null,
        cabang: slots.cabang ? userMap[slots.cabang] || null : null,
        pesmi: slots.pesmi ? userMap[slots.pesmi] || null : null,
      },
      candidates: candidateUsers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal memuat konfigurasi unit FOSII' },
      { status: 500 }
    );
  }
}

// PUT: Admin memilih/menetapkan maksimal 3 akun database untuk Pesma Pusat, Pesma Cabang, dan Pesmi (masing-masing 1)
export async function PUT(request: Request) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || payload.role !== 'FOSII_ADMIN') {
      return unauthorized('Hanya Admin Pengawas FOSII yang dapat mengatur unit FOSII.');
    }

    const body = await request.json().catch(() => ({}));
    const nextSlots: FosiiSlots = {
      pusat: typeof body.pusat === 'string' && body.pusat ? body.pusat : null,
      cabang: typeof body.cabang === 'string' && body.cabang ? body.cabang : null,
      pesmi: typeof body.pesmi === 'string' && body.pesmi ? body.pesmi : null,
    };

    // Validasi: 1 akun tidak boleh dipakai ganda di lebih dari 1 unit
    const chosenIds = [nextSlots.pusat, nextSlots.cabang, nextSlots.pesmi].filter(Boolean) as string[];
    const uniqueIds = Array.from(new Set(chosenIds));
    if (chosenIds.length !== uniqueIds.length) {
      return NextResponse.json(
        { error: 'Satu akun hanya boleh dipilih untuk 1 unit FOSII (tidak boleh ganda).' },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!adminUser) return unauthorized();

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { otp: JSON.stringify(nextSlots) },
    });

    const currentUnit: FosiiUnitId = payload.unit && UNIT_LABELS[payload.unit] ? payload.unit : 'pusat';
    const targetUserId = nextSlots[currentUnit] || 'unassigned-fosii-slot';
    const token = signToken(adminUser.id, {
      role: 'FOSII_ADMIN',
      targetUserId,
      unit: currentUnit,
    });

    return NextResponse.json({
      message: 'Konfigurasi 3 Akun Unit FOSII berhasil disimpan.',
      slots: nextSlots,
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal menyimpan konfigurasi unit FOSII' },
      { status: 500 }
    );
  }
}

// POST: Admin berpindah pantauan antar 3 unit FOSII (Pesma Pusat | Pesma Cabang | Pesmi)
export async function POST(request: Request) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || payload.role !== 'FOSII_ADMIN') {
      return unauthorized('Hanya Admin Pengawas FOSII yang memiliki akses.');
    }

    const body = await request.json().catch(() => ({}));
    const unit = (typeof body.unit === 'string' ? body.unit.toLowerCase() : '') as FosiiUnitId;

    if (!UNIT_LABELS[unit]) {
      return NextResponse.json({ error: 'Unit FOSII tidak valid' }, { status: 400 });
    }

    const adminUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!adminUser) return unauthorized();

    const slots = parseFosiiSlots(adminUser.otp);
    const assignedUserId = slots[unit];
    const targetUserId = assignedUserId || 'unassigned-fosii-slot';

    let monitoredAccount: { id: string; name: string | null; email: string } | null = null;
    if (assignedUserId) {
      monitoredAccount = await prisma.user.findUnique({
        where: { id: assignedUserId },
        select: { id: true, name: true, email: true },
      });
    }

    const unitLabel = UNIT_LABELS[unit];
    const token = signToken(adminUser.id, {
      role: 'FOSII_ADMIN',
      targetUserId,
      unit,
    });

    return NextResponse.json({
      message: `Memantau ${unitLabel}`,
      token,
      unit,
      monitoredAccount,
      user: {
        id: adminUser.id,
        name: monitoredAccount?.name
          ? `${monitoredAccount.name} (${unitLabel})`
          : `Admin FOSII — ${unitLabel}`,
        email: monitoredAccount?.email || adminUser.email,
        isAdmin: true,
        unit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal berpindah unit pantauan FOSII' },
      { status: 500 }
    );
  }
}
