import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Platform, Share, View } from 'react-native';
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
import {
  formatDateAndTime,
  formatSignedVnd,
  formatVnd,
} from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { cn } from '@/lib/utils';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const TRANSACTION_DETAIL_COPY = {
  en: {
    title: 'Transaction Detail',
    missingSubtitle: 'The selected transaction could not be found.',
    missingBadge: 'MISSING TXN',
    missingTitle: 'Missing transaction',
    missingDescription: 'Return to the home ledger and reopen a valid transaction row.',
    backToHome: 'Back to Home',
    discount: 'Discount',
    discountWithPercent: (percent: number) => `Discount (${percent}%)`,
    unknownMember: 'Unknown member',
    noBreakdown: 'No participant breakdown',
    subtotal: 'Subtotal',
    totalShared: 'Total shared',
    summaryCopied: 'Summary copied',
    copiedDescription: 'The transaction summary is ready to paste.',
    copySummary: 'Copy transaction summary',
    unableToShare: 'Unable to share',
    tryAgain: 'Please try again from your device.',
    subtitle: 'Inspect totals, people involved, and the context attached to this ledger event.',
    detail: 'DETAIL',
    credit: 'Credit',
    debit: 'Debit',
    transfer: 'Transfer',
    channel: 'Channel',
    people: 'People',
    from: 'From',
    to: 'To',
    amountTransferred: 'Amount transferred',
    walletMovement: 'Wallet movement',
    transferParties: 'Transfer Parties',
    transferRoute: 'Sender and receiver',
    originalBill: 'Original shared bill',
    applied: (percent: number) => `${percent}% applied`,
    noDiscount: 'No discount on file',
    memberBreakdown: 'Member Breakdown',
    peopleAndSplit: 'People and split',
    member: 'Member',
    members: 'Members',
    share: 'Share',
    singleWallet: 'This credit transaction applies directly to a single wallet.',
    summary: 'Summary',
    finalNumbers: 'Final numbers',
    shareSummary: 'Share Summary',
  },
  vi: {
    title: 'Chi tiết giao dịch',
    missingSubtitle: 'Không tìm thấy giao dịch đã chọn.',
    missingBadge: 'THIẾU GIAO DỊCH',
    missingTitle: 'Không tìm thấy giao dịch',
    missingDescription: 'Quay lại sổ giao dịch trang chủ và mở một giao dịch hợp lệ.',
    backToHome: 'Quay lại trang chủ',
    discount: 'Giảm giá',
    discountWithPercent: (percent: number) => `Giảm giá (${percent}%)`,
    unknownMember: 'Thành viên không xác định',
    noBreakdown: 'Chưa có chi tiết người tham gia',
    subtotal: 'Tạm tính',
    totalShared: 'Tổng chia',
    summaryCopied: 'Đã sao chép tóm tắt',
    copiedDescription: 'Tóm tắt giao dịch đã sẵn sàng để dán.',
    copySummary: 'Sao chép tóm tắt giao dịch',
    unableToShare: 'Không thể chia sẻ',
    tryAgain: 'Vui lòng thử lại trên thiết bị của bạn.',
    subtitle: 'Xem tổng tiền, người tham gia và thông tin gắn với giao dịch này.',
    detail: 'CHI TIẾT',
    credit: 'Tiền vào',
    debit: 'Khoản chi',
    transfer: 'Trao đổi',
    channel: 'Kênh',
    people: 'Số người',
    from: 'Từ',
    to: 'Đến',
    amountTransferred: 'Số tiền trao đổi',
    walletMovement: 'Dịch chuyển ví',
    transferParties: 'Người trao đổi',
    transferRoute: 'Người gửi và người nhận',
    originalBill: 'Hóa đơn chung ban đầu',
    applied: (percent: number) => `Đã áp dụng ${percent}%`,
    noDiscount: 'Không có giảm giá',
    memberBreakdown: 'Chi tiết thành viên',
    peopleAndSplit: 'Người tham gia và phần chia',
    member: 'Thành viên',
    members: 'Thành viên',
    share: 'Tỷ lệ',
    singleWallet: 'Khoản tiền vào này được cộng trực tiếp vào một ví.',
    summary: 'Tóm tắt',
    finalNumbers: 'Số liệu cuối cùng',
    shareSummary: 'Chia sẻ tóm tắt',
  },
} as const;

function SummaryRow({
  label,
  value,
  tone = 'default',
  strong = false,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'destructive' | 'success';
  strong?: boolean;
}) {
  const toneClass = {
    default: 'text-foreground',
    destructive: 'text-destructive',
    success: 'text-success',
  }[tone];

  return (
    <View className="flex-row items-center justify-between border-b border-border py-3 last:border-b-0">
      <Text
        className={cn(
          'text-caption uppercase tracking-[1.4px]',
          strong ? 'text-foreground' : 'text-muted-foreground'
        )}>
        {label}
      </Text>
      <Text className={cn(strong ? 'text-h4' : 'text-h5', 'uppercase', toneClass)}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const { language, locale } = useLanguage();
  const copy = TRANSACTION_DETAIL_COPY[language];
  const params = useLocalSearchParams<{ id: string }>();
  const transactionId = getParamValue(params.id);
  const groups = useOrdernowsStore((state) => state.groups);
  const members = useOrdernowsStore((state) => state.members);
  const venues = useOrdernowsStore((state) => state.venues);
  const transaction = useOrdernowsStore((state) =>
    state.transactions.find((entry) => entry.id === transactionId)
  );
  const memberLookup = useMemo(
    () =>
      members.reduce<Record<string, (typeof members)[number]>>((lookup, member) => {
        lookup[member.id] = member;
        return lookup;
      }, {}),
    [members]
  );

  if (!transaction) {
    return (
      <OrdernowsScreen
        title={copy.title}
        subtitle={copy.missingSubtitle}
        badge={copy.missingBadge}>
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.missingTitle}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.missingDescription}
          </Text>
          <View className="mt-5">
            <ActionPill label={copy.backToHome} icon="ArrowLeft" tone="secondary" onPress={() => router.replace('/(tabs)/home')} />
          </View>
        </PaperCard>
      </OrdernowsScreen>
    );
  }

  const currentTransaction = transaction;
  const groupName = groups.find((group) => group.id === currentTransaction.groupId)?.name;
  const venueName = venues.find((venue) => venue.id === currentTransaction.venueId)?.name;
  const memberName = members.find((member) => member.id === currentTransaction.memberId)?.name;
  const fromMember = members.find((member) => member.id === currentTransaction.fromMemberId);
  const toMember = members.find((member) => member.id === currentTransaction.toMemberId);
  const subtotal = currentTransaction.subtotal ?? currentTransaction.amount;
  const discountAmount = currentTransaction.discountAmount ?? 0;
  const totalShared = currentTransaction.totalShared ?? currentTransaction.amount;
  const isTransfer = currentTransaction.type === 'transfer';
  const displayAmount = currentTransaction.type === 'credit' ? currentTransaction.amount : -subtotal;
  const displayAmountText = isTransfer ? formatVnd(currentTransaction.amount) : formatSignedVnd(displayAmount);
  const transactionTypeLabel =
    currentTransaction.type === 'credit'
      ? copy.credit
      : isTransfer
        ? copy.transfer
        : copy.debit;
  const typeBadgeClass =
    currentTransaction.type === 'credit'
      ? 'border-success bg-success'
      : isTransfer
        ? 'border-primary bg-primary'
        : 'border-destructive bg-destructive';
  const typeBadgeTextClass =
    currentTransaction.type === 'credit'
      ? 'text-success-foreground'
      : isTransfer
        ? 'text-primary-foreground'
        : 'text-destructive-foreground';
  const participantCount =
    isTransfer
      ? new Set([currentTransaction.fromMemberId, currentTransaction.toMemberId].filter(Boolean)).size
      : currentTransaction.participants && currentTransaction.participants.length > 0
      ? new Set(currentTransaction.participants.map((participant) => participant.memberId)).size
      : currentTransaction.memberId
        ? 1
        : 0;
  const contextLine = isTransfer
    ? `${fromMember?.name ?? copy.unknownMember} -> ${toMember?.name ?? copy.unknownMember}`
    : `${groupName || localizeOrdernowsText(currentTransaction.subtitle, language)}${venueName ? ` • ${venueName}` : ''}${memberName ? ` • ${memberName}` : ''}`;
  const discountLabel =
    currentTransaction.discountPercent !== undefined
      ? copy.discountWithPercent(currentTransaction.discountPercent)
      : copy.discount;

  async function handleShare() {
    const transferMessage = [
      localizeOrdernowsText(currentTransaction.title, language),
      formatDateAndTime(currentTransaction.date, locale),
      `${copy.from}: ${fromMember?.name ?? copy.unknownMember}`,
      `${copy.to}: ${toMember?.name ?? copy.unknownMember}`,
      `${copy.amountTransferred}: ${formatVnd(currentTransaction.amount)}`,
      currentTransaction.note,
    ]
      .filter(Boolean)
      .join('\n');

    if (isTransfer) {
      if (Platform.OS === 'web') {
        try {
          await navigator.clipboard.writeText(transferMessage);
          Alert.alert(copy.summaryCopied, copy.copiedDescription);
        } catch {
          globalThis.prompt(copy.copySummary, transferMessage);
        }
        return;
      }

      try {
        await Share.share({ message: transferMessage });
      } catch {
        Alert.alert(copy.unableToShare, copy.tryAgain);
      }
      return;
    }

    const participantLines =
      currentTransaction.participants
        ?.map((participant) => {
          const member = memberLookup[participant.memberId];
          return `- ${member?.name ?? copy.unknownMember}: ${localizeOrdernowsText(participant.item, language)}, ${formatVnd(participant.amount)} (${participant.sharePercent}%)`;
        })
        .join('\n') || copy.noBreakdown;

    const message = [
      localizeOrdernowsText(currentTransaction.title, language),
      formatDateAndTime(currentTransaction.date, locale),
      `${copy.subtotal}: ${formatVnd(subtotal)}`,
      `${discountLabel}: ${formatSignedVnd(-discountAmount)}`,
      `${copy.totalShared}: ${formatVnd(totalShared)}`,
      participantLines,
    ].join('\n');

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(message);
        Alert.alert(copy.summaryCopied, copy.copiedDescription);
      } catch {
        globalThis.prompt(copy.copySummary, message);
      }
      return;
    }

    try {
      await Share.share({ message });
    } catch {
      Alert.alert(copy.unableToShare, copy.tryAgain);
    }
  }

  return (
    <OrdernowsScreen
      title={localizeOrdernowsText(transaction.title, language)}
      subtitle={copy.subtitle}
      badge={`${transactionTypeLabel} / ${copy.detail}`}>
      <PaperCard className="mb-6 p-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <View
              className={cn(
                'self-start rounded-full border-2 px-3 py-1.5',
                typeBadgeClass
              )}>
              <Text
                className={cn(
                  'text-caption uppercase tracking-[1.4px]',
                  typeBadgeTextClass
                )}>
                {transactionTypeLabel}
              </Text>
            </View>

            <Text
              className={cn(
                'mt-4 text-h2 uppercase',
                isTransfer ? 'text-foreground' : displayAmount >= 0 ? 'text-success' : 'text-destructive'
              )}>
              {displayAmountText}
            </Text>
            <Text className="mt-1 text-body text-muted-foreground">{formatDateAndTime(transaction.date, locale)}</Text>
            <Text className="mt-3 text-body text-muted-foreground">
              {contextLine}
            </Text>
            {transaction.channel ? (
              <Text className="mt-1 text-caption uppercase tracking-[1.2px] text-muted-foreground">
                {copy.channel}: {localizeOrdernowsText(transaction.channel, language)}
              </Text>
            ) : null}
            {transaction.note ? (
              <Text className="mt-3 text-body text-muted-foreground">{transaction.note}</Text>
            ) : null}
          </View>

          <View className="rounded-[24px] border-2 border-border bg-background px-4 py-3">
            <Text className="text-caption uppercase tracking-[1.4px] text-muted-foreground">{copy.people}</Text>
            <Text className="mt-2 text-h2 text-foreground uppercase">{participantCount}</Text>
          </View>
        </View>
      </PaperCard>

      {isTransfer ? (
        <View className="mb-6 flex-row gap-3">
          <StatTile
            label={copy.amountTransferred}
            value={formatVnd(currentTransaction.amount)}
            hint={copy.walletMovement}
          />
          <StatTile
            label={copy.people}
            value={`${participantCount}`}
            hint={copy.transferRoute}
          />
        </View>
      ) : (
        <View className="mb-6 flex-row gap-3">
          <StatTile label={copy.subtotal} value={formatVnd(subtotal)} hint={copy.originalBill} />
          <StatTile
            label={copy.discount}
            value={discountAmount ? formatVnd(discountAmount) : '0đ'}
            hint={transaction.discountPercent ? copy.applied(transaction.discountPercent) : copy.noDiscount}
          />
        </View>
      )}

      {isTransfer ? (
        <>
          <SectionHeading
            eyebrow={copy.transferParties}
            title={copy.walletMovement}
            action={
              <View className="rounded-full border-2 border-border bg-card px-3 py-2">
                <Text className="text-caption uppercase tracking-[1.3px] text-muted-foreground">
                  {participantCount} {participantCount === 1 ? copy.member : copy.members}
                </Text>
              </View>
            }
          />

          {[
            {
              label: copy.from,
              member: fromMember,
              amount: -currentTransaction.amount,
              tone: 'text-destructive',
            },
            {
              label: copy.to,
              member: toMember,
              amount: currentTransaction.amount,
              tone: 'text-success',
            },
          ].map((party) => (
            <PaperCard key={party.label} className="mb-3 p-4">
              <View className="flex-row items-start gap-4">
                {party.member ? <AvatarBadge avatar={party.member.avatar} size="md" /> : null}

                <View className="flex-1">
                  <Text className="text-caption uppercase tracking-[1.5px] text-muted-foreground">
                    {party.label}
                  </Text>
                  <Text className="mt-1 text-h4 text-foreground uppercase">
                    {party.member?.name || copy.unknownMember}
                  </Text>
                </View>

                <Text className={cn('text-h5 uppercase', party.tone)}>
                  {formatSignedVnd(party.amount)}
                </Text>
              </View>
            </PaperCard>
          ))}
        </>
      ) : (
        <>
          <SectionHeading
            eyebrow={copy.memberBreakdown}
            title={copy.peopleAndSplit}
            action={
              <View className="rounded-full border-2 border-border bg-card px-3 py-2">
                <Text className="text-caption uppercase tracking-[1.3px] text-muted-foreground">
                  {participantCount} {participantCount === 1 ? copy.member : copy.members}
                </Text>
              </View>
            }
          />

          {transaction.participants?.map((participant, index) => {
            const member = memberLookup[participant.memberId];

            return (
              <PaperCard key={`${transaction.id}-${participant.memberId}-${index}`} className="mb-3 p-4">
                <View className="flex-row items-start gap-4">
                  {member ? <AvatarBadge avatar={member.avatar} size="md" /> : null}

                  <View className="flex-1">
                    <Text className="text-h4 text-foreground uppercase">{member?.name || copy.unknownMember}</Text>
                    <Text className="mt-1 text-body text-muted-foreground">{localizeOrdernowsText(participant.item, language)}</Text>
                    <Text className="mt-2 text-caption uppercase tracking-[1.2px] text-muted-foreground">
                      {copy.share}: {participant.sharePercent}%
                    </Text>
                  </View>

                  <Text className="text-h5 text-foreground uppercase">{formatVnd(participant.amount)}</Text>
                </View>
              </PaperCard>
            );
          })}

          {!transaction.participants?.length && memberName ? (
            <PaperCard className="mb-6 p-4">
              <Text className="text-h4 text-foreground uppercase">{memberName}</Text>
              <Text className="mt-1 text-body text-muted-foreground">
                {copy.singleWallet}
              </Text>
            </PaperCard>
          ) : null}
        </>
      )}

      <SectionHeading eyebrow={copy.summary} title={copy.finalNumbers} />

      <PaperCard className="mb-6 p-5">
        {isTransfer ? (
          <>
            <SummaryRow label={copy.amountTransferred} value={formatVnd(currentTransaction.amount)} />
            <SummaryRow label={copy.from} value={fromMember?.name ?? copy.unknownMember} />
            <SummaryRow label={copy.to} value={toMember?.name ?? copy.unknownMember} strong />
          </>
        ) : (
          <>
            <SummaryRow label={copy.subtotal} value={formatVnd(subtotal)} />
            <SummaryRow
              label={discountLabel}
              value={discountAmount ? formatSignedVnd(-discountAmount) : '0đ'}
              tone={discountAmount ? 'destructive' : 'default'}
            />
            <SummaryRow label={copy.totalShared} value={formatVnd(totalShared)} strong />
          </>
        )}
      </PaperCard>

      <View className="gap-3">
        <ActionPill label={copy.shareSummary} icon="Share2" tone="secondary" onPress={handleShare} />
      </View>
    </OrdernowsScreen>
  );
}
