import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  ActionPill,
  AvatarBadge,
  FormField,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
} from '@/components/ordernows/primitives';
import { Text } from '@/components/ui/text';
import LucideIcon from '@/lib/icons/LucideIcon';
import { localizeOrdernowsText } from '@/lib/localizeOrdernows';
import {
  formatSignedVnd,
  formatVnd,
  getBalanceTone,
  parseVndInput,
  quickTopUpAmounts,
} from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { cn } from '@/lib/utils';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const TRANSFER_COPY = {
  en: {
    title: 'Transfer Wallet',
    missingSubtitle: 'The selected member could not be loaded.',
    badge: 'TRANSFER',
    missingTitle: 'Missing member',
    missingDescription: 'Go back to the roster and reopen the transfer flow from a valid card.',
    backToMembers: 'Back to Members',
    subtitle: 'Move balance from one member wallet to another and keep a transfer row in history.',
    fromWallet: 'FROM WALLET',
    unknown: 'Unknown',
    currentBalance: 'Current balance',
    receiver: 'Receiver',
    chooseReceiver: 'Choose receiver',
    receiverDescription: 'Select the member who should receive this amount.',
    noReceiver: 'No other member available',
    noReceiverDescription: 'Add another member before creating a wallet transfer.',
    transferInputs: 'Transfer inputs',
    transferDescription: 'Enter the amount this member will send to the selected receiver.',
    amount: 'Amount (VND)',
    amountHint: 'The sender is reduced and the receiver is increased by this amount.',
    note: 'Note',
    notePlaceholder: 'Debt repayment, cash settled, Momo transfer...',
    balancePreview: 'Balance Preview',
    fromAfter: 'Sender after',
    toAfter: 'Receiver after',
    movement: 'Movement',
    confirm: 'Confirm Transfer',
    backToMember: 'Back to Member',
  },
  vi: {
    title: 'Trao đổi ví',
    missingSubtitle: 'Không thể tải thành viên đã chọn.',
    badge: 'TRAO ĐỔI',
    missingTitle: 'Không tìm thấy thành viên',
    missingDescription: 'Quay lại danh sách và mở luồng trao đổi từ một thẻ hợp lệ.',
    backToMembers: 'Quay lại thành viên',
    subtitle: 'Chuyển số dư từ ví một thành viên sang ví thành viên khác và lưu lịch sử trao đổi.',
    fromWallet: 'VÍ GỬI',
    unknown: 'Chưa cập nhật',
    currentBalance: 'Số dư hiện tại',
    receiver: 'Người nhận',
    chooseReceiver: 'Chọn người nhận',
    receiverDescription: 'Chọn thành viên sẽ nhận số tiền này.',
    noReceiver: 'Chưa có thành viên nhận',
    noReceiverDescription: 'Thêm một thành viên khác trước khi tạo giao dịch trao đổi ví.',
    transferInputs: 'Thông tin trao đổi',
    transferDescription: 'Nhập số tiền thành viên này sẽ chuyển cho người nhận đã chọn.',
    amount: 'Số tiền (VND)',
    amountHint: 'Ví người gửi bị trừ và ví người nhận được cộng đúng số tiền này.',
    note: 'Ghi chú',
    notePlaceholder: 'Trả nợ, chốt tiền mặt, chuyển khoản Momo...',
    balancePreview: 'Số dư dự kiến',
    fromAfter: 'Người gửi sau chuyển',
    toAfter: 'Người nhận sau chuyển',
    movement: 'Dịch chuyển',
    confirm: 'Xác nhận trao đổi',
    backToMember: 'Quay lại thành viên',
  },
} as const;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function MemberTransferScreen() {
  const { language } = useLanguage();
  const copy = TRANSFER_COPY[language];
  const params = useLocalSearchParams<{ id: string }>();
  const memberId = getParamValue(params.id);
  const members = useOrdernowsStore((state) => state.members);
  const transferMember = useOrdernowsStore((state) => state.transferMember);
  const selectedMember = members.find((entry) => entry.id === memberId);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');

  const receiverOptions = useMemo(
    () => members.filter((member) => member.id !== selectedMember?.id),
    [members, selectedMember?.id]
  );
  const selectedTarget =
    receiverOptions.find((member) => member.id === selectedTargetId) ?? receiverOptions[0];
  const amount = parseVndInput(amountInput);
  const canSubmit = Boolean(selectedMember && selectedTarget && amount > 0);
  const nextSenderBalance = selectedMember ? selectedMember.balance - amount : -amount;
  const nextReceiverBalance = selectedTarget ? selectedTarget.balance + amount : amount;

  if (!selectedMember) {
    return (
      <OrdernowsScreen
        title={copy.title}
        subtitle={copy.missingSubtitle}
        badge={copy.badge}>
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

  function handleSubmit() {
    if (!selectedMember || !selectedTarget || amount <= 0) {
      return;
    }

    const transactionId = transferMember({
      fromMemberId: selectedMember.id,
      toMemberId: selectedTarget.id,
      amount,
      note: note.trim() || undefined,
    });

    router.replace({
      pathname: '/transaction/[id]',
      params: { id: transactionId },
    });
  }

  return (
    <OrdernowsScreen
      keyboardAware
      title={copy.title}
      subtitle={copy.subtitle}
      badge={`${selectedMember.initials} / ${copy.badge}`}>
      <PaperCard className="mb-6 p-5">
        <View className="flex-row items-start gap-4">
          <AvatarBadge avatar={selectedMember.avatar} size="lg" />

          <View className="flex-1">
            <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">
              {copy.fromWallet}
            </Text>
            <Text className="mt-2 text-h2 text-foreground uppercase">{selectedMember.name}</Text>
            <Text className="mt-1 text-body text-muted-foreground">
              {localizeOrdernowsText(selectedMember.favoriteDrink || copy.unknown, language)}
            </Text>
            <Text className="mt-3 text-caption uppercase tracking-[1.6px] text-muted-foreground">
              {copy.currentBalance}
            </Text>
            <Text className={cn('mt-1 text-h2 uppercase', getBalanceTone(selectedMember.balance))}>
              {formatVnd(selectedMember.balance)}
            </Text>
          </View>
        </View>
      </PaperCard>

      <SectionHeading
        eyebrow={copy.receiver}
        title={copy.chooseReceiver}
        description={copy.receiverDescription}
      />

      {receiverOptions.length > 0 ? (
        <View className="mb-6 gap-3">
          {receiverOptions.map((receiver) => {
            const active = receiver.id === selectedTarget?.id;

            return (
              <Pressable
                key={receiver.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedTargetId(receiver.id)}
                className={cn(
                  'rounded-[28px] border-2 bg-card p-4 active:opacity-80',
                  active ? 'border-primary' : 'border-border'
                )}>
                <View className="flex-row items-start gap-4">
                  <AvatarBadge avatar={receiver.avatar} size="md" />
                  <View className="flex-1">
                    <Text className="text-h4 text-foreground uppercase">{receiver.name}</Text>
                    <Text className="mt-1 text-body text-muted-foreground">
                      {localizeOrdernowsText(receiver.favoriteDrink || copy.unknown, language)}
                    </Text>
                    <Text className={cn('mt-2 text-h4 uppercase', getBalanceTone(receiver.balance))}>
                      {formatVnd(receiver.balance)}
                    </Text>
                  </View>
                  {active ? (
                    <View className="h-10 w-10 items-center justify-center rounded-[16px] border-2 border-primary bg-primary">
                      <LucideIcon
                        name="Check"
                        className="text-primary-foreground"
                        size={17}
                        strokeWidth={2.4}
                      />
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <PaperCard className="mb-6 p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.noReceiver}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.noReceiverDescription}
          </Text>
        </PaperCard>
      )}

      <SectionHeading
        eyebrow={copy.movement}
        title={copy.transferInputs}
        description={copy.transferDescription}
      />

      <FormField
        label={copy.amount}
        icon="WalletCards"
        keyboardType="numeric"
        value={amountInput}
        onChangeText={setAmountInput}
        placeholder="10000"
        hint={copy.amountHint}
      />

      <View className="mb-5 flex-row flex-wrap gap-2">
        {quickTopUpAmounts.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setAmountInput(String(option.value))}
            className="rounded-full border-2 border-border bg-background px-4 py-2.5 active:opacity-80">
            <Text className="text-caption uppercase tracking-[1.3px] text-foreground">{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <FormField
        label={copy.note}
        icon="NotebookPen"
        value={note}
        onChangeText={setNote}
        placeholder={copy.notePlaceholder}
      />

      <PaperCard className="mb-6 p-5">
        <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{copy.balancePreview}</Text>
        <View className="mt-4 gap-3">
          <View className="flex-row items-center justify-between gap-4">
            <Text className="flex-1 text-body text-muted-foreground">{copy.fromAfter}</Text>
            <Text className={cn('text-h4 uppercase', getBalanceTone(nextSenderBalance))}>
              {formatVnd(nextSenderBalance)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <Text className="flex-1 text-body text-muted-foreground">{copy.toAfter}</Text>
            <Text className={cn('text-h4 uppercase', getBalanceTone(nextReceiverBalance))}>
              {formatVnd(nextReceiverBalance)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between gap-4 border-t border-border pt-3">
            <Text className="flex-1 text-caption uppercase tracking-[1.4px] text-muted-foreground">
              {selectedMember.name}
            </Text>
            <Text className="text-h5 text-destructive uppercase">
              {formatSignedVnd(-amount)}
            </Text>
          </View>
          {selectedTarget ? (
            <View className="flex-row items-center justify-between gap-4">
              <Text className="flex-1 text-caption uppercase tracking-[1.4px] text-muted-foreground">
                {selectedTarget.name}
              </Text>
              <Text className="text-h5 text-success uppercase">{formatSignedVnd(amount)}</Text>
            </View>
          ) : null}
        </View>
      </PaperCard>

      <View className="flex-row gap-2">
        <ActionPill
          label={copy.backToMember}
          icon="ArrowLeft"
          tone="neutral"
          onPress={() =>
            router.replace({
              pathname: '/member/[id]',
              params: { id: selectedMember.id },
            })
          }
          className="flex-1"
        />
        <ActionPill
          label={copy.confirm}
          icon="SendHorizontal"
          onPress={handleSubmit}
          disabled={!canSubmit}
          className="flex-1"
        />
      </View>
    </OrdernowsScreen>
  );
}
