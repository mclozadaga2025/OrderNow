import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { localizeOrdernowsText } from '@/lib/localizeOrdernows';
import { type Group, type Member, formatVnd, getBalanceTone } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { cn } from '@/lib/utils';
import { ActionPill, AvatarBadge, PaperCard } from './primitives';

const MEMBER_CARD_COPY = {
  en: {
    currentBalance: 'Current Balance',
    ungrouped: 'Ungrouped',
    viewDetail: 'View Detail',
    topUp: 'Top Up',
    transfer: 'Transfer',
    noPhone: 'No phone on file',
    unknown: 'Unknown',
  },
  vi: {
    currentBalance: 'Số dư hiện tại',
    ungrouped: 'Chưa phân nhóm',
    viewDetail: 'Xem chi tiết',
    topUp: 'Nạp tiền',
    transfer: 'Trao đổi',
    noPhone: 'Chưa có số điện thoại',
    unknown: 'Chưa cập nhật',
  },
} as const;

interface MemberCardProps {
  member: Member;
  groups: Group[];
  onOpen?: () => void;
  onTopUp?: () => void;
  onTransfer?: () => void;
}

export function MemberCard({
  member,
  groups,
  onOpen,
  onTopUp,
  onTransfer,
}: MemberCardProps) {
  const { language } = useLanguage();
  const copy = MEMBER_CARD_COPY[language];
  const groupNames = groups.filter((group) => member.groupIds.includes(group.id)).map((group) => group.name);

  return (
    <PaperCard className="mb-4 p-5">
      <View className="flex-row items-start gap-4">
        <AvatarBadge avatar={member.avatar} size="lg" />

        <View className="flex-1">
          <Text className="text-h3 text-foreground uppercase">{member.name}</Text>

          {member.role ? (
            <Text className="mt-1 text-caption uppercase tracking-[1.7px] text-muted-foreground">
              {localizeOrdernowsText(member.role, language)}
            </Text>
          ) : null}

          <Text className="mt-2 text-body text-muted-foreground">
            {localizeOrdernowsText(member.favoriteDrink || copy.unknown, language)}
          </Text>
          <Text className="mt-1 text-caption uppercase tracking-[1.4px] text-muted-foreground">
            {localizeOrdernowsText(member.phone || copy.noPhone, language)}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row items-end justify-between gap-4">
        <View className="flex-1">
          <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{copy.currentBalance}</Text>
          <Text className={cn('mt-1 text-h2 uppercase', getBalanceTone(member.balance))}>
            {formatVnd(member.balance)}
          </Text>
        </View>

        <View className="max-w-[48%] flex-row flex-wrap justify-end gap-2">
          {groupNames.length > 0 ? (
            groupNames.map((name) => (
              <View key={name} className="rounded-full border-2 border-border bg-background px-3 py-1.5">
                <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
                  {name}
                </Text>
              </View>
            ))
          ) : (
            <View className="rounded-full border-2 border-border bg-background px-3 py-1.5">
              <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
                {copy.ungrouped}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="mt-5 gap-2">
        <ActionPill
          label={copy.viewDetail}
          icon="ArrowUpRight"
          tone="neutral"
          onPress={onOpen}
        />
        <View className="flex-row gap-2">
          <ActionPill
            label={copy.topUp}
            icon="Plus"
            tone="secondary"
            onPress={onTopUp}
            className="flex-1"
          />
          <ActionPill
            label={copy.transfer}
            icon="ArrowLeftRight"
            tone="secondary"
            onPress={onTransfer}
            className="flex-1"
          />
        </View>
      </View>
    </PaperCard>
  );
}
