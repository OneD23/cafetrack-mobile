import { BusinessVertical } from '../types/business';

interface AuthUser {
  email?: string;
  businessType?: string;
}

const byKeyword: Array<{ keyword: string; vertical: BusinessVertical }> = [
  { keyword: 'ferreter', vertical: 'ferreteria' },
  { keyword: 'super', vertical: 'supermercado' },
  { keyword: 'colmado', vertical: 'colmado' },
  { keyword: 'barber', vertical: 'barberia_salon' },
  { keyword: 'salon', vertical: 'barberia_salon' },
  { keyword: 'cafe', vertical: 'cafeteria' },
];

export function resolveBusinessVertical(user: AuthUser | null): BusinessVertical {
  const envType = (process.env.EXPO_PUBLIC_BUSINESS_TYPE || '').toLowerCase();
  const declaredType = (user?.businessType || '').toLowerCase();
  const email = (user?.email || '').toLowerCase();

  const sources = [envType, declaredType, email].filter(Boolean);

  for (const source of sources) {
    const match = byKeyword.find((entry) => source.includes(entry.keyword));
    if (match) return match.vertical;
  }

  return 'cafeteria';
}
