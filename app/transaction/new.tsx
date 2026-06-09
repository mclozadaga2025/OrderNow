import { router } from 'expo-router';
import { forwardRef, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type KeyboardTypeOptions,
  type TextInput,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActionPill,
  AvatarBadge,
  FilterChip,
  FormField,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
} from '@/components/ordernows/primitives';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import LucideIcon from '@/lib/icons/LucideIcon';
import { localizeOrdernowsText } from '@/lib/localizeOrdernows';
import {
  type Member,
  type MenuItem,
  type TransactionParticipant,
  type Venue,
  UNGROUPED_FILTER_ID,
  formatVnd,
  parseVndInput,
} from '@/lib/ordernows';
import { type AppLanguage, useLanguage } from '@/lib/useLanguage';
import { cn } from '@/lib/utils';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';
import { showNewTransactionInterstitial } from '@/components/ads/new-transaction-interstitial';

const DEFAULT_DISCOUNT = '';
const DEFAULT_TOTAL_AMOUNT = 0;

const NEW_TRANSACTION_COPY = {
  en: {
    menuItems: (count: number) => `${count} menu items`,
    shareFromRemaining: (amount: string) => `Share from remaining bill: ${amount}`,
    totalDue: (amount: string) => `Total due: ${amount}`,
    itemOptional: 'Item - optional',
    selectItem: 'Select item',
    noMenuItems: 'No menu items',
    noItem: 'No item',
    closeItemPicker: 'Close item picker',
    itemName: 'Item name',
    amountOptional: 'Amount - optional',
    amountRequired: 'Amount *',
    discountPercent: 'Discount %',
    afterDiscount: (percent: number, amount: string) => `After ${percent}% off: ${amount}`,
    title: 'New Transaction',
    subtitle: 'Create a shared debit with menu items, member-level discounts, and split totals.',
    badge: 'NEW DEBIT',
    builder: 'Transaction Builder',
    sharedTab: 'Shared Tab',
    noGroupSelected: 'No group selected',
    unclassified: 'Unclassified',
    totalAmount: 'Total amount (VND) - optional',
    totalHint: 'Optional: enter the bill total to split its remainder, or leave blank to use member amounts only.',
    totalTooSmall: (amount: string) => `Total amount cannot be lower than member amounts (${amount}).`,
    remainsForSharing: (amount: string) => `${amount} remains for members with the share icon on.`,
    applyAllDiscount: 'Discount % (apply to all) - optional',
    apply: 'Apply',
    discountHint: 'Discounts reduce member amounts once. The entered bill total is not discounted again.',
    group: 'Group',
    selectGroup: 'Select group',
    createGroup: 'Create group',
    groupRequired: 'No saved groups yet. You can use unclassified members or add a group.',
    manageGroups: 'Manage Groups',
    venue: 'Venue',
    selectVenue: 'Select venue - optional',
    noVenue: 'No venue',
    noVenues: 'No venues saved yet. You can continue without one or add a venue for quick menu choices.',
    addVenue: 'Add Venue',
    members: 'Members',
    chooseParticipants: 'Choose participants',
    noGroupMembers: 'This group does not have members yet.',
    selectGroupPrompt: 'Select a group to choose participants.',
    addMember: 'Add Member',
    orderDetails: 'Order details',
    memberOrders: 'Member orders',
    addOrder: 'Add dish',
    removeOrder: 'Remove dish',
    removeMember: 'Remove member',
    dishLabel: (index: number) => `Dish ${index}`,
    noOrders: 'Select at least one member to add order rows.',
    noteOptional: 'Note - optional',
    notePlaceholder: 'Optional note...',
    requestedTotal: 'Requested total',
    optional: 'Optional',
    beforeDiscount: (amount: string) => `Member amounts before discount: ${amount}`,
    sharedSplit: 'Shared split',
    unassigned: (amount: string) => `${amount} is not assigned because sharing is off.`,
    divided: (count: number) => `Divided between ${count} member(s) with the share icon on.`,
    enableSharing: 'Turn on a share icon to divide the remaining bill.',
    discount: 'Discount',
    totalCharged: 'Total charged',
    minimumError: (amount: string) => `Total amount must be at least ${amount}.`,
    amountError: 'Enter an amount for each selected member order, or turn on share with a total amount so the remaining bill can be assigned.',
    save: 'Save Transaction',
  },
  vi: {
    menuItems: (count: number) => `${count} món`,
    shareFromRemaining: (amount: string) => `Phần chia từ số tiền còn lại: ${amount}`,
    totalDue: (amount: string) => `Tổng cần trả: ${amount}`,
    itemOptional: 'Món - tùy chọn',
    selectItem: 'Chọn món',
    noMenuItems: 'Chưa có món',
    noItem: 'Không chọn món',
    closeItemPicker: 'Đóng danh sách món',
    itemName: 'Tên món',
    amountOptional: 'Số tiền - tùy chọn',
    amountRequired: 'Số tiền *',
    discountPercent: 'Giảm giá %',
    afterDiscount: (percent: number, amount: string) => `Sau khi giảm ${percent}%: ${amount}`,
    title: 'Tạo giao dịch',
    subtitle: 'Tạo khoản chi chung với món, giảm giá theo thành viên và tổng tiền chia.',
    badge: 'KHOẢN CHI MỚI',
    builder: 'Tạo giao dịch',
    sharedTab: 'Chi chung',
    noGroupSelected: 'Chưa chọn nhóm',
    unclassified: 'Chưa phân nhóm',
    totalAmount: 'Tổng tiền (VND) - tùy chọn',
    totalHint: 'Tùy chọn: nhập tổng hóa đơn để chia phần còn lại, hoặc để trống và chỉ dùng số tiền từng thành viên.',
    totalTooSmall: (amount: string) => `Tổng tiền không thể thấp hơn tiền của các thành viên (${amount}).`,
    remainsForSharing: (amount: string) => `${amount} còn lại cho các thành viên đã bật biểu tượng chia.`,
    applyAllDiscount: 'Giảm giá % (áp dụng tất cả) - tùy chọn',
    apply: 'Áp dụng',
    discountHint: 'Giảm giá chỉ trừ vào tiền thành viên một lần. Tổng hóa đơn đã nhập không bị giảm lần nữa.',
    group: 'Nhóm',
    selectGroup: 'Chọn nhóm',
    createGroup: 'Tạo nhóm',
    groupRequired: 'Chưa có nhóm đã lưu. Bạn có thể dùng thành viên chưa phân nhóm hoặc thêm nhóm.',
    manageGroups: 'Quản lý nhóm',
    venue: 'Địa điểm',
    selectVenue: 'Chọn địa điểm - tùy chọn',
    noVenue: 'Không chọn địa điểm',
    noVenues: 'Chưa lưu địa điểm. Bạn có thể tiếp tục hoặc thêm địa điểm để chọn món nhanh.',
    addVenue: 'Thêm địa điểm',
    members: 'Thành viên',
    chooseParticipants: 'Chọn người tham gia',
    noGroupMembers: 'Nhóm này chưa có thành viên.',
    selectGroupPrompt: 'Chọn nhóm để chọn người tham gia.',
    addMember: 'Thêm thành viên',
    orderDetails: 'Chi tiết đặt món',
    memberOrders: 'Món của thành viên',
    addOrder: 'Thêm món',
    removeOrder: 'Xóa món',
    removeMember: 'Xóa thành viên',
    dishLabel: (index: number) => `Món ${index}`,
    noOrders: 'Chọn ít nhất một thành viên để thêm món.',
    noteOptional: 'Ghi chú - tùy chọn',
    notePlaceholder: 'Ghi chú tùy chọn...',
    requestedTotal: 'Tổng yêu cầu',
    optional: 'Tùy chọn',
    beforeDiscount: (amount: string) => `Tiền thành viên trước giảm giá: ${amount}`,
    sharedSplit: 'Phần chia chung',
    unassigned: (amount: string) => `${amount} chưa được phân bổ vì chưa bật chia.`,
    divided: (count: number) => `Đã chia cho ${count} thành viên bật biểu tượng chia.`,
    enableSharing: 'Bật biểu tượng chia để phân bổ phần hóa đơn còn lại.',
    discount: 'Giảm giá',
    totalCharged: 'Tổng tính tiền',
    minimumError: (amount: string) => `Tổng tiền phải ít nhất là ${amount}.`,
    amountError: 'Nhập tiền cho món của từng thành viên, hoặc nhập tổng tiền và bật chia để phân bổ phần còn lại.',
    save: 'Lưu giao dịch',
  },
} as const;

type NewTransactionCopy = (typeof NEW_TRANSACTION_COPY)[keyof typeof NEW_TRANSACTION_COPY];

interface MemberOrderDraft {
  id: string;
  menuItemId: string;
  customItemName: string;
  amountInput: string;
  discountInput: string;
}

interface OrderLineSummary {
  draftId: string;
  itemName: string;
  rawAmount: number;
  discountPercent: number;
  discountAmount: number;
  discountedAmount: number;
}

interface OrderRowSummary {
  memberId: string;
  itemName: string;
  lineSummaries: OrderLineSummary[];
  rawAmount: number;
  discountAmount: number;
  discountedAmount: number;
  splitShare: number;
  total: number;
  sharePercent: number;
  shared: boolean;
}

function formatInputAmount(value: number, options?: { allowZero?: boolean }) {
  if (value < 0 || (value === 0 && !options?.allowZero)) {
    return '';
  }

  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatAmountInput(value: string, options?: { allowZero?: boolean }) {
  const hasDigit = /\d/.test(value);

  if (!hasDigit) {
    return '';
  }

  return formatInputAmount(parseVndInput(value), options);
}

function clampPercent(value: string) {
  const numericValue = Number(value.replace(/[^0-9.]/g, ''));

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(Math.max(numericValue, 0), 100);
}

function calculateDiscountedAmount(amount: number, discountPercent: number) {
  return Math.max(Math.round(amount * (1 - discountPercent / 100)), 0);
}

let nextOrderDraftOrdinal = 0;

function createOrderDraft(discountInput: string): MemberOrderDraft {
  return {
    id: `order-draft-${Date.now()}-${nextOrderDraftOrdinal++}`,
    menuItemId: '',
    customItemName: '',
    amountInput: '',
    discountInput,
  };
}

function getSelectedGroupMembers(members: Member[], selectedGroupId: string) {
  if (selectedGroupId === UNGROUPED_FILTER_ID) {
    return members.filter((member) => member.groupIds.length === 0);
  }

  return members.filter((member) => member.groupIds.includes(selectedGroupId));
}

function CardField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={cn('mb-3', className)}>
      <Text className="mb-2 text-caption uppercase tracking-[1.7px] text-muted-foreground">
        {label}
      </Text>
      {children}
    </View>
  );
}

interface OrderInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  className?: string;
  returnKeyType?: TextInputProps['returnKeyType'];
  blurOnSubmit?: TextInputProps['blurOnSubmit'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
}

const OrderInput = forwardRef<TextInput, OrderInputProps>(function OrderInput(
  {
    value,
    onChangeText,
    placeholder,
    keyboardType,
    className,
    returnKeyType,
    blurOnSubmit,
    onSubmitEditing,
  },
  ref
) {
  return (
    <View className={cn('rounded-[20px] border-2 border-border bg-background px-4 py-3', className)}>
      <Input
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderClassName="text-muted-foreground"
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        onSubmitEditing={onSubmitEditing}
        className="h-auto min-h-[24px] border-0 bg-transparent px-0 py-0 text-body text-foreground native:text-base"
      />
    </View>
  );
});

function MenuItemOptionLabel({ item }: { item: MenuItem }) {
  return (
    <View className="min-w-0 flex-1 flex-row items-center justify-between gap-4">
      <Text className="min-w-0 flex-1 text-body text-foreground" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="shrink-0 text-caption uppercase text-muted-foreground">
        {formatVnd(item.price)}
      </Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View className="border-b border-border py-3 last:border-b-0">
      <View className="flex-row items-center justify-between gap-4">
        <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">
          {label}
        </Text>
        <Text className="text-h4 text-foreground uppercase">{value}</Text>
      </View>
      {hint ? <Text className="mt-1 text-caption text-muted-foreground">{hint}</Text> : null}
    </View>
  );
}

function VenueOptionCard({
  venue,
  active,
  onPress,
  copy,
  language,
}: {
  venue: Venue;
  active: boolean;
  onPress: () => void;
  copy: NewTransactionCopy;
  language: AppLanguage;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mr-3 w-64 rounded-[24px] border-2 p-4 active:opacity-80',
        active ? 'border-primary bg-primary' : 'border-border bg-card'
      )}>
      <View className="mb-4 flex-row items-start justify-between gap-3">
        <View
          className={cn(
            'h-12 w-12 items-center justify-center rounded-[18px] border-2',
            active ? 'border-primary-foreground bg-primary-foreground' : 'border-border bg-secondary'
          )}>
          <LucideIcon
            name={venue.icon}
            className={active ? 'text-primary' : 'text-foreground'}
            size={20}
            strokeWidth={1.9}
          />
        </View>
        <Text
          className={cn(
            'rounded-full border px-2 py-1 text-caption uppercase tracking-[1.5px]',
            active
              ? 'border-primary-foreground text-primary-foreground'
              : 'border-border text-muted-foreground'
          )}>
          {venue.openUntil}
        </Text>
      </View>
      <Text className={cn('text-h4 uppercase', active ? 'text-primary-foreground' : 'text-foreground')}>
        {venue.name}
      </Text>
      <Text
        className={cn(
          'mt-1 text-body',
          active ? 'text-primary-foreground' : 'text-muted-foreground'
        )}
        numberOfLines={1}>
        {localizeOrdernowsText(venue.address || (language === 'vi' ? 'Chưa có địa chỉ' : 'No address yet'), language)}
      </Text>
      <Text
        className={cn(
          'mt-3 text-caption uppercase tracking-[1.5px]',
          active ? 'text-primary-foreground' : 'text-muted-foreground'
        )}>
        {copy.menuItems(venue.menuItems.length)}
      </Text>
    </Pressable>
  );
}

function MemberSelectorCard({
  member,
  active,
  onPress,
  language,
}: {
  member: Member;
  active: boolean;
  onPress: () => void;
  language: AppLanguage;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mr-3 w-44 rounded-[24px] border-2 p-3 active:opacity-80',
        active ? 'border-foreground bg-foreground' : 'border-border bg-card'
      )}>
      <View className="mb-3 flex-row items-center justify-between gap-2">
        <AvatarBadge avatar={member.avatar} size="sm" />
        {active ? (
          <View className="h-8 w-8 items-center justify-center rounded-full bg-background">
            <LucideIcon name="Check" className="text-foreground" size={15} strokeWidth={2.2} />
          </View>
        ) : null}
      </View>
      <Text
        className={cn('text-button uppercase tracking-[1.2px]', active ? 'text-background' : 'text-foreground')}
        numberOfLines={1}>
        {member.name}
      </Text>
      <Text
        className={cn('mt-1 text-caption', active ? 'text-background' : 'text-muted-foreground')}
        numberOfLines={1}>
        {localizeOrdernowsText(member.favoriteDrink || (language === 'vi' ? 'Chưa cập nhật' : 'Unknown'), language)}
      </Text>
    </Pressable>
  );
}

function OrderLineEditor({
  draft,
  summary,
  index,
  canRemove,
  hasRequestedTotal,
  isShared,
  hasSelectedVenue,
  menuItems,
  onSelectMenuItem,
  onUpdate,
  onRemove,
  copy,
}: {
  draft: MemberOrderDraft;
  summary: OrderLineSummary;
  index: number;
  canRemove: boolean;
  hasRequestedTotal: boolean;
  isShared: boolean;
  hasSelectedVenue: boolean;
  menuItems: MenuItem[];
  onSelectMenuItem: (item: MenuItem | undefined) => void;
  onUpdate: (patch: Partial<MemberOrderDraft>) => void;
  onRemove: () => void;
  copy: NewTransactionCopy;
}) {
  const [isNativeItemPickerOpen, setIsNativeItemPickerOpen] = useState(false);
  const amountInputRef = useRef<TextInput>(null);
  const discountInputRef = useRef<TextInput>(null);
  const selectedMenuItem = menuItems.find((item) => item.id === draft.menuItemId);

  function selectNativeMenuItem(item: MenuItem | undefined) {
    setIsNativeItemPickerOpen(false);
    onSelectMenuItem(item);
  }

  return (
    <View className={cn(index > 0 && 'mt-4 border-t border-border pt-4')}>
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Text className="text-caption uppercase tracking-[1.5px] text-muted-foreground">
          {copy.dishLabel(index + 1)}
        </Text>
        {canRemove ? (
          <Pressable
            accessibilityLabel={copy.removeOrder}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onRemove}
            className="h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background active:opacity-80">
            <LucideIcon name="X" className="text-destructive" size={14} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      <CardField label={copy.itemOptional}>
        {hasSelectedVenue ? (
          Platform.OS === 'web' ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={menuItems.length === 0}
                className="min-h-[52px] flex-row items-center justify-between gap-3 rounded-[20px] border-2 border-border bg-background px-4 py-3 active:opacity-80">
                <Text
                  className={cn(
                    'flex-1 text-body',
                    selectedMenuItem ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  numberOfLines={1}>
                  {selectedMenuItem?.name ?? (menuItems.length > 0 ? copy.selectItem : copy.noMenuItems)}
                </Text>
                <LucideIcon name="ChevronDown" className="text-muted-foreground" size={16} strokeWidth={2} />
              </DropdownMenuTrigger>
              {menuItems.length > 0 ? (
                <DropdownMenuContent align="start" className="min-w-[280px] rounded-[18px] border-2 border-border bg-card p-1">
                  <DropdownMenuItem onPress={() => onSelectMenuItem(undefined)} className="px-3 py-3">
                    <View className="w-4">
                      {!selectedMenuItem ? (
                        <LucideIcon name="Check" className="text-foreground" size={15} strokeWidth={2.3} />
                      ) : null}
                    </View>
                    <Text className="flex-1 text-body text-foreground">{copy.noItem}</Text>
                  </DropdownMenuItem>
                  {menuItems.map((item) => (
                    <DropdownMenuItem key={item.id} onPress={() => onSelectMenuItem(item)} className="px-3 py-3">
                      <View className="w-4">
                        {draft.menuItemId === item.id ? (
                          <LucideIcon name="Check" className="text-foreground" size={15} strokeWidth={2.3} />
                        ) : null}
                      </View>
                      <MenuItemOptionLabel item={item} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              ) : null}
            </DropdownMenu>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                disabled={menuItems.length === 0}
                onPress={() => setIsNativeItemPickerOpen(true)}
                className="min-h-[52px] flex-row items-center justify-between gap-3 rounded-[20px] border-2 border-border bg-background px-4 py-3 active:opacity-80">
                <Text
                  className={cn(
                    'flex-1 text-body',
                    selectedMenuItem ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  numberOfLines={1}>
                  {selectedMenuItem?.name ?? (menuItems.length > 0 ? copy.selectItem : copy.noMenuItems)}
                </Text>
                <LucideIcon name="ChevronDown" className="text-muted-foreground" size={16} strokeWidth={2} />
              </Pressable>
              <Modal
                animationType="fade"
                navigationBarTranslucent
                onRequestClose={() => setIsNativeItemPickerOpen(false)}
                statusBarTranslucent
                transparent
                visible={isNativeItemPickerOpen && menuItems.length > 0}>
                <SafeAreaView className="flex-1 justify-end bg-overlay/80 px-4 py-6">
                  <Pressable
                    accessibilityLabel={copy.closeItemPicker}
                    accessibilityRole="button"
                    onPress={() => setIsNativeItemPickerOpen(false)}
                    style={StyleSheet.absoluteFill}
                  />
                  <View className="overflow-hidden rounded-[22px] border-2 border-border bg-card">
                    <View className="flex-row items-center justify-between gap-3 px-4 py-4">
                      <Text className="text-h4 text-foreground uppercase">{copy.selectItem}</Text>
                      <Pressable
                        accessibilityLabel={copy.closeItemPicker}
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => setIsNativeItemPickerOpen(false)}
                        className="h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-background active:opacity-80">
                        <LucideIcon name="X" className="text-foreground" size={15} strokeWidth={2.2} />
                      </Pressable>
                    </View>
                    <ScrollView className="max-h-80" keyboardShouldPersistTaps="handled">
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => selectNativeMenuItem(undefined)}
                        className="flex-row items-center gap-2 border-t border-border px-4 py-4 active:bg-secondary">
                        <View className="w-4">
                          {!selectedMenuItem ? (
                            <LucideIcon name="Check" className="text-foreground" size={15} strokeWidth={2.3} />
                          ) : null}
                        </View>
                        <Text className="text-body text-foreground">{copy.noItem}</Text>
                      </Pressable>
                      {menuItems.map((item) => (
                        <Pressable
                          accessibilityRole="button"
                          key={item.id}
                          onPress={() => selectNativeMenuItem(item)}
                          className="flex-row items-center gap-2 border-t border-border px-4 py-4 active:bg-secondary">
                          <View className="w-4">
                            {draft.menuItemId === item.id ? (
                              <LucideIcon name="Check" className="text-foreground" size={15} strokeWidth={2.3} />
                            ) : null}
                          </View>
                          <MenuItemOptionLabel item={item} />
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </SafeAreaView>
              </Modal>
            </>
          )
        ) : (
          <OrderInput
            value={draft.customItemName}
            onChangeText={(customItemName) => onUpdate({ customItemName, menuItemId: '' })}
            placeholder={copy.itemName}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => amountInputRef.current?.focus()}
          />
        )}
      </CardField>

      <View className="flex-row gap-3">
        <CardField label={hasRequestedTotal && isShared ? copy.amountOptional : copy.amountRequired} className="flex-1">
          <OrderInput
            ref={amountInputRef}
            value={draft.amountInput}
            onChangeText={(amountInput) =>
              onUpdate({ amountInput: formatAmountInput(amountInput, { allowZero: true }) })
            }
            keyboardType="numeric"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => discountInputRef.current?.focus()}
          />
        </CardField>
        <CardField label={copy.discountPercent} className="w-28">
          <OrderInput
            ref={discountInputRef}
            value={draft.discountInput}
            onChangeText={(discountInput) => onUpdate({ discountInput })}
            keyboardType="numeric"
            returnKeyType="done"
          />
        </CardField>
      </View>

      <Text className="text-caption text-muted-foreground">
        {copy.afterDiscount(summary.discountPercent, formatVnd(summary.discountedAmount))}
      </Text>
    </View>
  );
}

function OrderCard({
  member,
  drafts,
  summary,
  hasRequestedTotal,
  hasSelectedVenue,
  menuItems,
  onSelectMenuItem,
  onUpdate,
  onAddOrder,
  onRemoveOrder,
  onRemoveMember,
  onToggleShared,
  copy,
}: {
  member: Member;
  drafts: MemberOrderDraft[];
  summary: OrderRowSummary;
  hasRequestedTotal: boolean;
  hasSelectedVenue: boolean;
  menuItems: MenuItem[];
  onSelectMenuItem: (draftId: string, item: MenuItem | undefined) => void;
  onUpdate: (draftId: string, patch: Partial<MemberOrderDraft>) => void;
  onAddOrder: () => void;
  onRemoveOrder: (draftId: string) => void;
  onRemoveMember: () => void;
  onToggleShared: () => void;
  copy: NewTransactionCopy;
}) {
  return (
    <PaperCard className="mb-3 p-4">
      <View className="mb-4 flex-row items-start gap-3">
        <AvatarBadge avatar={member.avatar} size="sm" />

        <View className="flex-1">
          <Text className="text-h4 text-foreground uppercase">{member.name}</Text>
          <Text className="mt-1 text-caption text-success">
            {copy.shareFromRemaining(formatVnd(summary.splitShare))}
          </Text>
          <Text className="mt-1 text-caption text-muted-foreground">
            {copy.totalDue(formatVnd(summary.total))}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onToggleShared}
          className={cn(
            'h-10 w-10 items-center justify-center rounded-full border-2 active:opacity-80',
            summary.shared ? 'border-foreground bg-foreground' : 'border-border bg-background'
          )}>
          <LucideIcon
            name="Share2"
            className={summary.shared ? 'text-background' : 'text-foreground'}
            size={16}
            strokeWidth={2.2}
          />
        </Pressable>

        <Pressable
          accessibilityLabel={copy.addOrder}
          accessibilityRole="button"
          onPress={onAddOrder}
          className="h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background active:opacity-80">
          <LucideIcon name="Plus" className="text-foreground" size={17} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          accessibilityLabel={copy.removeMember}
          accessibilityRole="button"
          onPress={onRemoveMember}
          className="h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background active:opacity-80">
          <LucideIcon name="Minus" className="text-destructive" size={17} strokeWidth={2.2} />
        </Pressable>
      </View>

      {drafts.map((draft, index) => {
        const lineSummary =
          summary.lineSummaries.find((entry) => entry.draftId === draft.id) ??
          ({
            draftId: draft.id,
            itemName: draft.customItemName.trim() || 'Shared tab',
            rawAmount: parseVndInput(draft.amountInput),
            discountPercent: clampPercent(draft.discountInput),
            discountAmount: 0,
            discountedAmount: 0,
          } satisfies OrderLineSummary);

        return (
          <OrderLineEditor
            key={draft.id}
            draft={draft}
            summary={lineSummary}
            index={index}
            canRemove={drafts.length > 1}
            hasRequestedTotal={hasRequestedTotal}
            isShared={summary.shared}
            hasSelectedVenue={hasSelectedVenue}
            menuItems={menuItems}
            onSelectMenuItem={(item) => onSelectMenuItem(draft.id, item)}
            onUpdate={(patch) => onUpdate(draft.id, patch)}
            onRemove={() => onRemoveOrder(draft.id)}
            copy={copy}
          />
        );
      })}
    </PaperCard>
  );
}

export default function NewTransactionScreen() {
  const { language } = useLanguage();
  const copy = NEW_TRANSACTION_COPY[language];
  const groups = useOrdernowsStore((state) => state.groups);
  const members = useOrdernowsStore((state) => state.members);
  const venues = useOrdernowsStore((state) => state.venues);
  const addTransaction = useOrdernowsStore((state) => state.addTransaction);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [amountInput, setAmountInput] = useState(formatInputAmount(DEFAULT_TOTAL_AMOUNT));
  const [discountInput, setDiscountInput] = useState(DEFAULT_DISCOUNT);
  const [note, setNote] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [sharedMemberIds, setSharedMemberIds] = useState<string[]>([]);
  const [ordersByMember, setOrdersByMember] = useState<Record<string, MemberOrderDraft[]>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const selectedGroupLabel =
    selectedGroupId === UNGROUPED_FILTER_ID
      ? copy.unclassified
      : selectedGroup?.name ?? copy.noGroupSelected;
  const menuItems = useMemo(() => selectedVenue?.menuItems ?? [], [selectedVenue]);
  const groupMembers = useMemo(
    () => getSelectedGroupMembers(members, selectedGroupId),
    [members, selectedGroupId]
  );

  useEffect(() => {
    setSelectedGroupId((current) =>
      !current || current === UNGROUPED_FILTER_ID || groups.some((group) => group.id === current)
        ? current
        : ''
    );
  }, [groups]);

  useEffect(() => {
    setSelectedVenueId((current) =>
      venues.some((venue) => venue.id === current) ? current : ''
    );
  }, [venues]);

  useEffect(() => {
    const groupMemberIds = new Set(groupMembers.map((member) => member.id));

    setSelectedMemberIds((current) => current.filter((memberId) => groupMemberIds.has(memberId)));
    setSharedMemberIds((current) => current.filter((memberId) => groupMemberIds.has(memberId)));
  }, [groupMembers]);

  useEffect(() => {
    setOrdersByMember((current) =>
      Object.fromEntries(
        Object.entries(current).map(([memberId, drafts]) => [
          memberId,
          drafts.map((draft) => ({
            ...draft,
            menuItemId: '',
            customItemName: '',
            amountInput: '',
          })),
        ])
      )
    );
  }, [selectedVenueId]);

  useEffect(() => {
    setOrdersByMember((current) => {
      const next = { ...current };

      selectedMemberIds.forEach((memberId) => {
        const currentDrafts = next[memberId] ?? [];
        const nextDrafts = currentDrafts.map((draft) => {
          const selectedItemStillExists =
            !draft.menuItemId ||
            menuItems.some((item) => item.id === draft.menuItemId);

          return selectedItemStillExists
            ? draft
            : {
                ...draft,
                menuItemId: '',
                customItemName: '',
                amountInput: '',
              };
        });

        next[memberId] = nextDrafts.length > 0 ? nextDrafts : [createOrderDraft(discountInput)];
      });

      return next;
    });
  }, [discountInput, menuItems, selectedMemberIds]);

  const orderMath = useMemo(() => {
    const rows = selectedMemberIds.map((memberId) => {
      const drafts = ordersByMember[memberId] ?? [createOrderDraft(discountInput)];
      const lineSummaries = drafts.map((draft) => {
        const selectedMenuItem = menuItems.find((item) => item.id === draft.menuItemId);
        const itemName = draft.customItemName.trim() || selectedMenuItem?.name || 'Shared tab';
        const rawAmount = parseVndInput(draft.amountInput);
        const discountPercent = clampPercent(draft.discountInput);
        const discountedAmount = calculateDiscountedAmount(rawAmount, discountPercent);

        return {
          draftId: draft.id,
          itemName,
          rawAmount,
          discountPercent,
          discountAmount: rawAmount - discountedAmount,
          discountedAmount,
        };
      });
      const namedItems = lineSummaries
        .filter((line) => line.itemName !== 'Shared tab')
        .map((line) => line.itemName);
      const itemName = namedItems.length > 0 ? namedItems.join(', ') : 'Shared tab';
      const rawAmount = lineSummaries.reduce((sum, line) => sum + line.rawAmount, 0);
      const discountAmount = lineSummaries.reduce((sum, line) => sum + line.discountAmount, 0);
      const discountedAmount = lineSummaries.reduce((sum, line) => sum + line.discountedAmount, 0);

      return {
        memberId,
        itemName,
        lineSummaries,
        rawAmount,
        discountAmount,
        discountedAmount,
        splitShare: 0,
        total: 0,
        sharePercent: 0,
        shared: sharedMemberIds.includes(memberId),
      };
    });

    const requestedTotal = parseVndInput(amountInput);
    const lineSubtotal = rows.reduce((sum, row) => sum + row.rawAmount, 0);
    const discountedItemTotal = rows.reduce((sum, row) => sum + row.discountedAmount, 0);
    const hasRequestedTotal = requestedTotal > 0;
    const isRequestedTotalTooSmall = hasRequestedTotal && requestedTotal < lineSubtotal;
    const sharedPool = Math.max(requestedTotal - discountedItemTotal, 0);
    const membersSharing = rows.filter((row) => row.shared).map((row) => row.memberId);
    const baseSplit = membersSharing.length > 0 ? Math.floor(sharedPool / membersSharing.length) : 0;
    let remainingSharedPool = sharedPool;

    const rowsWithTotals = rows.map((row) => {
      const isShared = membersSharing.includes(row.memberId);
      const isLastShared = row.memberId === membersSharing[membersSharing.length - 1];
      const splitShare = isShared ? (isLastShared ? remainingSharedPool : baseSplit) : 0;

      if (isShared) {
        remainingSharedPool -= splitShare;
      }

      return {
        ...row,
        splitShare,
        total: row.discountedAmount + splitShare,
      };
    });

    const allocatedSharedPool = rowsWithTotals.reduce((sum, row) => sum + row.splitShare, 0);
    const finalTotal = rowsWithTotals.reduce((sum, row) => sum + row.total, 0);
    const summaries = rowsWithTotals.map((row) => ({
      ...row,
      sharePercent: finalTotal > 0 ? Math.round((row.total / finalTotal) * 100) : 0,
    }));
    const discountAmount = summaries.reduce((sum, row) => sum + row.discountAmount, 0);
    const subtotal = lineSubtotal + allocatedSharedPool;
    const discountValues = summaries.flatMap((row) =>
      row.lineSummaries
        .filter((line) => line.rawAmount > 0 || line.itemName !== 'Shared tab')
        .map((line) => line.discountPercent)
    );
    const uniformDiscount =
      discountValues.length > 0 && discountValues.every((value) => value === discountValues[0])
        ? discountValues[0]
        : undefined;

    const participants: TransactionParticipant[] = summaries.flatMap((row) => {
      const itemParticipants = row.lineSummaries
        .filter((line) => line.rawAmount > 0 || line.itemName !== 'Shared tab')
        .map((line) => ({
          memberId: row.memberId,
          item: line.itemName,
          amount: line.discountedAmount,
          sharePercent: finalTotal > 0 ? Math.round((line.discountedAmount / finalTotal) * 100) : 0,
          shared: false,
        }));

      if (row.splitShare <= 0) {
        return itemParticipants;
      }

      return [
        ...itemParticipants,
        {
          memberId: row.memberId,
          item: 'Shared split',
          amount: row.splitShare,
          sharePercent: finalTotal > 0 ? Math.round((row.splitShare / finalTotal) * 100) : 0,
          shared: true,
        },
      ];
    });

    return {
      summaries,
      participants,
      requestedTotal,
      lineSubtotal,
      discountedItemTotal,
      hasRequestedTotal,
      isRequestedTotalTooSmall,
      sharedPool,
      sharedMemberCount: membersSharing.length,
      allocatedSharedPool,
      unassignedSharedPool: sharedPool - allocatedSharedPool,
      subtotal,
      finalTotal,
      discountAmount,
      discountPercent: uniformDiscount,
    };
  }, [amountInput, discountInput, menuItems, ordersByMember, selectedMemberIds, sharedMemberIds]);

  const selectedMembersById = useMemo(
    () =>
      members.reduce<Record<string, Member>>((lookup, member) => {
        lookup[member.id] = member;
        return lookup;
      }, {}),
    [members]
  );

  const selectedMembers = useMemo(
    () =>
      selectedMemberIds
        .map((memberId) => selectedMembersById[memberId])
        .filter((member): member is Member => Boolean(member)),
    [selectedMemberIds, selectedMembersById]
  );

  const hasRequiredMemberAmounts =
    orderMath.summaries.length > 0 &&
    orderMath.summaries.every(
      (row) =>
        ordersByMember[row.memberId]?.some((draft) => /\d/.test(draft.amountInput)) ||
        (orderMath.hasRequestedTotal && row.shared && row.splitShare > 0)
    );
  const canSave = hasRequiredMemberAmounts && !orderMath.isRequestedTotalTooSmall;

  function toggleMember(memberId: string) {
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds((current) => current.filter((id) => id !== memberId));
      setSharedMemberIds((current) => current.filter((id) => id !== memberId));
      return;
    }

    setOrdersByMember((orders) =>
      orders[memberId]
        ? orders
        : {
            ...orders,
            [memberId]: [createOrderDraft(discountInput)],
          }
    );
    setSelectedMemberIds((current) =>
      current.includes(memberId) ? current : [...current, memberId]
    );
  }

  function openNewMember() {
    router.push({
      pathname: '/member/new',
      params: {
        returnTo: 'transaction',
        groupId: selectedGroupId,
      },
    });
  }

  function updateOrder(memberId: string, draftId: string, patch: Partial<MemberOrderDraft>) {
    setOrdersByMember((current) => {
      const drafts = current[memberId] ?? [createOrderDraft(discountInput)];

      return {
        ...current,
        [memberId]: drafts.map((draft) => (draft.id === draftId ? { ...draft, ...patch } : draft)),
      };
    });
  }

  function addMemberOrder(memberId: string) {
    setOrdersByMember((current) => ({
      ...current,
      [memberId]: [...(current[memberId] ?? [createOrderDraft(discountInput)]), createOrderDraft(discountInput)],
    }));
  }

  function removeMemberOrder(memberId: string, draftId: string) {
    setOrdersByMember((current) => {
      const drafts = current[memberId] ?? [];
      const nextDrafts = drafts.filter((draft) => draft.id !== draftId);

      return {
        ...current,
        [memberId]: nextDrafts.length > 0 ? nextDrafts : [createOrderDraft(discountInput)],
      };
    });
  }

  function toggleSharedMember(memberId: string) {
    setSharedMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  }

  function applyGlobalDiscount() {
    setOrdersByMember((current) => {
      const next = { ...current };

      selectedMemberIds.forEach((memberId) => {
        next[memberId] = (next[memberId] ?? [createOrderDraft(discountInput)]).map((draft) => ({
          ...draft,
          discountInput,
        }));
      });

      return next;
    });
  }

  async function handleSubmit() {
    setSubmitAttempted(true);

    if (!canSave || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const transactionId = addTransaction({
      title: selectedVenue?.name ?? 'Shared Tab',
      amount: orderMath.finalTotal,
      groupId: selectedGroupId === UNGROUPED_FILTER_ID ? '' : selectedGroupId,
      venueId: selectedVenueId || undefined,
      memberIds: selectedMemberIds,
      note: note.trim() || undefined,
      subtotal: orderMath.subtotal,
      discountPercent: orderMath.discountPercent,
      discountAmount: orderMath.discountAmount,
      totalShared: orderMath.finalTotal,
      participants: orderMath.participants,
    });

    await showNewTransactionInterstitial();

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
      badge={copy.badge}>
      <PaperCard className="mb-6 p-5">
        <View className="mb-5 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-caption uppercase tracking-[1.8px] text-muted-foreground">
              {copy.builder}
            </Text>
            <Text className="mt-2 text-h2 text-foreground uppercase">
              {selectedVenue?.name ?? copy.sharedTab}
            </Text>
            <Text className="mt-1 text-body text-muted-foreground">
              {selectedGroupLabel}
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-[18px] border-2 border-border bg-secondary">
            <LucideIcon name="ReceiptText" className="text-foreground" size={21} strokeWidth={1.9} />
          </View>
        </View>

        <FormField
          label={copy.totalAmount}
          icon="ReceiptText"
          value={amountInput}
          onChangeText={(value) => setAmountInput(formatAmountInput(value))}
          keyboardType="numeric"
          returnKeyType="done"
          hint={copy.totalHint}
        />
        {orderMath.isRequestedTotalTooSmall ? (
          <Text className="-mt-2 mb-4 text-caption text-destructive">
            {copy.totalTooSmall(formatVnd(orderMath.lineSubtotal))}
          </Text>
        ) : orderMath.hasRequestedTotal ? (
          <Text className="-mt-2 mb-4 text-caption text-muted-foreground">
            {copy.remainsForSharing(formatVnd(orderMath.sharedPool))}
          </Text>
        ) : null}
      </PaperCard>

      <SectionHeading
        eyebrow={copy.group}
        title={copy.selectGroup}
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.createGroup}
            onPress={() =>
              router.push({
                pathname: '/group/manage',
                params: { intent: 'create' },
              })
            }
            className="h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card active:opacity-80">
            <LucideIcon name="Plus" className="text-foreground" size={16} strokeWidth={2.2} />
          </Pressable>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
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
            icon="UsersRound"
            active={selectedGroupId === group.id}
            onPress={() => setSelectedGroupId(group.id)}
          />
        ))}
      </ScrollView>
      {groups.length === 0 ? (
        <PaperCard className="mb-6 p-5">
          <Text className="text-body text-muted-foreground">
            {copy.groupRequired}
          </Text>
          <View className="mt-4">
            <ActionPill
              label={copy.manageGroups}
              icon="UsersRound"
              tone="secondary"
              onPress={() => router.push('/group/manage')}
            />
          </View>
        </PaperCard>
      ) : null}

      <SectionHeading eyebrow={copy.venue} title={copy.selectVenue} />
      {venues.length > 0 ? (
        <>
          <View className="mb-3 flex-row">
            <FilterChip
              label={copy.noVenue}
              icon="CircleOff"
              active={!selectedVenueId}
              onPress={() => setSelectedVenueId('')}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {venues.map((venue) => (
              <VenueOptionCard
                key={venue.id}
                venue={venue}
                active={selectedVenueId === venue.id}
                onPress={() => setSelectedVenueId(venue.id)}
                copy={copy}
                language={language}
              />
            ))}
          </ScrollView>
        </>
      ) : (
        <PaperCard className="mb-6 p-5">
          <Text className="text-body text-muted-foreground">
            {copy.noVenues}
          </Text>
          <View className="mt-4">
            <ActionPill
              label={copy.addVenue}
              icon="Store"
              tone="secondary"
              onPress={() => router.push('/venue/new')}
            />
          </View>
        </PaperCard>
      )}

      <SectionHeading
        eyebrow={copy.members}
        title={copy.chooseParticipants}
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.addMember}
            onPress={openNewMember}
            className="h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card active:opacity-80">
            <LucideIcon name="UserPlus" className="text-foreground" size={16} strokeWidth={2.2} />
          </Pressable>
        }
      />
      {groupMembers.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {groupMembers.map((member) => (
            <MemberSelectorCard
              key={member.id}
              member={member}
              active={selectedMemberIds.includes(member.id)}
              onPress={() => toggleMember(member.id)}
              language={language}
            />
          ))}
        </ScrollView>
      ) : (
        <PaperCard className="mb-6 p-5">
          <Text className="text-body text-muted-foreground">
            {selectedGroupId
              ? copy.noGroupMembers
              : copy.selectGroupPrompt}
          </Text>
          <View className="mt-4">
            <ActionPill
              label={copy.addMember}
              icon="UserPlus"
              tone="secondary"
              onPress={openNewMember}
            />
          </View>
        </PaperCard>
      )}

      <SectionHeading eyebrow={copy.orderDetails} title={copy.memberOrders} />
      {selectedMembers.length > 0 ? (
        selectedMembers.map((member) => {
          const drafts = ordersByMember[member.id] ?? [createOrderDraft(discountInput)];
          const fallbackLineSummaries = drafts.map((draft) => {
            const selectedMenuItem = menuItems.find((item) => item.id === draft.menuItemId);
            const rawAmount = parseVndInput(draft.amountInput);
            const discountPercent = clampPercent(draft.discountInput);
            const discountedAmount = calculateDiscountedAmount(rawAmount, discountPercent);

            return {
              draftId: draft.id,
              itemName: draft.customItemName.trim() || selectedMenuItem?.name || 'Shared tab',
              rawAmount,
              discountPercent,
              discountAmount: rawAmount - discountedAmount,
              discountedAmount,
            };
          });
          const fallbackRawAmount = fallbackLineSummaries.reduce((sum, line) => sum + line.rawAmount, 0);
          const fallbackDiscountedAmount = fallbackLineSummaries.reduce(
            (sum, line) => sum + line.discountedAmount,
            0
          );
          const summary =
            orderMath.summaries.find((entry) => entry.memberId === member.id) ??
            ({
              memberId: member.id,
              itemName: fallbackLineSummaries.map((line) => line.itemName).join(', '),
              lineSummaries: fallbackLineSummaries,
              rawAmount: fallbackRawAmount,
              discountAmount: fallbackRawAmount - fallbackDiscountedAmount,
              discountedAmount: fallbackDiscountedAmount,
              splitShare: 0,
              total: 0,
              sharePercent: 0,
              shared: sharedMemberIds.includes(member.id),
            } satisfies OrderRowSummary);

          return (
            <OrderCard
              key={member.id}
              member={member}
              drafts={drafts}
              summary={summary}
              hasRequestedTotal={orderMath.hasRequestedTotal}
              hasSelectedVenue={Boolean(selectedVenue)}
              menuItems={menuItems}
              onSelectMenuItem={(draftId, item) =>
                updateOrder(
                  member.id,
                  draftId,
                  item
                    ? {
                        menuItemId: item.id,
                        customItemName: item.name,
                        amountInput: formatInputAmount(item.price, { allowZero: true }),
                      }
                    : {
                        menuItemId: '',
                        customItemName: '',
                        amountInput: '',
                      }
                )
              }
              onUpdate={(draftId, patch) => updateOrder(member.id, draftId, patch)}
              onAddOrder={() => addMemberOrder(member.id)}
              onRemoveOrder={(draftId) => removeMemberOrder(member.id, draftId)}
              onRemoveMember={() => toggleMember(member.id)}
              onToggleShared={() => toggleSharedMember(member.id)}
              copy={copy}
            />
          );
        })
      ) : (
        <PaperCard className="mb-6 p-5">
          <Text className="text-body text-muted-foreground">
            {copy.noOrders}
          </Text>
        </PaperCard>
      )}

      <PaperCard className="mb-6 p-5">
        <View className="mb-2">
          <View className="mb-2 flex-row items-center gap-2">
            <LucideIcon name="Percent" className="text-muted-foreground" size={15} strokeWidth={2} />
            <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">
              {copy.applyAllDiscount}
            </Text>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-[24px] border-2 border-border bg-card px-4 py-3">
              <Input
                value={discountInput}
                onChangeText={setDiscountInput}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={applyGlobalDiscount}
                placeholderClassName="text-muted-foreground"
                className="h-auto min-h-[24px] border-0 bg-transparent px-0 py-0 text-body text-foreground native:text-base"
              />
            </View>
            <ActionPill label={copy.apply} icon="Percent" tone="secondary" onPress={applyGlobalDiscount} />
          </View>
          <Text className="mt-2 text-caption text-muted-foreground">
            {copy.discountHint}
          </Text>
        </View>
      </PaperCard>

      <FormField
        label={copy.noteOptional}
        value={note}
        onChangeText={setNote}
        multiline
        placeholder={copy.notePlaceholder}
        returnKeyType="done"
        blurOnSubmit
        className="mb-6"
      />

      <PaperCard className="mb-6 p-5">
        <SummaryRow
          label={copy.requestedTotal}
          value={orderMath.requestedTotal > 0 ? formatVnd(orderMath.requestedTotal) : copy.optional}
          hint={copy.beforeDiscount(formatVnd(orderMath.lineSubtotal))}
        />
        <SummaryRow
          label={copy.sharedSplit}
          value={formatVnd(orderMath.allocatedSharedPool)}
          hint={
            orderMath.unassignedSharedPool > 0
              ? copy.unassigned(formatVnd(orderMath.unassignedSharedPool))
              : orderMath.sharedMemberCount > 0
                ? copy.divided(orderMath.sharedMemberCount)
                : copy.enableSharing
          }
        />
        <SummaryRow label={copy.discount} value={formatVnd(orderMath.discountAmount)} />
        <SummaryRow label={copy.totalCharged} value={formatVnd(orderMath.finalTotal)} />
      </PaperCard>

      {submitAttempted && !canSave ? (
        <Text className="mb-4 text-body text-destructive">
          {orderMath.isRequestedTotalTooSmall
            ? copy.minimumError(formatVnd(orderMath.lineSubtotal))
            : copy.amountError}
        </Text>
      ) : null}

      <View className="gap-3">
        <ActionPill
          label={copy.save}
          icon="CircleCheck"
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={cn((!canSave || isSubmitting) && 'opacity-50')}
        />
      </View>
    </OrdernowsScreen>
  );
}
