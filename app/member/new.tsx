import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, View, type TextInput } from 'react-native';
import {
  ActionPill,
  FilterChip,
  FormField,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
} from '@/components/ordernows/primitives';
import { Text } from '@/components/ui/text';
import LucideIcon from '@/lib/icons/LucideIcon';
import { localizeAvatarLabel } from '@/lib/localizeOrdernows';
import { UNGROUPED_FILTER_ID, avatarOptions } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const NEW_MEMBER_COPY = {
  en: {
    title: 'New Member',
    subtitle: 'Create a roster entry with an avatar mark, favorite drink, and default group assignment.',
    badge: 'ROSTER FORM',
    entryRules: 'Entry Rules',
    rulesTitle: 'One person, one wallet, immediate visibility.',
    rulesDescription: 'This flow stores the member in the local JSON ledger and makes the card available in every tab instantly.',
    fullName: 'Full Name',
    phone: 'Phone',
    favoriteDrink: 'Favorite Drink',
    favoriteDrinkPlaceholder: 'Salted coffee, matcha latte...',
    assignGroup: 'Assign Group',
    defaultGrouping: 'Default grouping',
    groupDescription: 'Leave the member in a working crew from the start.',
    addGroup: 'Add group',
    unclassified: 'Unclassified',
    avatarMark: 'Avatar Mark',
    chooseBadge: 'Choose a badge',
    avatarDescription: 'This icon appears on member cards and detail views.',
    backToMembers: 'Back to Members',
    backToGroup: 'Back to Group',
    backToTransaction: 'Back to Transaction',
    createMember: 'Create Member',
  },
  vi: {
    title: 'Thêm thành viên',
    subtitle: 'Tạo hồ sơ với biểu tượng, đồ uống yêu thích và nhóm mặc định.',
    badge: 'BIỂU MẪU THÀNH VIÊN',
    entryRules: 'Quy tắc',
    rulesTitle: 'Một người, một ví, hiển thị ngay lập tức.',
    rulesDescription: 'Hồ sơ được lưu vào sổ JSON cục bộ và xuất hiện ngay ở mọi tab.',
    fullName: 'Họ và tên',
    phone: 'Số điện thoại',
    favoriteDrink: 'Đồ uống yêu thích',
    favoriteDrinkPlaceholder: 'Cà phê muối, matcha latte...',
    assignGroup: 'Chọn nhóm',
    defaultGrouping: 'Nhóm mặc định',
    groupDescription: 'Xếp thành viên vào một nhóm ngay từ đầu.',
    addGroup: 'Thêm nhóm',
    unclassified: 'Chưa phân nhóm',
    avatarMark: 'Biểu tượng',
    chooseBadge: 'Chọn biểu tượng',
    avatarDescription: 'Biểu tượng này hiển thị trên thẻ và trang chi tiết thành viên.',
    backToMembers: 'Quay lại thành viên',
    backToGroup: 'Quay lại nhóm',
    backToTransaction: 'Quay lại giao dịch',
    createMember: 'Tạo thành viên',
  },
} as const;

export default function NewMemberScreen() {
  const { language } = useLanguage();
  const copy = NEW_MEMBER_COPY[language];
  const params = useLocalSearchParams<{ returnTo?: string; groupId?: string }>();
  const groups = useOrdernowsStore((state) => state.groups);
  const addMember = useOrdernowsStore((state) => state.addMember);
  const shouldReturnToTransaction = params.returnTo === 'transaction';
  const shouldReturnToGroup = params.returnTo === 'group';
  const phoneInputRef = useRef<TextInput>(null);
  const favoriteDrinkInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [favoriteDrink, setFavoriteDrink] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(
    params.groupId === UNGROUPED_FILTER_ID ? '' : params.groupId ?? groups[0]?.id ?? ''
  );
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]?.id ?? 'UserRound');

  function leaveScreen() {
    if ((shouldReturnToTransaction || shouldReturnToGroup) && router.canGoBack()) {
      router.back();
      return;
    }

    if (shouldReturnToGroup && selectedGroupId) {
      router.replace({
        pathname: '/group/[id]',
        params: { id: selectedGroupId },
      });
      return;
    }

    router.replace('/(tabs)/members');
  }

  function handleSubmit() {
    if (!name.trim()) {
      return;
    }

    addMember({
      name: name.trim(),
      phone: phone.trim(),
      favoriteDrink: favoriteDrink.trim(),
      groupId: selectedGroupId,
      avatar: selectedAvatar,
    });

    leaveScreen();
  }

  return (
    <OrdernowsScreen
      keyboardAware
      title={copy.title}
      subtitle={copy.subtitle}
      badge={copy.badge}>
      <PaperCard className="mb-6 p-5">
        <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{copy.entryRules}</Text>
        <Text className="mt-2 text-h2 text-foreground uppercase">{copy.rulesTitle}</Text>
        <Text className="mt-2 text-body text-muted-foreground">
          {copy.rulesDescription}
        </Text>
      </PaperCard>

      <FormField
        label={copy.fullName}
        icon="UserRound"
        value={name}
        onChangeText={setName}
        placeholder="Nguyen Bao, Linh Tran..."
        autoCapitalize="words"
        returnKeyType="next"
        blurOnSubmit={false}
        textContentType="name"
        onSubmitEditing={() => phoneInputRef.current?.focus()}
      />
      <FormField
        ref={phoneInputRef}
        label={copy.phone}
        icon="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="+84 9xx xxx xxx"
        keyboardType="phone-pad"
        returnKeyType="next"
        blurOnSubmit={false}
        textContentType="telephoneNumber"
        onSubmitEditing={() => favoriteDrinkInputRef.current?.focus()}
      />
      <FormField
        ref={favoriteDrinkInputRef}
        label={copy.favoriteDrink}
        icon="Coffee"
        value={favoriteDrink}
        onChangeText={setFavoriteDrink}
        placeholder={copy.favoriteDrinkPlaceholder}
        autoCapitalize="sentences"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <SectionHeading
        eyebrow={copy.assignGroup}
        title={copy.defaultGrouping}
        description={copy.groupDescription}
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.addGroup}
            onPress={() => router.push('/group/manage')}
            className="h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card active:opacity-80">
            <LucideIcon name="Plus" className="text-foreground" size={16} strokeWidth={2.2} />
          </Pressable>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <FilterChip
          label={copy.unclassified}
          active={selectedGroupId === ''}
          onPress={() => setSelectedGroupId('')}
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
        eyebrow={copy.avatarMark}
        title={copy.chooseBadge}
        description={copy.avatarDescription}
      />

      <View className="mb-6 flex-row flex-wrap gap-3">
        {avatarOptions.map((avatar) => {
          const active = selectedAvatar === avatar.id;

          return (
            <Pressable
              key={avatar.id}
              onPress={() => setSelectedAvatar(avatar.id)}
              className={`w-[31%] rounded-[24px] border-2 p-4 active:opacity-80 ${
                active ? 'border-primary bg-primary' : 'border-border bg-card'
              }`}>
              <View className="items-center gap-3">
                <View
                  className={`h-14 w-14 items-center justify-center rounded-[18px] border-2 ${
                    active ? 'border-primary-foreground bg-primary-foreground' : 'border-border bg-secondary'
                  }`}>
                  <LucideIcon
                    name={avatar.id}
                    className={active ? 'text-primary' : 'text-foreground'}
                    size={24}
                    strokeWidth={1.9}
                  />
                </View>
                <Text
                  className={`text-caption uppercase tracking-[1.2px] ${
                    active ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                  {localizeAvatarLabel(avatar.id, language)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row gap-2">
        <ActionPill
          label={
            shouldReturnToTransaction
              ? copy.backToTransaction
              : shouldReturnToGroup
                ? copy.backToGroup
                : copy.backToMembers
          }
          icon="ArrowLeft"
          tone="neutral"
          onPress={leaveScreen}
          className="flex-1"
        />
        <ActionPill label={copy.createMember} icon="UserPlus" onPress={handleSubmit} className="flex-1" />
      </View>
    </OrdernowsScreen>
  );
}
