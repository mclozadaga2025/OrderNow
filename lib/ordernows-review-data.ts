import type { OrdernowsSnapshot } from '@/lib/ordernows-storage';
import { ORDERNOWS_STORAGE_VERSION } from '@/lib/ordernows-storage';

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export function createGooglePlayReviewSnapshot(): OrdernowsSnapshot {
  return {
    version: ORDERNOWS_STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    ledgerName: 'Google Play Review',
    currentUserId: 'reviewer',
    groups: [
      {
        id: 'review-team',
        name: 'Review Team',
        tagline: 'Demo order group for store review',
      },
    ],
    members: [
      {
        id: 'reviewer',
        name: 'Play Reviewer',
        initials: 'PR',
        phone: '+84 900 000 001',
        favoriteDrink: 'Iced coffee',
        balance: 135000,
        groupIds: ['review-team'],
        avatar: 'UserRound',
        role: 'Tester',
      },
      {
        id: 'mai',
        name: 'Mai Nguyen',
        initials: 'MN',
        phone: '+84 900 000 002',
        favoriteDrink: 'Milk tea',
        balance: 115000,
        groupIds: ['review-team'],
        avatar: 'Flower2',
      },
      {
        id: 'nam',
        name: 'Nam Tran',
        initials: 'NT',
        phone: '+84 900 000 003',
        favoriteDrink: 'Lemon tea',
        balance: 90000,
        groupIds: ['review-team'],
        avatar: 'Gamepad2',
      },
    ],
    venues: [
      {
        id: 'review-cafe',
        name: 'Review Cafe',
        address: 'Store review counter, Ho Chi Minh City',
        openUntil: '10 PM',
        icon: 'Coffee',
        menuItems: [
          {
            id: 'iced-coffee',
            name: 'Iced Coffee',
            price: 35000,
            description: 'Quick demo drink',
            category: 'Drinks',
          },
          {
            id: 'banh-mi',
            name: 'Banh Mi',
            price: 45000,
            description: 'Lunch item for split bills',
            category: 'Food',
          },
          {
            id: 'flan',
            name: 'Caramel Flan',
            price: 30000,
            description: 'Dessert option',
            category: 'Dessert',
          },
        ],
      },
    ],
    transactions: [
      {
        id: 'review-shared-tab',
        type: 'debit',
        title: 'Review Cafe Lunch',
        subtitle: 'Split across review team',
        amount: 190000,
        date: minutesAgo(20),
        groupId: 'review-team',
        venueId: 'review-cafe',
        note: 'Google Play reviewer can inspect, restore, or delete this row.',
        channel: 'Shared tab',
        subtotal: 205000,
        discountAmount: 15000,
        totalShared: 190000,
        participants: [
          {
            memberId: 'reviewer',
            item: 'Iced coffee + lunch share',
            amount: 65000,
            sharePercent: 34,
            shared: true,
          },
          {
            memberId: 'mai',
            item: 'Milk tea + lunch share',
            amount: 65000,
            sharePercent: 34,
            shared: true,
          },
          {
            memberId: 'nam',
            item: 'Lemon tea + lunch share',
            amount: 60000,
            sharePercent: 32,
            shared: true,
          },
        ],
      },
      {
        id: 'reviewer-top-up',
        type: 'credit',
        title: 'Wallet Top-up',
        subtitle: 'Play Reviewer',
        amount: 200000,
        date: minutesAgo(80),
        groupId: 'review-team',
        memberId: 'reviewer',
        channel: 'Cash',
      },
      {
        id: 'mai-top-up',
        type: 'credit',
        title: 'Wallet Top-up',
        subtitle: 'Mai Nguyen',
        amount: 180000,
        date: minutesAgo(90),
        groupId: 'review-team',
        memberId: 'mai',
        channel: 'Cash',
      },
      {
        id: 'nam-top-up',
        type: 'credit',
        title: 'Wallet Top-up',
        subtitle: 'Nam Tran',
        amount: 150000,
        date: minutesAgo(100),
        groupId: 'review-team',
        memberId: 'nam',
        channel: 'Cash',
      },
    ],
  };
}
