import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { TransactionRow } from '@/components/ordernows/transaction-row';
import {
  ActionPill,
  AvatarBadge,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
  StatTile,
} from '@/components/ordernows/primitives';
import { Text } from '@/components/ui/text';
import { localizeOrdernowsText } from '@/lib/localizeOrdernows';
import { formatDateAndTime, formatVnd } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const MEMBER_DETAIL_COPY = {
  en: {
    detailTitle: 'Member Detail',
    missingSubtitle: 'The selected member could not be found in the local mock store.',
    missingBadge: 'MISSING MEMBER',
    missingTitle: 'Missing member',
    missingDescription: 'Return to the roster and choose another member card.',
    backToMembers: 'Back to Members',
    subtitle: 'Member profile with wallet balance, group assignments, and recent ledger history.',
    profile: 'PROFILE',
    member: 'Member',
    unknown: 'Unknown',
    noPhone: 'No phone on file',
    joined: 'Joined the running ledger and visible only to this account.',
    unclassified: 'Unclassified',
    topUpWallet: 'Top Up Wallet',
    roster: 'Roster',
    currentBalance: 'Current Balance',
    balanceHint: 'Live wallet value after mock actions',
    historyRows: 'History Rows',
    historyHint: 'Most recent transactions capped at thirty',
    recentHistory: 'Recent History',
    ledgerTouchpoints: 'Ledger touchpoints',
    historyDescription: "Debit rows show the member's tab participation, credit rows show wallet funding.",
    emptyTitle: 'No recent activity',
    emptyDescription: 'Create a transaction or top up this wallet to populate the member timeline.',
  },
  vi: {
    detailTitle: 'Chi tiết thành viên',
    missingSubtitle: 'Không tìm thấy thành viên đã chọn trong dữ liệu cục bộ.',
    missingBadge: 'THIẾU THÀNH VIÊN',
    missingTitle: 'Không tìm thấy thành viên',
    missingDescription: 'Quay lại danh sách và chọn một thẻ thành viên khác.',
    backToMembers: 'Quay lại thành viên',
    subtitle: 'Hồ sơ thành viên gồm số dư ví, nhóm và lịch sử giao dịch gần đây.',
    profile: 'HỒ SƠ',
    member: 'Thành viên',
    unknown: 'Chưa cập nhật',
    noPhone: 'Chưa có số điện thoại',
    joined: 'Đã tham gia sổ chi tiêu và chỉ hiển thị trong tài khoản này.',
    unclassified: 'Chưa phân nhóm',
    topUpWallet: 'Nạp tiền vào ví',
    roster: 'Danh sách',
    currentBalance: 'Số dư hiện tại',
    balanceHint: 'Số dư ví sau các thao tác',
    historyRows: 'Số giao dịch',
    historyHint: 'Tối đa ba mươi giao dịch gần nhất',
    recentHistory: 'Lịch sử gần đây',
    ledgerTouchpoints: 'Giao dịch trong sổ',
    historyDescription: 'Khoản chi cho biết phần tham gia, khoản nạp cho biết tiền vào ví.',
    emptyTitle: 'Chưa có hoạt động',
    emptyDescription: 'Tạo giao dịch hoặc nạp tiền để hiển thị lịch sử của thành viên.',
  },
} as const;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function MemberDetailScreen() {
  const { language, locale } = useLanguage();
  const copy = MEMBER_DETAIL_COPY[language];
  const params = useLocalSearchParams<{ id: string }>();
  const memberId = getParamValue(params.id);
  const groups = useOrdernowsStore((state) => state.groups);
  const members = useOrdernowsStore((state) => state.members);
  const transactions = useOrdernowsStore((state) => state.transactions);

  const member = members.find((entry) => entry.id === memberId);

  const history = useMemo(() => {
    if (!memberId) {
      return [];
    }

    return transactions
      .filter(
        (transaction) =>
          transaction.memberId === memberId ||
          transaction.participants?.some((participant) => participant.memberId === memberId)
      )
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 30);
  }, [memberId, transactions]);

  if (!member) {
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
              label={copy.backToMembers}
              icon="ArrowLeft"
              tone="secondary"
              onPress={() => router.replace('/(tabs)/members')}
            />
          </View>
        </PaperCard>
      </OrdernowsScreen>
    );
  }

  const memberGroups = groups.filter((group) => member.groupIds.includes(group.id));

  return (
    <OrdernowsScreen
      title={member.name}
      subtitle={copy.subtitle}
      badge={`${member.initials} / ${copy.profile}`}>
      <PaperCard className="mb-6 p-5">
        <View className="flex-row items-start gap-4">
          <AvatarBadge avatar={member.avatar} size="lg" />

          <View className="flex-1">
            <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">
              {localizeOrdernowsText(member.role || copy.member, language)}
            </Text>
            <Text className="mt-2 text-h2 text-foreground uppercase">
              {localizeOrdernowsText(member.favoriteDrink || copy.unknown, language)}
            </Text>
            <Text className="mt-1 text-body text-muted-foreground">
              {localizeOrdernowsText(member.phone || copy.noPhone, language)}
            </Text>
            <Text className="mt-2 text-caption uppercase tracking-[1.3px] text-muted-foreground">
              {copy.joined}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row flex-wrap gap-2">
          {memberGroups.length > 0 ? (
            memberGroups.map((group) => (
              <View key={group.id} className="rounded-full border-2 border-border bg-background px-3 py-2">
                <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
                  {group.name}
                </Text>
              </View>
            ))
          ) : (
            <View className="rounded-full border-2 border-border bg-background px-3 py-2">
              <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
                {copy.unclassified}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-5 flex-row gap-2">
          <ActionPill
            label={copy.topUpWallet}
            icon="Plus"
            onPress={() =>
              router.push({
                pathname: '/member/[id]/top-up',
                params: { id: member.id },
              })
            }
            className="flex-1"
          />
          <ActionPill
            label={copy.roster}
            icon="UsersRound"
            tone="neutral"
            onPress={() => router.replace('/(tabs)/members')}
            className="flex-1"
          />
        </View>
      </PaperCard>

      <View className="mb-6 flex-row gap-3">
        <StatTile label={copy.currentBalance} value={formatVnd(member.balance)} hint={copy.balanceHint} />
        <StatTile label={copy.historyRows} value={`${history.length}`} hint={copy.historyHint} />
      </View>

      <SectionHeading
        eyebrow={copy.recentHistory}
        title={copy.ledgerTouchpoints}
        description={copy.historyDescription}
      />

      {history.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          subtitle={formatDateAndTime(transaction.date, locale)}
          language={language}
          onPress={() =>
            router.push({
              pathname: '/transaction/[id]',
              params: { id: transaction.id },
            })
          }
        />
      ))}

      {history.length === 0 ? (
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.emptyTitle}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.emptyDescription}
          </Text>
        </PaperCard>
      ) : null}
    </OrdernowsScreen>
  );
}
