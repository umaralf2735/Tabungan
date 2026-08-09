import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(wallets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, balance, userId } = await request.json();
    
    if (!name || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const wallet = await prisma.wallet.create({
      data: {
        name,
        balance: parseFloat(balance) || 0,
        userId
      }
    });

    return NextResponse.json(wallet);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing wallet ID' }, { status: 400 });
    }

    await prisma.transaction.deleteMany({
      where: { walletId: id }
    });

    await prisma.wallet.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Wallet deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
