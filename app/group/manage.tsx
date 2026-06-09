import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { GroupRow } from '@/components/ordernows/group-row';
import {
  ActionPill,
  FormField,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
} from '@/components/ordernows/primitives';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import type { Group } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const GROUP_MANAGE_COPY = {
  en: {
    title: 'Manage Groups',
    subtitle: 'Create team slices that drive filtering across members, home activity, and new transactions.',
    groups: 'GROUPS',
    addGroup: 'Add Group',
    addTitle: 'New groups appear immediately in every filter strip.',
    addDescription: 'Groups are stored locally. Deleting a group always asks how to handle its previous transaction history.',
    groupName: 'Group Name',
    groupPlaceholder: 'Weekend Crew, Designers...',
    tagline: 'Tagline',
    taglinePlaceholder: 'Short note shown in management views',
    currentGroups: 'Current Groups',
    rosterSlices: 'Roster slices',
    rosterDescription: 'Member counts update live from the local JSON ledger.',
    members: 'Members',
    emptyTitle: 'No groups yet',
    emptyDescription: 'Add a group here or import an Ordernows JSON file from Home.',
    confirmDeleteTitle: 'Delete group?',
    confirmDeleteDescription:
      'All members in this group will be deleted. Choose whether to also remove their previous transaction history from Home.',
    keepHistory: 'Keep History',
    deleteAll: 'Delete All',
  },
  vi: {
    title: 'Quản lý nhóm',
    subtitle: 'Tạo nhóm để lọc thành viên, hoạt động trang chủ và giao dịch mới.',
    groups: 'NHÓM',
    addGroup: 'Thêm nhóm',
    addTitle: 'Nhóm mới xuất hiện ngay trong mọi bộ lọc.',
    addDescription: 'Nhóm được lưu cục bộ. Khi xóa nhóm, ứng dụng luôn hỏi cách xử lý lịch sử giao dịch cũ.',
    groupName: 'Tên nhóm',
    groupPlaceholder: 'Nhóm cuối tuần, Thiết kế...',
    tagline: 'Mô tả ngắn',
    taglinePlaceholder: 'Ghi chú ngắn hiển thị trong trang quản lý',
    currentGroups: 'Nhóm hiện tại',
    rosterSlices: 'Danh sách nhóm',
    rosterDescription: 'Số thành viên được cập nhật trực tiếp từ sổ JSON cục bộ.',
    members: 'Thành viên',
    emptyTitle: 'Chưa có nhóm',
    emptyDescription: 'Thêm nhóm tại đây hoặc nhập tệp JSON Ordernows từ Trang chủ.',
    confirmDeleteTitle: 'Xóa nhóm?',
    confirmDeleteDescription:
      'Toàn bộ thành viên trong nhóm sẽ bị xóa. Chọn xóa cả lịch sử giao dịch ở Trang chủ hoặc giữ lại lịch sử cũ.',
    keepHistory: 'Giữ lịch sử',
    deleteAll: 'Xóa tất cả',
  },
} as const;

export default function GroupManageScreen() {
  const { language } = useLanguage();
  const copy = GROUP_MANAGE_COPY[language];
  const params = useLocalSearchParams<{ intent?: string }>();
  const groups = useOrdernowsStore((state) => state.groups);
  const members = useOrdernowsStore((state) => state.members);
  const addGroup = useOrdernowsStore((state) => state.addGroup);
  const deleteGroup = useOrdernowsStore((state) => state.deleteGroup);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [pendingDeleteGroup, setPendingDeleteGroup] = useState<Group | null>(null);

  function handleSubmit() {
    if (!name.trim()) {
      return;
    }

    addGroup({
      name: name.trim(),
      tagline: tagline.trim(),
    });

    setName('');
    setTagline('');
  }

  function handleConfirmDelete(keepTransactionHistory: boolean) {
    if (!pendingDeleteGroup) {
      return;
    }

    deleteGroup(pendingDeleteGroup.id, { keepTransactionHistory });
    setPendingDeleteGroup(null);
  }

  return (
    <OrdernowsScreen
      keyboardAware
      title={copy.title}
      subtitle={copy.subtitle}
      badge={`${groups.length} ${copy.groups}`}>
      <PaperCard className="mb-6 p-5">
        <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{copy.addGroup}</Text>
        <Text className="mt-2 text-h2 text-foreground uppercase">{copy.addTitle}</Text>
        <Text className="mt-2 text-body text-muted-foreground">
          {copy.addDescription}
        </Text>

        <View className="mt-5">
          <FormField
            label={copy.groupName}
            icon="UsersRound"
            value={name}
            onChangeText={setName}
            autoFocus={params.intent === 'create'}
            placeholder={copy.groupPlaceholder}
          />
          <FormField
            label={copy.tagline}
            icon="NotebookText"
            value={tagline}
            onChangeText={setTagline}
            placeholder={copy.taglinePlaceholder}
          />
        </View>

        <ActionPill label={copy.addGroup} icon="Plus" onPress={handleSubmit} />
      </PaperCard>

      <SectionHeading
        eyebrow={copy.currentGroups}
        title={copy.rosterSlices}
        description={copy.rosterDescription}
      />

      {groups.map((group) => {
        const count = members.filter((member) => member.groupIds.includes(group.id)).length;

        return (
          <GroupRow
            key={group.id}
            group={group}
            memberCount={count}
            membersLabel={copy.members}
            language={language}
            onDelete={() => setPendingDeleteGroup(group)}
            onPress={() =>
              router.push({
                pathname: '/group/[id]',
                params: { id: group.id },
              })
            }
          />
        );
      })}

      {groups.length === 0 ? (
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.emptyTitle}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.emptyDescription}
          </Text>
        </PaperCard>
      ) : null}

      <AlertDialog
        open={Boolean(pendingDeleteGroup)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteGroup(null);
          }
        }}>
        <AlertDialogContent className="w-full max-w-[360px] rounded-[28px] border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase">{copy.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{copy.confirmDeleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex-row">
            <AlertDialogAction
              onPress={() => handleConfirmDelete(true)}
              className="flex-1 rounded-[18px] border-2 border-border bg-background">
              <Text className="text-button text-foreground uppercase">{copy.keepHistory}</Text>
            </AlertDialogAction>
            <AlertDialogAction
              onPress={() => handleConfirmDelete(false)}
              className="flex-1 rounded-[18px] bg-destructive">
              <Text className="text-button text-destructive-foreground uppercase">
                {copy.deleteAll}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OrdernowsScreen>
  );
}
