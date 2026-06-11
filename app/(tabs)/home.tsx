import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { LanguageToggle } from '@/components/LanguageToggle';
import { HomeBanner } from '@/components/ads/home-banner';
import { TransactionRow } from '@/components/ordernows/transaction-row';
import {
  ActionPill,
  FilterChip,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
  StatTile,
} from '@/components/ordernows/primitives';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import LucideIcon from '@/lib/icons/LucideIcon';
import { localizeStorageStatus } from '@/lib/localizeStorageStatus';
import { formatShortVnd, formatVnd, type Transaction } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const HOME_COPY = {
  en: {
    title: 'Home Ledger',
    subtitle:
      'Chronological board for debits, top-ups, transfers, and venue activity stored in your local JSON ledger.',
    newTransaction: 'New Transaction',
    dispatchBoard: 'Dispatch Board',
    dispatchTitle: 'Shared spending stays readable without seeded demo data.',
    dispatchDescription:
      'Review who topped up, where the tab happened, and which group absorbed the spend from your saved JSON.',
    rows: 'Rows',
    localJson: 'Local JSON',
    autosaveActive: 'Autosave active',
    loadingStorage: 'Loading storage',
    totalSpent: 'Total Spent',
    debitRowsInScope: 'Debit rows in scope',
    available: 'Available',
    memberBalancePool: 'Member balance pool',
    ledgerState: 'Ledger State',
    allGroups: 'All Groups',
    selectedGroup: 'Selected Group',
    trackedMembers: (memberCount: number, groupCount: number) =>
      `${memberCount} members tracked with ${groupCount} active groups on file.`,
    netPulse: 'Net Pulse',
    groupFilter: 'Group Filter',
    scopeTheBoard: 'Scope the board',
    groupFilterDescription: 'Swipe sideways to browse groups, then tap one to narrow the feed.',
    createGroup: 'Create group',
    activityFilter: 'Activity Filter',
    ledgerDirection: 'Ledger direction',
    activityFilterDescription: 'Separate outgoing tabs, incoming top-ups, and member transfers.',
    allActivity: 'All Activity',
    debit: 'Debit',
    credit: 'Credit',
    transfer: 'Transfer',
    recentActivity: 'Recent Activity',
    latestTransactions: 'Latest transactions',
    latestTransactionsDescription: 'Tap any ledger row to inspect participants and totals.',
    loadMore: 'Load More',
    confirmDeleteTitle: 'Delete transaction?',
    confirmDeleteDescription:
      'Choose delete to remove only this ledger row, or restore to also undo its balance changes.',
    quickDelete: 'Quick Delete',
    quickDeleteDescription: 'Select individual rows or every transaction in the current filter.',
    cancel: 'Cancel',
    selectAll: 'Select All',
    clearAll: 'Clear All',
    selectedRows: (count: number) => `${count} selected`,
    deleteSelected: (count: number) => `Delete ${count}`,
    confirmBulkDeleteTitle: (count: number) => `Delete ${count} transactions?`,
    confirmBulkDeleteDescription:
      'The selected ledger rows will be permanently removed. Current balances stay unchanged.',
    delete: 'Delete',
    restore: 'Restore',
    noRowsYet: 'No rows yet',
    emptyDescription: 'Create the first transaction or import an Ordernows JSON file to start the running ledger.',
  },
  vi: {
    title: 'Sổ thu chi',
    subtitle:
      'Theo dõi các khoản chi, nạp tiền, trao đổi ví và hoạt động tại địa điểm từ dữ liệu JSON trên thiết bị.',
    newTransaction: 'Tạo giao dịch',
    dispatchBoard: 'Bảng theo dõi',
    dispatchTitle: 'Các khoản chi chung luôn rõ ràng và dễ kiểm tra.',
    dispatchDescription:
      'Xem ai đã nạp tiền, giao dịch diễn ra ở đâu và nhóm nào đã sử dụng khoản chi từ dữ liệu JSON đã lưu.',
    rows: 'Dòng',
    localJson: 'JSON cục bộ',
    autosaveActive: 'Đang tự động lưu',
    loadingStorage: 'Đang tải dữ liệu',
    totalSpent: 'Tổng đã chi',
    debitRowsInScope: 'Các khoản chi trong phạm vi',
    available: 'Khả dụng',
    memberBalancePool: 'Tổng số dư thành viên',
    ledgerState: 'Trạng thái sổ',
    allGroups: 'Tất cả nhóm',
    selectedGroup: 'Nhóm đã chọn',
    trackedMembers: (memberCount: number, groupCount: number) =>
      `Đang theo dõi ${memberCount} thành viên trong ${groupCount} nhóm hoạt động.`,
    netPulse: 'Số dư ròng',
    groupFilter: 'Lọc theo nhóm',
    scopeTheBoard: 'Chọn phạm vi',
    groupFilterDescription: 'Vuốt ngang để xem các nhóm, sau đó chạm để lọc danh sách.',
    createGroup: 'Tạo nhóm',
    activityFilter: 'Lọc hoạt động',
    ledgerDirection: 'Loại giao dịch',
    activityFilterDescription: 'Tách riêng khoản chi, khoản nạp và giao dịch trao đổi ví.',
    allActivity: 'Tất cả',
    debit: 'Chi',
    credit: 'Nạp',
    transfer: 'Trao đổi',
    recentActivity: 'Hoạt động gần đây',
    latestTransactions: 'Giao dịch mới nhất',
    latestTransactionsDescription: 'Chạm vào một giao dịch để xem người tham gia và tổng tiền.',
    loadMore: 'Xem thêm',
    confirmDeleteTitle: 'Xóa giao dịch?',
    confirmDeleteDescription:
      'Chọn xóa để chỉ bỏ dòng giao dịch, hoặc khôi phục để bỏ giao dịch và hoàn tác số dư.',
    quickDelete: 'Xóa nhanh',
    quickDeleteDescription: 'Tick từng giao dịch hoặc chọn tất cả giao dịch trong bộ lọc hiện tại.',
    cancel: 'Hủy',
    selectAll: 'Chọn tất cả',
    clearAll: 'Bỏ chọn',
    selectedRows: (count: number) => `Đã chọn ${count}`,
    deleteSelected: (count: number) => `Xóa ${count}`,
    confirmBulkDeleteTitle: (count: number) => `Xóa ${count} giao dịch?`,
    confirmBulkDeleteDescription:
      'Các dòng giao dịch đã chọn sẽ bị xóa vĩnh viễn. Số dư hiện tại không thay đổi.',
    delete: 'Xóa',
    restore: 'Khôi phục',
    noRowsYet: 'Chưa có giao dịch',
    emptyDescription: 'Tạo giao dịch đầu tiên hoặc nhập tệp JSON Ordernows để bắt đầu theo dõi.',
  },
} as const;

export default function HomeScreen() {
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [transactionType, setTransactionType] = useState<'all' | 'debit' | 'credit' | 'transfer'>('all');
  const [visibleCount, setVisibleCount] = useState(4);
  const [pendingDeleteTransaction, setPendingDeleteTransaction] = useState<Transaction | null>(null);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(
    () => new Set()
  );
  const ledgerName = useOrdernowsStore((state) => state.ledgerName);
  const groups = useOrdernowsStore((state) => state.groups);
  const members = useOrdernowsStore((state) => state.members);
  const venues = useOrdernowsStore((state) => state.venues);
  const transactions = useOrdernowsStore((state) => state.transactions);
  const hasHydrated = useOrdernowsStore((state) => state.hasHydrated);
  const storageStatus = useOrdernowsStore((state) => state.storageStatus);
  const storageError = useOrdernowsStore((state) => state.storageError);
  const deleteTransaction = useOrdernowsStore((state) => state.deleteTransaction);
  const deleteTransactions = useOrdernowsStore((state) => state.deleteTransactions);
  const restoreTransaction = useOrdernowsStore((state) => state.restoreTransaction);
  const { language, locale } = useLanguage();
  const copy = HOME_COPY[language];

  const scopedMembers = useMemo(() => {
    if (selectedGroupId === 'all') {
      return members;
    }

    return members.filter((member) => member.groupIds.includes(selectedGroupId));
  }, [members, selectedGroupId]);

  const scopedMemberIds = useMemo(
    () => new Set(scopedMembers.map((member) => member.id)),
    [scopedMembers]
  );

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesGroup =
          selectedGroupId === 'all' ||
          transaction.groupId === selectedGroupId ||
          Boolean(transaction.memberId && scopedMemberIds.has(transaction.memberId)) ||
          Boolean(transaction.fromMemberId && scopedMemberIds.has(transaction.fromMemberId)) ||
          Boolean(transaction.toMemberId && scopedMemberIds.has(transaction.toMemberId)) ||
          Boolean(
            transaction.participants?.some((participant) =>
              scopedMemberIds.has(participant.memberId)
            )
          );
        const matchesType = transactionType === 'all' || transaction.type === transactionType;

        return matchesGroup && matchesType;
      })
      .sort((current, next) => new Date(next.date).getTime() - new Date(current.date).getTime());
  }, [scopedMemberIds, selectedGroupId, transactionType, transactions]);

  useEffect(() => {
    setVisibleCount(4);
    setSelectedTransactionIds(new Set());
    setIsBulkDeleteDialogOpen(false);
  }, [selectedGroupId, transactionType]);

  useEffect(() => {
    if (selectedGroupId !== 'all' && !groups.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId('all');
    }
  }, [groups, selectedGroupId]);

  const selectedTransactions = useMemo(
    () =>
      filteredTransactions.filter((transaction) =>
        selectedTransactionIds.has(transaction.id)
      ),
    [filteredTransactions, selectedTransactionIds]
  );
  const selectedTransactionCount = selectedTransactions.length;
  const allFilteredTransactionsSelected =
    filteredTransactions.length > 0 &&
    selectedTransactionCount === filteredTransactions.length;

  const { totalCredit, totalDebit } = useMemo(() => {
    let credit = 0;
    let debit = 0;

    for (const transaction of filteredTransactions) {
      if (transaction.type === 'credit') {
        credit += transaction.amount;
      } else if (transaction.type === 'debit') {
        debit += transaction.amount;
      }
    }

    return { totalCredit: credit, totalDebit: debit };
  }, [filteredTransactions]);
  const availableBalance = scopedMembers.reduce((sum, member) => sum + member.balance, 0);

  const currentGroupName =
    selectedGroupId === 'all'
      ? copy.allGroups
      : groups.find((group) => group.id === selectedGroupId)?.name ?? copy.selectedGroup;

  const hasMoreTransactions = filteredTransactions.length > visibleCount;
  const todayBadge = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
      })
        .format(new Date())
        .toUpperCase(),
    [locale]
  );

  function handleDeleteRequest(transaction: Transaction) {
    setPendingDeleteTransaction(transaction);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteTransaction) {
      return;
    }

    deleteTransaction(pendingDeleteTransaction.id);
    setPendingDeleteTransaction(null);
  }

  function handleRestoreTransaction() {
    if (!pendingDeleteTransaction) {
      return;
    }

    restoreTransaction(pendingDeleteTransaction.id);
    setPendingDeleteTransaction(null);
  }

  function handleStartBulkDelete() {
    setSelectedTransactionIds(new Set());
    setIsBulkDeleteMode(true);
  }

  function handleCancelBulkDelete() {
    setSelectedTransactionIds(new Set());
    setIsBulkDeleteDialogOpen(false);
    setIsBulkDeleteMode(false);
  }

  function handleToggleTransaction(transactionId: string) {
    setSelectedTransactionIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(transactionId)) {
        nextIds.delete(transactionId);
      } else {
        nextIds.add(transactionId);
      }

      return nextIds;
    });
  }

  function handleToggleAllTransactions() {
    if (allFilteredTransactionsSelected) {
      setSelectedTransactionIds(new Set());
      return;
    }

    setSelectedTransactionIds(
      new Set(filteredTransactions.map((transaction) => transaction.id))
    );
  }

  function handleConfirmBulkDelete() {
    deleteTransactions(selectedTransactions.map((transaction) => transaction.id));
    handleCancelBulkDelete();
  }

  return (
    <OrdernowsScreen
      title={copy.title}
      subtitle={copy.subtitle}
      badge={`${ledgerName.toUpperCase()} / ${todayBadge}`}
      headerAction={<LanguageToggle />}>
      <PaperCard className="mb-6 p-5">
        <View className="mb-5 flex-row gap-2">
          <ActionPill
            label={copy.newTransaction}
            icon="Plus"
            onPress={() => router.push('/transaction/new')}
            className="flex-1"
          />
        </View>

        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-caption uppercase tracking-[1.8px] text-muted-foreground">
              {copy.dispatchBoard}
            </Text>
            <Text className="mt-2 text-h2 text-foreground uppercase">
              {copy.dispatchTitle}
            </Text>
            <Text className="mt-2 text-body text-muted-foreground">
              {copy.dispatchDescription}
            </Text>
          </View>

          <View className="min-w-[56px] items-center rounded-[24px] border-2 border-border bg-background px-4 py-3">
            <Text className="w-full text-center text-caption uppercase tracking-[1.4px] text-muted-foreground">
              {copy.rows}
            </Text>
            <Text
              className="mt-2 w-full text-center text-h2 leading-none text-foreground uppercase"
              style={{ fontVariant: ['tabular-nums'] }}>
              {filteredTransactions.length}
            </Text>
          </View>
        </View>
      </PaperCard>

      <PaperCard className="mb-6 p-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">
              {copy.localJson}
            </Text>
            <Text className="mt-2 text-h3 text-foreground uppercase">
              {hasHydrated ? copy.autosaveActive : copy.loadingStorage}
            </Text>
            <Text className="mt-1 text-body text-muted-foreground">
              {storageError ?? localizeStorageStatus(storageStatus, language)}
            </Text>
          </View>

          <View className="min-w-[56px] items-center rounded-[22px] border-2 border-border bg-secondary px-4 py-3">
            <Text className="w-full text-center text-caption uppercase tracking-[1.4px] text-muted-foreground">
              JSON
            </Text>
            <Text
              className="mt-1 w-full text-center text-h3 leading-none text-foreground uppercase"
              style={{ fontVariant: ['tabular-nums'] }}>
              {groups.length + members.length + venues.length + transactions.length}
            </Text>
          </View>
        </View>
      </PaperCard>

      <View className="mb-6 flex-row gap-3">
        <StatTile label={copy.totalSpent} value={formatVnd(totalDebit)} hint={copy.debitRowsInScope} />
        <StatTile label={copy.available} value={formatVnd(availableBalance)} hint={copy.memberBalancePool} />
      </View>

      <PaperCard className="mb-6 flex-row items-center justify-between gap-4 p-5">
        <View className="flex-1">
          <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{copy.ledgerState}</Text>
          <Text className="mt-2 text-h3 text-foreground uppercase">{currentGroupName}</Text>
          <Text className="mt-1 text-body text-muted-foreground">
            {copy.trackedMembers(members.length, groups.length)}
          </Text>
        </View>

        <View className="rounded-[22px] border-2 border-border bg-secondary px-4 py-3">
          <Text className="text-caption uppercase tracking-[1.4px] text-muted-foreground">{copy.netPulse}</Text>
          <Text className="mt-1 text-h3 text-foreground uppercase">
            {formatShortVnd(totalCredit - totalDebit)}
          </Text>
        </View>
      </PaperCard>

      <SectionHeading
        eyebrow={copy.groupFilter}
        title={copy.scopeTheBoard}
        description={copy.groupFilterDescription}
        action={
          <Pressable
            accessibilityLabel={copy.createGroup}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/group/manage',
                params: { intent: 'create' },
              })
            }
            className="h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border-2 border-border bg-card active:opacity-70">
            <LucideIcon name="Plus" className="text-foreground" size={20} strokeWidth={2} />
          </Pressable>
        }
      />

      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        className="mb-6">
        <FilterChip
          label={copy.allGroups}
          icon="Layers"
          active={selectedGroupId === 'all'}
          onPress={() => setSelectedGroupId('all')}
        />
        {groups.map((group) => (
          <FilterChip
            key={group.id}
            label={group.name}
            active={selectedGroupId === group.id}
            onPress={() => setSelectedGroupId(group.id)}
          />
        ))}
      </ScrollView>

      <SectionHeading
        eyebrow={copy.activityFilter}
        title={copy.ledgerDirection}
        description={copy.activityFilterDescription}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <FilterChip
          label={copy.allActivity}
          icon="ListFilter"
          active={transactionType === 'all'}
          onPress={() => setTransactionType('all')}
        />
        <FilterChip
          label={copy.debit}
          icon="ArrowDownLeft"
          active={transactionType === 'debit'}
          onPress={() => setTransactionType('debit')}
        />
        <FilterChip
          label={copy.credit}
          icon="ArrowUpRight"
          active={transactionType === 'credit'}
          onPress={() => setTransactionType('credit')}
        />
        <FilterChip
          label={copy.transfer}
          icon="ArrowLeftRight"
          active={transactionType === 'transfer'}
          onPress={() => setTransactionType('transfer')}
        />
      </ScrollView>

      <SectionHeading
        eyebrow={copy.recentActivity}
        title={copy.latestTransactions}
        description={copy.latestTransactionsDescription}
        action={
          hasMoreTransactions ? (
            <ActionPill
              label={copy.loadMore}
              icon="ArrowDown"
              tone="secondary"
              onPress={() => setVisibleCount((count) => count + 4)}
            />
          ) : undefined
        }
      />

      {filteredTransactions.length > 0 ? (
        isBulkDeleteMode ? (
          <PaperCard className="mb-4 p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-h4 text-foreground uppercase">{copy.quickDelete}</Text>
                <Text className="mt-1 text-caption uppercase tracking-[1.4px] text-muted-foreground">
                  {copy.selectedRows(selectedTransactionCount)}
                </Text>
              </View>
              <ActionPill
                label={copy.cancel}
                icon="X"
                tone="neutral"
                onPress={handleCancelBulkDelete}
                className="px-3 py-2.5"
              />
            </View>

            <Text className="mt-3 text-body text-muted-foreground">
              {copy.quickDeleteDescription}
            </Text>

            <View className="mt-4 flex-row gap-2">
              <ActionPill
                label={allFilteredTransactionsSelected ? copy.clearAll : copy.selectAll}
                icon={allFilteredTransactionsSelected ? 'Square' : 'ListChecks'}
                tone="secondary"
                onPress={handleToggleAllTransactions}
                className="flex-1 px-3"
              />
              <ActionPill
                label={copy.deleteSelected(selectedTransactionCount)}
                icon="Trash2"
                tone="destructive"
                disabled={selectedTransactionCount === 0}
                onPress={() => setIsBulkDeleteDialogOpen(true)}
                className="flex-1 px-3"
              />
            </View>
          </PaperCard>
        ) : (
          <View className="mb-4 items-start">
            <ActionPill
              label={copy.quickDelete}
              icon="ListChecks"
              tone="secondary"
              onPress={handleStartBulkDelete}
            />
          </View>
        )
      ) : null}

      {filteredTransactions.slice(0, visibleCount).map((transaction) => {
        const subtitle =
          transaction.groupId && transaction.groupId !== 'all'
            ? groups.find((group) => group.id === transaction.groupId)?.name ?? transaction.subtitle
            : transaction.subtitle;

        return (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            subtitle={subtitle}
            language={language}
            selectionMode={isBulkDeleteMode}
            selected={selectedTransactionIds.has(transaction.id)}
            onToggleSelected={() => handleToggleTransaction(transaction.id)}
            onDelete={
              transaction.restorationOfId ? undefined : () => handleDeleteRequest(transaction)
            }
            onPress={() =>
              router.push({
                pathname: '/transaction/[id]',
                params: { id: transaction.id },
              })
            }
          />
        );
      })}

      {filteredTransactions.length === 0 ? (
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.noRowsYet}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.emptyDescription}
          </Text>
        </PaperCard>
      ) : null}

      <HomeBanner />

      <AlertDialog
        open={Boolean(pendingDeleteTransaction)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteTransaction(null);
          }
        }}>
        <AlertDialogContent className="w-full max-w-[360px] rounded-[28px] border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase">{copy.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{copy.confirmDeleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex-row">
            <AlertDialogAction
              onPress={handleRestoreTransaction}
              className="flex-1 rounded-[18px] border-2 border-border bg-background">
              <Text className="text-button text-foreground uppercase">{copy.restore}</Text>
            </AlertDialogAction>
            <AlertDialogAction
              onPress={handleConfirmDelete}
              className="flex-1 rounded-[18px] bg-destructive">
              <Text className="text-button text-destructive-foreground uppercase">{copy.delete}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent className="w-full max-w-[360px] rounded-[28px] border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase">
              {copy.confirmBulkDeleteTitle(selectedTransactionCount)}
            </AlertDialogTitle>
            <AlertDialogDescription>{copy.confirmBulkDeleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex-row">
            <AlertDialogCancel className="flex-1 rounded-[18px] border-2 border-border bg-background">
              <Text className="text-button text-foreground uppercase">{copy.cancel}</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={handleConfirmBulkDelete}
              className="flex-1 rounded-[18px] bg-destructive">
              <Text className="text-button text-destructive-foreground uppercase">
                {copy.delete}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OrdernowsScreen>
  );
}
