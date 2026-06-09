import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { LanguageToggle } from '@/components/LanguageToggle';
import { MemberCard } from '@/components/ordernows/member-card';
import {
  ActionPill,
  FilterChip,
  OrdernowsScreen,
  PaperCard,
  StatTile,
} from '@/components/ordernows/primitives';
import { Text } from '@/components/ui/text';
import LucideIcon from '@/lib/icons/LucideIcon';
import { UNGROUPED_FILTER_ID, formatVnd } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const MEMBERS_COPY = {
  en: {
    title: 'Members',
    subtitle: 'Recharge wallets, monitor balances, and sort people into the right order group.',
    badge: (memberCount: number, groupCount: number) => `${memberCount} MEMBERS / ${groupCount} GROUPS`,
    totalBalance: 'Total Balance',
    totalBalanceHint: 'Wallets matching the current group filter',
    visibleMembers: 'Visible Members',
    visibleMembersHint: 'After group filter is applied',
    memberControls: 'Member Controls',
    peopleAndGrouping: 'People & grouping',
    addMember: 'Add Member',
    controlsDescription: 'Use chips to scope the roster, then jump into wallet actions.',
    allGroups: 'All Groups',
    unclassified: 'Unclassified',
    manageGroups: 'Manage Groups',
    createGroup: 'Create group',
    noMembers: 'No members in this group',
    noMembersDescription: 'Add a member or switch the filter to view another roster slice.',
  },
  vi: {
    title: 'Thành viên',
    subtitle: 'Nạp ví, theo dõi số dư và sắp xếp mọi người vào đúng nhóm đặt món.',
    badge: (memberCount: number, groupCount: number) => `${memberCount} THÀNH VIÊN / ${groupCount} NHÓM`,
    totalBalance: 'Tổng số dư',
    totalBalanceHint: 'Tổng số dư ví theo bộ lọc nhóm hiện tại',
    visibleMembers: 'Thành viên hiển thị',
    visibleMembersHint: 'Sau khi áp dụng bộ lọc nhóm',
    memberControls: 'Quản lý thành viên',
    peopleAndGrouping: 'Thành viên & nhóm',
    addMember: 'Thêm thành viên',
    controlsDescription: 'Chọn nhóm để lọc danh sách, sau đó mở thao tác ví khi cần.',
    allGroups: 'Tất cả nhóm',
    unclassified: 'Chưa phân nhóm',
    manageGroups: 'Quản lý nhóm',
    createGroup: 'Tạo nhóm',
    noMembers: 'Nhóm này chưa có thành viên',
    noMembersDescription: 'Thêm thành viên hoặc chọn nhóm khác để xem danh sách.',
  },
} as const;

export default function MembersScreen() {
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const { language } = useLanguage();
  const copy = MEMBERS_COPY[language];
  const groups = useOrdernowsStore((state) => state.groups);
  const members = useOrdernowsStore((state) => state.members);

  const filteredMembers = useMemo(() => {
    if (selectedGroupId === 'all') {
      return members;
    }

    if (selectedGroupId === UNGROUPED_FILTER_ID) {
      return members.filter((member) => member.groupIds.length === 0);
    }

    return members.filter((member) => member.groupIds.includes(selectedGroupId));
  }, [members, selectedGroupId]);

  const totalBalance = filteredMembers.reduce((sum, member) => sum + member.balance, 0);

  return (
    <OrdernowsScreen
      title={copy.title}
      subtitle={copy.subtitle}
      badge={copy.badge(members.length, groups.length)}
      headerAction={<LanguageToggle />}>
      <View className="mb-4">
        <Text className="text-caption uppercase tracking-[1.8px] text-muted-foreground">
          {copy.memberControls}
        </Text>
        <View className="mt-1 flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-h3 text-foreground uppercase">{copy.peopleAndGrouping}</Text>
          <ActionPill
            label={copy.addMember}
            icon="UserPlus"
            onPress={() => router.push('/member/new')}
          />
        </View>
        <Text className="mt-1 text-body text-muted-foreground">
          {copy.controlsDescription}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <FilterChip
          label={copy.allGroups}
          icon="UsersRound"
          active={selectedGroupId === 'all'}
          onPress={() => setSelectedGroupId('all')}
        />
        <FilterChip
          label={copy.unclassified}
          icon="UserRound"
          active={selectedGroupId === UNGROUPED_FILTER_ID}
          onPress={() => setSelectedGroupId(UNGROUPED_FILTER_ID)}
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

      <View className="mb-6 flex-row gap-2">
        <ActionPill
          label={copy.manageGroups}
          icon="Settings2"
          tone="secondary"
          onPress={() => router.push('/group/manage')}
          className="flex-[4]"
        />
        <Pressable
          accessibilityLabel={copy.createGroup}
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/group/manage',
              params: { intent: 'create' },
            })
          }
          className="flex-1 items-center justify-center rounded-[22px] border-2 border-primary bg-primary px-4 py-3 active:opacity-80">
          <LucideIcon name="Plus" className="text-primary-foreground" size={18} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View className="mb-6 flex-row gap-3">
        <StatTile label={copy.totalBalance} value={formatVnd(totalBalance)} hint={copy.totalBalanceHint} />
        <StatTile label={copy.visibleMembers} value={`${filteredMembers.length}`} hint={copy.visibleMembersHint} />
      </View>

      {filteredMembers.map((member) => (
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
        />
      ))}

      {filteredMembers.length === 0 ? (
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.noMembers}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.noMembersDescription}
          </Text>
        </PaperCard>
      ) : null}
    </OrdernowsScreen>
  );
}
