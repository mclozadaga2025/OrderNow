import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { localizeOrdernowsText } from '@/lib/localizeOrdernows';
import { formatVnd, parseVndInput, quickTopUpAmounts } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const TOP_UP_COPY = {
  en: {
    title: 'Top Up Wallet',
    missingSubtitle: 'The selected member could not be loaded.',
    badge: 'TOP UP',
    missingTitle: 'Missing member',
    missingDescription: 'Go back to the roster and reopen the top-up flow from a valid card.',
    backToMembers: 'Back to Members',
    subtitle: 'Recharge a member, update the balance instantly, and create a credit transaction in one step.',
    credit: 'CREDIT',
    unknown: 'Unknown',
    currentBalance: 'Current balance',
    recharge: 'Recharge',
    fundingInputs: 'Funding inputs',
    fundingDescription: 'Use a quick amount or type a custom VND value.',
    amount: 'Amount (VND)',
    amountHint: 'The wallet preview below updates as you type.',
    note: 'Note',
    notePlaceholder: 'Momo transfer, cash received, office float...',
    balancePreview: 'Balance Preview',
    previewDescription: 'Confirming creates a credit row and updates the wallet immediately.',
    confirm: 'Confirm Top Up',
    backToMember: 'Back to Member',
  },
  vi: {
    title: 'Nạp tiền vào ví',
    missingSubtitle: 'Không thể tải thành viên đã chọn.',
    badge: 'NẠP TIỀN',
    missingTitle: 'Không tìm thấy thành viên',
    missingDescription: 'Quay lại danh sách và mở luồng nạp tiền từ một thẻ hợp lệ.',
    backToMembers: 'Quay lại thành viên',
    subtitle: 'Nạp tiền, cập nhật số dư ngay lập tức và tạo giao dịch tiền vào trong một bước.',
    credit: 'TIỀN VÀO',
    unknown: 'Chưa cập nhật',
    currentBalance: 'Số dư hiện tại',
    recharge: 'Nạp tiền',
    fundingInputs: 'Thông tin nạp tiền',
    fundingDescription: 'Chọn số tiền nhanh hoặc nhập giá trị VND tùy chỉnh.',
    amount: 'Số tiền (VND)',
    amountHint: 'Số dư dự kiến bên dưới cập nhật khi bạn nhập.',
    note: 'Ghi chú',
    notePlaceholder: 'Chuyển khoản Momo, nhận tiền mặt...',
    balancePreview: 'Số dư dự kiến',
    previewDescription: 'Xác nhận sẽ tạo khoản tiền vào và cập nhật ví ngay lập tức.',
    confirm: 'Xác nhận nạp tiền',
    backToMember: 'Quay lại thành viên',
  },
} as const;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function MemberTopUpScreen() {
  const { language } = useLanguage();
  const copy = TOP_UP_COPY[language];
  const params = useLocalSearchParams<{ id: string }>();
  const memberId = getParamValue(params.id);
  const members = useOrdernowsStore((state) => state.members);
  const topUpMember = useOrdernowsStore((state) => state.topUpMember);
  const member = members.find((entry) => entry.id === memberId);
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');

  const amount = parseVndInput(amountInput);
  const nextBalance = member ? member.balance + amount : amount;

  const selectedMember = member;

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
            <ActionPill label={copy.backToMembers} icon="ArrowLeft" tone="secondary" onPress={() => router.replace('/(tabs)/members')} />
          </View>
        </PaperCard>
      </OrdernowsScreen>
    );
  }

  const selectedMemberId = selectedMember.id;

  function handleSubmit() {
    if (amount <= 0) {
      return;
    }

    const transactionId = topUpMember(selectedMemberId, amount, note.trim() || undefined);

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
      badge={`${selectedMember.initials} / ${copy.credit}`}>
      <PaperCard className="mb-6 p-5">
        <View className="flex-row items-start gap-4">
          <AvatarBadge avatar={selectedMember.avatar} size="lg" />

          <View className="flex-1">
            <Text className="text-h2 text-foreground uppercase">{selectedMember.name}</Text>
            <Text className="mt-1 text-body text-muted-foreground">
              {localizeOrdernowsText(selectedMember.favoriteDrink || copy.unknown, language)}
            </Text>
            <Text className="mt-3 text-caption uppercase tracking-[1.6px] text-muted-foreground">
              {copy.currentBalance}
            </Text>
            <Text className="mt-1 text-h2 text-foreground uppercase">{formatVnd(selectedMember.balance)}</Text>
          </View>
        </View>
      </PaperCard>

      <SectionHeading
        eyebrow={copy.recharge}
        title={copy.fundingInputs}
        description={copy.fundingDescription}
      />

      <FormField
        label={copy.amount}
        icon="Wallet"
        keyboardType="numeric"
        value={amountInput}
        onChangeText={setAmountInput}
        placeholder="100000"
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
        <Text className="mt-2 text-h2 text-foreground uppercase">{formatVnd(nextBalance)}</Text>
        <Text className="mt-1 text-body text-muted-foreground">
          {copy.previewDescription}
        </Text>
      </PaperCard>

      <View className="flex-row gap-2">
        <ActionPill
          label={copy.backToMember}
          icon="ArrowLeft"
          tone="neutral"
          onPress={() =>
            router.replace({
              pathname: '/member/[id]',
              params: { id: selectedMemberId },
            })
          }
          className="flex-1"
        />
        <ActionPill
          label={copy.confirm}
          icon="CircleCheck"
          onPress={handleSubmit}
          className="flex-1"
        />
      </View>
    </OrdernowsScreen>
  );
}
