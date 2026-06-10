import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { MemberCard } from '@/components/ordernows/member-card';
import {
  ActionPill,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
  StatTile,
} from '@/components/ordernows/primitives';
import { TransactionRow } from '@/components/ordernows/transaction-row';
import { Text } from '@/components/ui/text';
import { localizeOrdernowsText } from '@/lib/localizeOrdernows';
import { formatVnd } from '@/lib/ordernows';
import LucideIcon from '@/lib/icons/LucideIcon';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const GROUP_DETAIL_COPY = {
  en: {
    detailTitle: 'Group Detail',
    missingSubtitle: 'The selected group could not be found in the local ledger.',
    missingBadge: 'MISSING GROUP',
    missingTitle: 'Missing group',
    missingDescription: 'Return to group management and choose another group.',
    backToGroups: 'Back to Groups',
    membersGroup: 'MEMBERS / GROUP',
    members: 'Members',
    membersHint: 'People assigned to this group',
    totalBalance: 'Total Balance',
    balanceHint: 'Combined member wallets',
    groupRoster: 'Group Roster',
    rosterDescription: 'Open a profile or top up a wallet without leaving this group.',
    noMembers: 'No members yet',
    noMembersDescription: 'Add a member and assign this group to populate the roster.',
    addMember: 'Add member',
    recentActivity: 'Recent Activity',
    groupTransactions: 'Group transactions',
    activityDescription: 'The latest ledger rows associated with this group.',
    noTransactions: 'No transactions yet',
    noTransactionsDescription: 'New shared transactions for this group will appear here.',
  },
  vi: {
    detailTitle: 'Chi tiết nhóm',
    missingSubtitle: 'Không tìm thấy nhóm đã chọn trong dữ liệu cục bộ.',
    missingBadge: 'THIẾU NHÓM',
    missingTitle: 'Không tìm thấy nhóm',
    missingDescription: 'Quay lại quản lý nhóm và chọn một nhóm khác.',
    backToGroups: 'Quay lại nhóm',
    membersGroup: 'THÀNH VIÊN / NHÓM',
    members: 'Thành viên',
    membersHint: 'Số người trong nhóm này',
    totalBalance: 'Tổng số dư',
    balanceHint: 'Tổng số dư ví của thành viên',
    groupRoster: 'Danh sách nhóm',
    rosterDescription: 'Mở hồ sơ hoặc nạp tiền mà không cần rời khỏi nhóm.',
    noMembers: 'Chưa có thành viên',
    noMembersDescription: 'Thêm thành viên và chọn nhóm này để hoàn thiện danh sách.',
    addMember: 'Thêm thành viên',
    recentActivity: 'Hoạt động gần đây',
    groupTransactions: 'Giao dịch của nhóm',
    activityDescription: 'Các giao dịch mới nhất gắn với nhóm này.',
    noTransactions: 'Chưa có giao dịch',
    noTransactionsDescription: 'Giao dịch chia sẻ mới của nhóm sẽ xuất hiện tại đây.',
  },
} as const;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function GroupDetailScreen() {
  const { language } = useLanguage();
  const copy = GROUP_DETAIL_COPY[language];
  const params = useLocalSearchParams<{ id: string }>();
  const groupId = getParamValue(params.id);
  const groups = useOrdernowsStore((state) => state.groups);
  const members = useOrdernowsStore((state) => state.members);
  const transactions = useOrdernowsStore((state) => state.transactions);
  const group = groups.find((entry) => entry.id === groupId);

  const groupMembers = useMemo(
    () => members.filter((member) => member.groupIds.includes(groupId ?? '')),
    [groupId, members]
  );
  const groupTransactions = useMemo(
    () => {
      const groupMemberIds = new Set(groupMembers.map((member) => member.id));

      return transactions
        .filter(
          (transaction) =>
            transaction.groupId === groupId ||
            Boolean(transaction.memberId && groupMemberIds.has(transaction.memberId)) ||
            Boolean(transaction.fromMemberId && groupMemberIds.has(transaction.fromMemberId)) ||
            Boolean(transaction.toMemberId && groupMemberIds.has(transaction.toMemberId)) ||
            Boolean(
              transaction.participants?.some((participant) =>
                groupMemberIds.has(participant.memberId)
              )
            )
        )
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 20);
    },
    [groupId, groupMembers, transactions]
  );
  const totalBalance = groupMembers.reduce((sum, member) => sum + member.balance, 0);

  if (!group) {
    return (
      <OrdernowsScreen
        title={copy.detailTitle}
        subtitle={copy.missingSubtitle}
        badge={copy.missingBadge}>
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.missingTitle}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.missingDescription}
          </Text>
          <View className="mt-5">
            <ActionPill
              label={copy.backToGroups}
              icon="ArrowLeft"
              tone="secondary"
              onPress={() => router.replace('/group/manage')}
            />
          </View>
        </PaperCard>
      </OrdernowsScreen>
    );
  }

  return (
    <OrdernowsScreen
      title={group.name}
      subtitle={localizeOrdernowsText(group.tagline, language)}
      badge={`${groupMembers.length} ${copy.membersGroup}`}>
      <View className="mb-6 flex-row gap-3">
        <StatTile label={copy.members} value={`${groupMembers.length}`} hint={copy.membersHint} />
        <StatTile label={copy.totalBalance} value={formatVnd(totalBalance)} hint={copy.balanceHint} />
      </View>

      <View className="mb-4">
        <Text className="text-caption uppercase tracking-[1.8px] text-muted-foreground">
          {copy.groupRoster}
        </Text>
        <View className="mt-1 flex-row items-center justify-between gap-4">
          <Text className="text-h3 text-foreground uppercase">{copy.members}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.addMember}
            onPress={() =>
              router.push({
                pathname: '/member/new',
                params: { groupId: group.id, returnTo: 'group' },
              })
            }
            className="h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card active:opacity-80">
            <LucideIcon name="Plus" className="text-foreground" size={16} strokeWidth={2.2} />
          </Pressable>
        </View>
        <Text className="mt-1 text-body text-muted-foreground">{copy.rosterDescription}</Text>
      </View>

      {groupMembers.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          groups={groups}
          onOpen={() =>
            router.push({
              pathname: '/member/[id]',
              params: { id: member.id },
            })
          }
          onTopUp={() =>
            router.push({
              pathname: '/member/[id]/top-up',
              params: { id: member.id },
            })
          }
          onTransfer={() =>
            router.push({
              pathname: '/member/[id]/transfer',
              params: { id: member.id },
            })
          }
        />
      ))}

      {groupMembers.length === 0 ? (
        <PaperCard className="mb-6 p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.noMembers}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.noMembersDescription}
          </Text>
        </PaperCard>
      ) : null}

      <SectionHeading
        eyebrow={copy.recentActivity}
        title={copy.groupTransactions}
        description={copy.activityDescription}
      />

      {groupTransactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          language={language}
          onPress={() =>
            router.push({
              pathname: '/transaction/[id]',
              params: { id: transaction.id },
            })
          }
        />
      ))}

      {groupTransactions.length === 0 ? (
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.noTransactions}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.noTransactionsDescription}
          </Text>
        </PaperCard>
      ) : null}
    </OrdernowsScreen>
  );
}
