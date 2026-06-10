import { create } from 'zustand';
import {
  type AvatarIcon,
  type Group,
  type Member,
  type MenuCategory,
  type MenuItem,
  type Transaction,
  type TransactionParticipant,
  type Venue,
  getInitials,
  slugify,
} from '@/lib/ordernows';
import {
  createOrdernowsSnapshot,
  exportOrdernowsSnapshot,
  importOrdernowsSnapshotFromFile,
  loadStoredOrdernowsSnapshot,
  saveStoredOrdernowsSnapshot,
} from '@/lib/ordernows-storage';
import { createGooglePlayReviewSnapshot } from '@/lib/ordernows-review-data';

interface NewMemberInput {
  name: string;
  phone: string;
  favoriteDrink: string;
  groupId: string;
  avatar: AvatarIcon;
}

interface NewGroupInput {
  name: string;
  tagline: string;
}

interface DeleteGroupOptions {
  keepTransactionHistory: boolean;
}

interface NewMenuItemInput {
  name: string;
  price: number;
  description?: string;
  category: MenuCategory;
}

interface NewVenueInput {
  name: string;
  address: string;
  openUntil?: string;
}

interface NewTransactionInput {
  title: string;
  amount: number;
  groupId: string;
  venueId?: string;
  memberIds: string[];
  note?: string;
  subtotal?: number;
  discountPercent?: number;
  discountAmount?: number;
  totalShared?: number;
  participants?: TransactionParticipant[];
}

interface NewTransferInput {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  note?: string;
}

interface OrdernowsState {
  ledgerName: string;
  currentUserId: string;
  groups: Group[];
  members: Member[];
  venues: Venue[];
  transactions: Transaction[];
  hasHydrated: boolean;
  storageStatus: string;
  storageError?: string;
  hydrateFromLocalStorage: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: () => Promise<boolean>;
  loadGooglePlayReviewData: () => Promise<void>;
  addGroup: (input: NewGroupInput) => string;
  deleteGroup: (groupId: string, options: DeleteGroupOptions) => void;
  addMember: (input: NewMemberInput) => string;
  addMenuItem: (venueId: string, input: NewMenuItemInput) => string;
  updateMenuItem: (venueId: string, itemId: string, input: NewMenuItemInput) => void;
  deleteMenuItem: (venueId: string, itemId: string) => void;
  addVenue: (input: NewVenueInput) => string;
  topUpMember: (memberId: string, amount: number, note?: string) => string;
  transferMember: (input: NewTransferInput) => string;
  addTransaction: (input: NewTransactionInput) => string;
  deleteTransaction: (transactionId: string) => void;
  deleteTransactions: (transactionIds: string[]) => void;
  restoreTransaction: (transactionId: string) => void;
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeUniqueId(prefix: string, preferredId: string, existingIds: string[]) {
  const baseId = preferredId || makeId(prefix);
  let candidate = baseId;
  let suffix = 2;

  while (existingIds.includes(candidate)) {
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not update local JSON data.';
}

function splitParticipants(memberIds: string[], amount: number): TransactionParticipant[] {
  if (memberIds.length === 0 || amount <= 0) {
    return [];
  }

  const sharePercent = Math.round(100 / memberIds.length);
  const baseShare = Math.floor(amount / memberIds.length);
  let remaining = amount;

  return memberIds.map((memberId, index) => {
    const shareAmount = index === memberIds.length - 1 ? remaining : baseShare;
    remaining -= shareAmount;

    return {
      memberId,
      item: 'Shared tab',
      amount: shareAmount,
      sharePercent,
      shared: true,
    };
  });
}

function applyTransactionToMemberBalances(
  members: Member[],
  transaction: Transaction,
  direction: 1 | -1
) {
  const balanceChanges = new Map<string, number>();

  if (transaction.type === 'credit' && transaction.memberId) {
    balanceChanges.set(transaction.memberId, transaction.amount * direction);
  }

  if (transaction.type === 'debit') {
    transaction.participants?.forEach((participant) => {
      const currentChange = balanceChanges.get(participant.memberId) ?? 0;
      balanceChanges.set(participant.memberId, currentChange - participant.amount * direction);
    });
  }

  if (transaction.type === 'transfer') {
    if (transaction.fromMemberId) {
      const currentChange = balanceChanges.get(transaction.fromMemberId) ?? 0;
      balanceChanges.set(transaction.fromMemberId, currentChange - transaction.amount * direction);
    }

    if (transaction.toMemberId) {
      const currentChange = balanceChanges.get(transaction.toMemberId) ?? 0;
      balanceChanges.set(transaction.toMemberId, currentChange + transaction.amount * direction);
    }
  }

  return members.map((member) => {
    const balanceChange = balanceChanges.get(member.id);

    if (!balanceChange) {
      return member;
    }

    return {
      ...member,
      balance: member.balance + balanceChange,
    };
  });
}

function transactionReferencesGroupOrMembers(
  transaction: Transaction,
  groupId: string,
  memberIds: Set<string>
) {
  return (
    transaction.groupId === groupId ||
    Boolean(transaction.memberId && memberIds.has(transaction.memberId)) ||
    Boolean(transaction.fromMemberId && memberIds.has(transaction.fromMemberId)) ||
    Boolean(transaction.toMemberId && memberIds.has(transaction.toMemberId)) ||
    Boolean(
      transaction.participants?.some((participant) => memberIds.has(participant.memberId))
    )
  );
}

function createRestorationTransactions(transaction: Transaction): Transaction[] {
  const restoredAt = new Date().toISOString();

  if (transaction.type === 'credit' && transaction.memberId) {
    return [
      {
        id: makeId('restore'),
        type: 'debit',
        title: 'Top-up Reversal',
        subtitle: 'Restored wallet top-up',
        amount: transaction.amount,
        date: restoredAt,
        memberId: transaction.memberId,
        channel: 'Balance restore',
        restorationOfId: transaction.id,
      },
    ];
  }

  if (transaction.type === 'transfer' && transaction.fromMemberId && transaction.toMemberId) {
    return [
      {
        id: makeId('transfer-restore'),
        type: 'transfer',
        title: 'Transfer Reversal',
        subtitle: 'Restored member transfer',
        amount: transaction.amount,
        date: restoredAt,
        groupId: transaction.groupId,
        fromMemberId: transaction.toMemberId,
        toMemberId: transaction.fromMemberId,
        channel: 'Balance restore',
        restorationOfId: transaction.id,
      },
    ];
  }

  const restoredAmounts = new Map<string, number>();

  transaction.participants?.forEach((participant) => {
    restoredAmounts.set(
      participant.memberId,
      (restoredAmounts.get(participant.memberId) ?? 0) + participant.amount
    );
  });

  return Array.from(restoredAmounts, ([memberId, amount]) => ({
    id: makeId('refund'),
    type: 'credit',
    title: 'Wallet Refund',
    subtitle: 'Restored shared spending',
    amount,
    date: restoredAt,
    groupId: transaction.groupId,
    venueId: transaction.venueId,
    memberId,
    channel: 'Balance restore',
    restorationOfId: transaction.id,
  }));
}

export const useOrdernowsStore = create<OrdernowsState>((set, get) => {
  let pendingPersistence:
    | {
        snapshot: ReturnType<typeof createOrdernowsSnapshot>;
        status?: string;
      }
    | undefined;
  let persistenceTimer: ReturnType<typeof setTimeout> | undefined;
  let isPersisting = false;

  function schedulePersistence() {
    if (isPersisting || persistenceTimer || !pendingPersistence) {
      return;
    }

    persistenceTimer = setTimeout(() => {
      persistenceTimer = undefined;
      flushPersistence();
    }, 0);
  }

  function flushPersistence() {
    if (isPersisting || !pendingPersistence) {
      return;
    }

    const persistence = pendingPersistence;
    pendingPersistence = undefined;
    isPersisting = true;

    void saveStoredOrdernowsSnapshot(persistence.snapshot)
      .then(() => {
        if (!pendingPersistence) {
          set({
            storageStatus: persistence.status ?? 'Local JSON saved.',
            storageError: undefined,
          });
        }
      })
      .catch((error: unknown) => {
        set({ storageError: getErrorMessage(error) });
      })
      .finally(() => {
        isPersisting = false;
        schedulePersistence();
      });
  }

  function persistCurrentState(status?: string) {
    pendingPersistence = {
      snapshot: createOrdernowsSnapshot(get()),
      status,
    };
    schedulePersistence();
  }

  return {
    ledgerName: 'Local Ledger',
    currentUserId: '',
    groups: [],
    members: [],
    venues: [],
    transactions: [],
    hasHydrated: false,
    storageStatus: 'Loading local JSON...',
    storageError: undefined,
    hydrateFromLocalStorage: async () => {
      try {
        const snapshot = await loadStoredOrdernowsSnapshot();

        if (!snapshot) {
          set({
            hasHydrated: true,
            storageStatus: 'No local JSON yet. Create or import data to start.',
            storageError: undefined,
          });
          return;
        }

        set({
          ledgerName: snapshot.ledgerName,
          currentUserId: snapshot.currentUserId,
          groups: snapshot.groups,
          members: snapshot.members,
          venues: snapshot.venues,
          transactions: snapshot.transactions,
          hasHydrated: true,
          storageStatus: 'Local JSON loaded.',
          storageError: undefined,
        });
      } catch (error) {
        set({
          hasHydrated: true,
          storageStatus: 'Local JSON could not be loaded.',
          storageError: getErrorMessage(error),
        });
      }
    },
    exportData: async () => {
      try {
        const result = await exportOrdernowsSnapshot(createOrdernowsSnapshot(get()));
        set({
          storageStatus: `Exported ${result.fileName}.`,
          storageError: undefined,
        });
      } catch (error) {
        set({ storageError: getErrorMessage(error) });
      }
    },
    importData: async () => {
      try {
        const snapshot = await importOrdernowsSnapshotFromFile();

        if (!snapshot) {
          set({
            storageStatus: 'Import canceled.',
            storageError: undefined,
          });
          return false;
        }

        set({
          ledgerName: snapshot.ledgerName,
          currentUserId: snapshot.currentUserId,
          groups: snapshot.groups,
          members: snapshot.members,
          venues: snapshot.venues,
          transactions: snapshot.transactions,
          hasHydrated: true,
          storageStatus: `Imported ${snapshot.groups.length} groups, ${snapshot.members.length} members, ${snapshot.venues.length} venues.`,
          storageError: undefined,
        });
        await saveStoredOrdernowsSnapshot(snapshot);
        return true;
      } catch (error) {
        set({ storageError: getErrorMessage(error) });
        return false;
      }
    },
    loadGooglePlayReviewData: async () => {
      try {
        const currentState = get();
        const hasLocalLedger =
          currentState.groups.length > 0 ||
          currentState.members.length > 0 ||
          currentState.venues.length > 0 ||
          currentState.transactions.length > 0;

        if (hasLocalLedger) {
          set({
            storageStatus: 'Google Play review access opened with current local JSON.',
            storageError: undefined,
          });
          return;
        }

        const snapshot = createGooglePlayReviewSnapshot();

        set({
          ledgerName: snapshot.ledgerName,
          currentUserId: snapshot.currentUserId,
          groups: snapshot.groups,
          members: snapshot.members,
          venues: snapshot.venues,
          transactions: snapshot.transactions,
          hasHydrated: true,
          storageStatus: 'Google Play review demo loaded.',
          storageError: undefined,
        });
        await saveStoredOrdernowsSnapshot(snapshot);
      } catch (error) {
        set({ storageError: getErrorMessage(error) });
      }
    },
    addGroup: (input) => {
      const id = makeUniqueId('group', slugify(input.name), get().groups.map((group) => group.id));
      const nextGroup: Group = {
        id,
        name: input.name,
        tagline: input.tagline || 'New shared ledger crew',
      };

      set((state) => ({
        groups: [nextGroup, ...state.groups],
      }));
      persistCurrentState('Group saved to local JSON.');

      return id;
    },
    deleteGroup: (groupId, { keepTransactionHistory }) => {
      const deletedMemberIds = new Set(
        get()
          .members.filter((member) => member.groupIds.includes(groupId))
          .map((member) => member.id)
      );

      set((state) => {
        const members = state.members.filter((member) => !deletedMemberIds.has(member.id));

        return {
          currentUserId: deletedMemberIds.has(state.currentUserId)
            ? members[0]?.id ?? ''
            : state.currentUserId,
          groups: state.groups.filter((group) => group.id !== groupId),
          members,
          transactions: keepTransactionHistory
            ? state.transactions
            : state.transactions.filter(
                (transaction) =>
                  !transactionReferencesGroupOrMembers(transaction, groupId, deletedMemberIds)
              ),
        };
      });
      persistCurrentState(
        keepTransactionHistory
          ? 'Group deleted and transaction history kept in local JSON.'
          : 'Group and transaction history deleted from local JSON.'
      );
    },
    addMember: (input) => {
      const id = makeUniqueId('member', slugify(input.name), get().members.map((member) => member.id));
      const nextMember: Member = {
        id,
        name: input.name,
        initials: getInitials(input.name),
        phone: input.phone,
        favoriteDrink: input.favoriteDrink || 'Unknown',
        balance: 0,
        groupIds: input.groupId ? [input.groupId] : [],
        avatar: input.avatar,
      };

      set((state) => ({
        currentUserId: state.currentUserId || id,
        members: [nextMember, ...state.members],
      }));
      persistCurrentState('Member saved to local JSON.');

      return id;
    },
    addMenuItem: (venueId, input) => {
      const venue = get().venues.find((entry) => entry.id === venueId);
      const itemId = makeUniqueId(
        'item',
        slugify(input.name),
        venue?.menuItems.map((item) => item.id) ?? []
      );
      const nextItem: MenuItem = {
        id: itemId,
        name: input.name,
        price: input.price,
        description: input.description,
        category: input.category,
      };

      set((state) => ({
        venues: state.venues.map((entry) =>
          entry.id === venueId
            ? {
                ...entry,
                menuItems: [...entry.menuItems, nextItem],
              }
            : entry
        ),
      }));
      persistCurrentState('Menu item saved to local JSON.');

      return itemId;
    },
    updateMenuItem: (venueId, itemId, input) => {
      set((state) => ({
        venues: state.venues.map((entry) =>
          entry.id === venueId
            ? {
                ...entry,
                menuItems: entry.menuItems.map((item) => (item.id === itemId ? { ...item, ...input } : item)),
              }
            : entry
        ),
      }));
      persistCurrentState('Menu item updated in local JSON.');
    },
    deleteMenuItem: (venueId, itemId) => {
      set((state) => ({
        venues: state.venues.map((entry) =>
          entry.id === venueId
            ? {
                ...entry,
                menuItems: entry.menuItems.filter((item) => item.id !== itemId),
              }
            : entry
        ),
      }));
      persistCurrentState('Menu item deleted from local JSON.');
    },
    addVenue: (input) => {
      const venueId = makeUniqueId('venue', slugify(input.name), get().venues.map((venue) => venue.id));
      const nextVenue: Venue = {
        id: venueId,
        name: input.name,
        address: input.address,
        openUntil: input.openUntil || '10 PM',
        icon: input.name.toLowerCase().includes('cafe') ? 'Coffee' : 'Store',
        menuItems: [],
      };

      set((state) => ({
        venues: [nextVenue, ...state.venues],
      }));
      persistCurrentState('Venue saved to local JSON.');

      return venueId;
    },
    topUpMember: (memberId, amount, note) => {
      const member = get().members.find((entry) => entry.id === memberId);
      const transactionId = makeId('credit');

      if (!member) {
        return transactionId;
      }

      set((state) => ({
        members: state.members.map((entry) =>
          entry.id === memberId
            ? {
                ...entry,
                balance: entry.balance + amount,
              }
            : entry
        ),
        transactions: [
          {
            id: transactionId,
            type: 'credit',
            title: 'Wallet Top-up',
            subtitle: note || 'Manual recharge',
            amount,
            date: new Date().toISOString(),
            memberId,
            channel: note || 'Cash transfer',
          },
          ...state.transactions,
        ],
      }));
      persistCurrentState('Top-up saved to local JSON.');

      return transactionId;
    },
    transferMember: (input) => {
      const fromMember = get().members.find((entry) => entry.id === input.fromMemberId);
      const toMember = get().members.find((entry) => entry.id === input.toMemberId);
      const transactionId = makeId('transfer');

      if (!fromMember || !toMember || fromMember.id === toMember.id || input.amount <= 0) {
        return transactionId;
      }

      const sharedGroupId =
        fromMember.groupIds.find((groupId) => toMember.groupIds.includes(groupId)) ??
        fromMember.groupIds[0] ??
        toMember.groupIds[0];

      set((state) => ({
        members: state.members.map((entry) => {
          if (entry.id === fromMember.id) {
            return {
              ...entry,
              balance: entry.balance - input.amount,
            };
          }

          if (entry.id === toMember.id) {
            return {
              ...entry,
              balance: entry.balance + input.amount,
            };
          }

          return entry;
        }),
        transactions: [
          {
            id: transactionId,
            type: 'transfer',
            title: 'Member Transfer',
            subtitle: `${fromMember.name} -> ${toMember.name}`,
            amount: input.amount,
            date: new Date().toISOString(),
            groupId: sharedGroupId,
            fromMemberId: fromMember.id,
            toMemberId: toMember.id,
            note: input.note,
            channel: 'Wallet transfer',
          },
          ...state.transactions,
        ],
      }));
      persistCurrentState('Transfer saved to local JSON.');

      return transactionId;
    },
    addTransaction: (input) => {
      const transactionId = makeId('txn');
      const participants = input.participants?.length
        ? input.participants
        : splitParticipants(input.memberIds, input.amount);
      const group = get().groups.find((entry) => entry.id === input.groupId);

      set((state) => ({
        members: state.members.map((member) => {
          const participantTotal = participants.reduce(
            (sum, entry) => (entry.memberId === member.id ? sum + entry.amount : sum),
            0
          );

          if (!participantTotal) {
            return member;
          }

          return {
            ...member,
            balance: member.balance - participantTotal,
          };
        }),
        transactions: [
          {
            id: transactionId,
            type: 'debit',
            title: input.title,
            subtitle: group?.name || 'Shared tab',
            amount: input.amount,
            date: new Date().toISOString(),
            groupId: input.groupId,
            venueId: input.venueId,
            note: input.note,
            participants,
            subtotal: input.subtotal ?? input.amount,
            discountPercent: input.discountPercent,
            discountAmount: input.discountAmount,
            totalShared: input.totalShared ?? input.amount,
          },
          ...state.transactions,
        ],
      }));
      persistCurrentState('Transaction saved to local JSON.');

      return transactionId;
    },
    deleteTransaction: (transactionId) => {
      set((state) => ({
        transactions: state.transactions.filter((entry) => entry.id !== transactionId),
      }));
      persistCurrentState('Transaction deleted from local JSON.');
    },
    deleteTransactions: (transactionIds) => {
      const deletedTransactionIds = new Set(transactionIds);

      if (deletedTransactionIds.size === 0) {
        return;
      }

      set((state) => ({
        transactions: state.transactions.filter((entry) => !deletedTransactionIds.has(entry.id)),
      }));
      persistCurrentState('Selected transactions deleted from local JSON.');
    },
    restoreTransaction: (transactionId) => {
      const transaction = get().transactions.find((entry) => entry.id === transactionId);

      if (!transaction) {
        return;
      }

      set((state) => ({
        members: applyTransactionToMemberBalances(state.members, transaction, -1),
        transactions: [
          ...createRestorationTransactions(transaction),
          ...state.transactions.filter((entry) => entry.id !== transactionId),
        ],
      }));
      persistCurrentState('Transaction restored in local JSON.');
    },
  };
});
