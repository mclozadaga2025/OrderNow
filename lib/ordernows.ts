import type { IconName } from '@/lib/icons/LucideIcon';

export type MenuCategory = 'Drinks' | 'Food' | 'Dessert' | 'Other';
export const UNGROUPED_FILTER_ID = '__ungrouped__';

export type AvatarIcon =
  | 'UserRound'
  | 'Flower2'
  | 'Ghost'
  | 'Baby'
  | 'Cookie'
  | 'Brain'
  | 'Gamepad2'
  | 'Music4';

export interface Group {
  id: string;
  name: string;
  tagline: string;
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  phone: string;
  favoriteDrink: string;
  balance: number;
  groupIds: string[];
  avatar: AvatarIcon;
  role?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: MenuCategory;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  openUntil: string;
  icon: IconName;
  menuItems: MenuItem[];
}

export interface TransactionParticipant {
  memberId: string;
  item: string;
  amount: number;
  sharePercent: number;
  rawAmount?: number;
  discountAmount?: number;
  shared?: boolean;
}

export interface Transaction {
  id: string;
  type: 'debit' | 'credit' | 'transfer';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  groupId?: string;
  venueId?: string;
  memberId?: string;
  fromMemberId?: string;
  toMemberId?: string;
  note?: string;
  channel?: string;
  subtotal?: number;
  discountPercent?: number;
  discountAmount?: number;
  totalShared?: number;
  participants?: TransactionParticipant[];
  settledAt?: string;
  restorationOfId?: string;
}

export interface QuickAmountOption {
  label: string;
  value: number;
}

export const avatarOptions: Array<{ id: AvatarIcon; label: string }> = [
  { id: 'UserRound', label: 'Classic' },
  { id: 'Flower2', label: 'Bloom' },
  { id: 'Ghost', label: 'Ghost' },
  { id: 'Baby', label: 'Baby' },
  { id: 'Cookie', label: 'Cookie' },
  { id: 'Brain', label: 'Brain' },
  { id: 'Gamepad2', label: 'Gamepad' },
  { id: 'Music4', label: 'Music' },
];

export const menuCategories: MenuCategory[] = ['Drinks', 'Food', 'Dessert', 'Other'];

export const quickTopUpAmounts: QuickAmountOption[] = [
  { label: '10k', value: 10_000 },
  { label: '20k', value: 20_000 },
  { label: '50k', value: 50_000 },
  { label: '100k', value: 100_000 },
  { label: '200k', value: 200_000 },
  { label: '500k', value: 500_000 },
];

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatVnd(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
}

export function formatShortVnd(value: number) {
  if (value >= 1_000_000) {
    return `${Math.round(value / 100_000) / 10}m`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }

  return `${value}`;
}

export function formatSignedVnd(value: number) {
  const prefix = value >= 0 ? '+' : '-';
  return `${prefix}${formatVnd(Math.abs(value))}`;
}

export function parseVndInput(value: string) {
  const numeric = Number(value.replace(/[^0-9]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatMonthDay(value: string, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  })
    .format(new Date(value))
    .toUpperCase();
}

export function formatDateAndTime(value: string, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatTimeLabel(value: string, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getBalanceTone(value: number) {
  if (value <= 0) {
    return 'text-destructive';
  }

  return 'text-success';
}

export function getMenuCategoryIcon(category: MenuCategory): IconName {
  switch (category) {
    case 'Drinks':
      return 'Coffee';
    case 'Food':
      return 'UtensilsCrossed';
    case 'Dessert':
      return 'ReceiptText';
    default:
      return 'Store';
  }
}
