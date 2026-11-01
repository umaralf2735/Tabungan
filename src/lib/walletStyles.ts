export interface WalletPreset {
  id: string;
  name: string;
  category: 'Bank' | 'E-Wallet' | 'Lainnya';
  colorDot: string;
  gradient: string;
  badge: string;
  chipColor: string;
}

export const WALLET_PRESETS: WalletPreset[] = [
  // Bank Presets
  {
    id: 'bca',
    name: 'BCA',
    category: 'Bank',
    colorDot: '#0A58CA',
    gradient: 'linear-gradient(135deg, #0A58CA 0%, #002D62 100%)',
    badge: 'BANK BCA',
    chipColor: '#93C5FD',
  },
  {
    id: 'seabank',
    name: 'SeaBank',
    category: 'Bank',
    colorDot: '#FF6600',
    gradient: 'linear-gradient(135deg, #FF6600 0%, #B83A00 100%)',
    badge: 'SEABANK',
    chipColor: '#FED7AA',
  },
  {
    id: 'bri',
    name: 'BRI',
    category: 'Bank',
    colorDot: '#00529B',
    gradient: 'linear-gradient(135deg, #00529B 0%, #002447 100%)',
    badge: 'BANK BRI',
    chipColor: '#93C5FD',
  },
  {
    id: 'bni',
    name: 'BNI',
    category: 'Bank',
    colorDot: '#005E5D',
    gradient: 'linear-gradient(135deg, #005E5D 0%, #002828 100%)',
    badge: 'BANK BNI',
    chipColor: '#99F6E4',
  },
  {
    id: 'mandiri',
    name: 'Mandiri',
    category: 'Bank',
    colorDot: '#003D79',
    gradient: 'linear-gradient(135deg, #003D79 0%, #001830 100%)',
    badge: 'BANK MANDIRI',
    chipColor: '#FDE047',
  },
  {
    id: 'bsi',
    name: 'BSI',
    category: 'Bank',
    colorDot: '#00A39D',
    gradient: 'linear-gradient(135deg, #00A39D 0%, #004D4A 100%)',
    badge: 'BANK BSI',
    chipColor: '#FEF08A',
  },
  {
    id: 'jago',
    name: 'Bank Jago',
    category: 'Bank',
    colorDot: '#6B21A8',
    gradient: 'linear-gradient(135deg, #6B21A8 0%, #3B0764 100%)',
    badge: 'BANK JAGO',
    chipColor: '#FBBF24',
  },

  // E-Wallet Presets
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    category: 'E-Wallet',
    colorDot: '#EE4D2D',
    gradient: 'linear-gradient(135deg, #EE4D2D 0%, #9C1C04 100%)',
    badge: 'SHOPEEPAY',
    chipColor: '#FECDD3',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    category: 'E-Wallet',
    colorDot: '#00AED6',
    gradient: 'linear-gradient(135deg, #00AED6 0%, #005F75 100%)',
    badge: 'GOPAY',
    chipColor: '#BAE6FD',
  },
  {
    id: 'ovo',
    name: 'OVO',
    category: 'E-Wallet',
    colorDot: '#5D2E8C',
    gradient: 'linear-gradient(135deg, #5D2E8C 0%, #2A084E 100%)',
    badge: 'OVO',
    chipColor: '#DDD6FE',
  },
  {
    id: 'dana',
    name: 'DANA',
    category: 'E-Wallet',
    colorDot: '#118EEA',
    gradient: 'linear-gradient(135deg, #118EEA 0%, #084C82 100%)',
    badge: 'DANA',
    chipColor: '#93C5FD',
  },

  // Tunai, Crypto & Lainnya
  {
    id: 'cash',
    name: 'Cash',
    category: 'Lainnya',
    colorDot: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)',
    badge: 'TUNAI / CASH',
    chipColor: '#A7F3D0',
  },
  {
    id: 'crypto',
    name: 'Crypto',
    category: 'Lainnya',
    colorDot: '#4F46E5',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
    badge: 'CRYPTO ASSET',
    chipColor: '#C7D2FE',
  },
];

/**
 * Deteksi styling warna & identitas visual berdasarkan nama dompet
 */
export function getWalletStyle(name: string): { gradient: string; badge: string; chipColor: string } {
  const clean = (name || '').trim().toLowerCase();

  if (clean.includes('bca')) {
    return {
      gradient: 'linear-gradient(135deg, #0A58CA 0%, #002D62 100%)',
      badge: 'BANK BCA',
      chipColor: '#93C5FD',
    };
  }
  if (clean.includes('seabank') || clean.includes('sea bank')) {
    return {
      gradient: 'linear-gradient(135deg, #FF6600 0%, #B83A00 100%)',
      badge: 'SEABANK',
      chipColor: '#FED7AA',
    };
  }
  if (clean.includes('shopee') || clean.includes('spay')) {
    return {
      gradient: 'linear-gradient(135deg, #EE4D2D 0%, #9C1C04 100%)',
      badge: 'SHOPEEPAY',
      chipColor: '#FECDD3',
    };
  }
  if (clean.includes('ovo')) {
    return {
      gradient: 'linear-gradient(135deg, #5D2E8C 0%, #2A084E 100%)',
      badge: 'OVO',
      chipColor: '#DDD6FE',
    };
  }
  if (clean.includes('gopay') || clean.includes('go-pay') || clean.includes('gojek')) {
    return {
      gradient: 'linear-gradient(135deg, #00AED6 0%, #005F75 100%)',
      badge: 'GOPAY',
      chipColor: '#BAE6FD',
    };
  }
  if (clean.includes('dana')) {
    return {
      gradient: 'linear-gradient(135deg, #118EEA 0%, #084C82 100%)',
      badge: 'DANA',
      chipColor: '#93C5FD',
    };
  }
  if (clean.includes('bri')) {
    return {
      gradient: 'linear-gradient(135deg, #00529B 0%, #002447 100%)',
      badge: 'BANK BRI',
      chipColor: '#93C5FD',
    };
  }
  if (clean.includes('bni')) {
    return {
      gradient: 'linear-gradient(135deg, #005E5D 0%, #002828 100%)',
      badge: 'BANK BNI',
      chipColor: '#99F6E4',
    };
  }
  if (clean.includes('bsi') || clean.includes('syariah')) {
    return {
      gradient: 'linear-gradient(135deg, #00A39D 0%, #004D4A 100%)',
      badge: 'BANK BSI',
      chipColor: '#FEF08A',
    };
  }
  if (clean.includes('mandiri')) {
    return {
      gradient: 'linear-gradient(135deg, #003D79 0%, #001830 100%)',
      badge: 'BANK MANDIRI',
      chipColor: '#FDE047',
    };
  }
  if (clean.includes('jago')) {
    return {
      gradient: 'linear-gradient(135deg, #6B21A8 0%, #3B0764 100%)',
      badge: 'BANK JAGO',
      chipColor: '#FBBF24',
    };
  }
  if (clean.includes('cash') || clean.includes('tunai') || clean.includes('fisik')) {
    return {
      gradient: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)',
      badge: 'TUNAI / CASH',
      chipColor: '#A7F3D0',
    };
  }
  if (clean.includes('crypto') || clean.includes('binance') || clean.includes('btc')) {
    return {
      gradient: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
      badge: 'CRYPTO ASSET',
      chipColor: '#C7D2FE',
    };
  }
  if (clean.includes('jenius') || clean.includes('btpn')) {
    return {
      gradient: 'linear-gradient(135deg, #0284C7 0%, #082F49 100%)',
      badge: 'JENIUS BTPN',
      chipColor: '#7DD3FC',
    };
  }

  // Fallback deterministik berbasis hash karakter untuk nama kustom
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fallbackGradients = [
    { gradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', badge: 'DOMPET', chipColor: '#94A3B8' },
    { gradient: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)', badge: 'DOMPET', chipColor: '#6EE7B7' },
    { gradient: 'linear-gradient(135deg, #4338CA 0%, #1E1B4B 100%)', badge: 'DOMPET', chipColor: '#A5B4FC' },
    { gradient: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)', badge: 'DOMPET', chipColor: '#FCD34D' },
    { gradient: 'linear-gradient(135deg, #BE185D 0%, #70072B 100%)', badge: 'DOMPET', chipColor: '#F9A8D4' },
  ];
  const idx = Math.abs(hash) % fallbackGradients.length;
  return fallbackGradients[idx];
}
