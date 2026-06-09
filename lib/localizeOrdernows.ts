import type { AvatarIcon, MenuCategory } from '@/lib/ordernows';
import type { AppLanguage } from '@/lib/useLanguage';

const VI_ORDERNOWS_TEXT: Record<string, string> = {
  'No address yet': 'Chưa có địa chỉ',
  'No phone on file': 'Chưa có số điện thoại',
  Unknown: 'Chưa cập nhật',
  'New shared ledger crew': 'Nhóm chi tiêu chung mới',
  'Shared tab': 'Chi chung',
  'Shared Tab': 'Chi chung',
  'Wallet Top-up': 'Nạp tiền vào ví',
  'Manual recharge': 'Nạp tiền thủ công',
  'Cash transfer': 'Chuyển tiền mặt',
  'Top-up Reversal': 'Hoàn tác nạp tiền',
  'Restored wallet top-up': 'Đã hoàn tác khoản nạp ví',
  'Wallet Refund': 'Hoàn tiền vào ví',
  'Restored shared spending': 'Đã hoàn lại khoản chi chung',
  'Balance restore': 'Khôi phục số dư',
};

const MENU_CATEGORY_LABELS: Record<AppLanguage, Record<MenuCategory, string>> = {
  en: {
    Drinks: 'Drinks',
    Food: 'Food',
    Dessert: 'Dessert',
    Other: 'Other',
  },
  vi: {
    Drinks: 'Đồ uống',
    Food: 'Đồ ăn',
    Dessert: 'Tráng miệng',
    Other: 'Khác',
  },
};

const AVATAR_LABELS: Record<AppLanguage, Record<AvatarIcon, string>> = {
  en: {
    UserRound: 'Classic',
    Flower2: 'Bloom',
    Ghost: 'Ghost',
    Baby: 'Baby',
    Cookie: 'Cookie',
    Brain: 'Brain',
    Gamepad2: 'Gamepad',
    Music4: 'Music',
  },
  vi: {
    UserRound: 'Cơ bản',
    Flower2: 'Hoa',
    Ghost: 'Ma',
    Baby: 'Em bé',
    Cookie: 'Bánh',
    Brain: 'Trí tuệ',
    Gamepad2: 'Trò chơi',
    Music4: 'Âm nhạc',
  },
};

export function localizeOrdernowsText(value: string, language: AppLanguage) {
  if (language !== 'vi') {
    return value;
  }

  const sharedSplitSuffix = ' + shared split';

  if (value.endsWith(sharedSplitSuffix)) {
    const item = value.slice(0, -sharedSplitSuffix.length);
    return `${VI_ORDERNOWS_TEXT[item] ?? item} + phần chia chung`;
  }

  return VI_ORDERNOWS_TEXT[value] ?? value;
}

export function localizeMenuCategory(category: MenuCategory, language: AppLanguage) {
  return MENU_CATEGORY_LABELS[language][category];
}

export function localizeAvatarLabel(avatar: AvatarIcon, language: AppLanguage) {
  return AVATAR_LABELS[language][avatar];
}
