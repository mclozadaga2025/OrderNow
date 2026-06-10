import { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import { localizeMenuCategory, localizeOrdernowsText } from '@/lib/localizeOrdernows';
import { type MenuItem, type Venue, formatVnd, getMenuCategoryIcon } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import LucideIcon from '@/lib/icons/LucideIcon';
import { ActionPill, PaperCard } from './primitives';

const VENUE_CARD_COPY = {
  en: {
    noAddress: 'No address yet',
    openUntil: 'Available Until',
    items: 'Items',
    hideMenu: 'Hide Items',
    openMenu: 'Open Items',
    venueDetail: 'Place Detail',
    noMenuItems: 'No cost items yet. Start this place by adding the first reusable item.',
    addMenuItem: 'Add Cost Item',
    editItem: 'Edit item',
    deleteItem: 'Delete item',
    deleteItemTitle: 'Delete cost item?',
    deleteItemDescription: 'This item will be removed from the saved place price list.',
    cancel: 'Cancel',
    delete: 'Delete',
  },
  vi: {
    noAddress: 'Chưa có địa chỉ',
    openUntil: 'Hoạt động đến',
    items: 'Mục',
    hideMenu: 'Ẩn mục',
    openMenu: 'Mở mục',
    venueDetail: 'Chi tiết',
    noMenuItems: 'Chưa có mục chi phí nào. Hãy bắt đầu bằng cách thêm mục đầu tiên.',
    addMenuItem: 'Thêm mục chi phí',
    editItem: 'Sửa mục',
    deleteItem: 'Xóa mục',
    deleteItemTitle: 'Xóa mục chi phí?',
    deleteItemDescription: 'Mục này sẽ bị xóa khỏi bảng giá địa điểm đã lưu.',
    cancel: 'Hủy',
    delete: 'Xóa',
  },
} as const;

interface VenueCardProps {
  venue: Venue;
  expanded: boolean;
  onToggle?: () => void;
  onOpen?: () => void;
  onAddItem?: () => void;
  onEditItem?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
}

export function VenueCard({
  venue,
  expanded,
  onToggle,
  onOpen,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: VenueCardProps) {
  const { language } = useLanguage();
  const copy = VENUE_CARD_COPY[language];
  const [pendingDeleteItem, setPendingDeleteItem] = useState<MenuItem | null>(null);

  function handleDeleteItem() {
    if (!pendingDeleteItem) return;

    onDeleteItem?.(pendingDeleteItem.id);
    setPendingDeleteItem(null);
  }

  return (
    <PaperCard className="mb-4 p-5">
      <View className="flex-row items-start gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-[22px] border-2 border-border bg-secondary">
          <LucideIcon name={venue.icon} className="text-foreground" size={28} strokeWidth={1.9} />
        </View>

        <View className="flex-1">
          <Text className="text-h3 text-foreground uppercase">{venue.name}</Text>
          <Text className="mt-1 text-body text-muted-foreground">
            {localizeOrdernowsText(venue.address || copy.noAddress, language)}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="rounded-full border-2 border-border bg-background px-3 py-1.5">
          <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
            {copy.openUntil} {venue.openUntil}
          </Text>
        </View>
        <View className="rounded-full border-2 border-border bg-background px-3 py-1.5">
          <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
            {venue.menuItems.length} {copy.items}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        <ActionPill
          label={expanded ? copy.hideMenu : copy.openMenu}
          icon={expanded ? 'ChevronUp' : 'ChevronDown'}
          tone={expanded ? 'default' : 'secondary'}
          onPress={onToggle}
          className="flex-1"
        />
        <ActionPill label={copy.venueDetail} icon="ArrowUpRight" tone="neutral" onPress={onOpen} className="flex-1" />
      </View>

      {expanded ? (
        <View className="mt-4 gap-3">
          {venue.menuItems.length > 0 ? (
            venue.menuItems.slice(0, 6).map((item) => (
              <View key={item.id} className="rounded-[22px] border-2 border-border bg-background px-4 py-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <LucideIcon
                        name={getMenuCategoryIcon(item.category)}
                        className="text-foreground"
                        size={15}
                        strokeWidth={2}
                      />
                      <Text className="text-h6 text-foreground uppercase">{item.name}</Text>
                    </View>

                    {item.description ? (
                      <Text className="mt-1 text-caption text-muted-foreground">{item.description}</Text>
                    ) : null}
                  </View>

                  <View className="rounded-[16px] border-2 border-border bg-card px-3 py-2">
                    <Text className="text-h5 text-foreground uppercase">{formatVnd(item.price)}</Text>
                  </View>
                </View>

                <View className="mt-3 flex-row items-center justify-between gap-3 border-t-2 border-border pt-3">
                  <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
                    {localizeMenuCategory(item.category, language)}
                  </Text>

                  <View className="flex-row gap-2">
                    <Pressable
                      accessibilityLabel={copy.editItem}
                      onPress={() => onEditItem?.(item.id)}
                      className="h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-card active:opacity-80">
                      <LucideIcon name="Pencil" className="text-foreground" size={14} strokeWidth={2} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel={copy.deleteItem}
                      onPress={() => setPendingDeleteItem(item)}
                      className="h-9 w-9 items-center justify-center rounded-full border-2 border-destructive bg-destructive active:opacity-80">
                      <LucideIcon
                        name="Trash2"
                        className="text-destructive-foreground"
                        size={14}
                        strokeWidth={2}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="rounded-[22px] border-2 border-dashed border-border bg-background px-4 py-4">
              <Text className="text-body text-muted-foreground">
                {copy.noMenuItems}
              </Text>
            </View>
          )}

          <ActionPill label={copy.addMenuItem} icon="Plus" tone="secondary" onPress={onAddItem} />
        </View>
      ) : null}

      <AlertDialog
        open={Boolean(pendingDeleteItem)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteItem(null);
        }}>
        <AlertDialogContent className="w-full max-w-[360px] rounded-[28px] border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-h3 uppercase">{copy.deleteItemTitle}</AlertDialogTitle>
            <AlertDialogDescription>{copy.deleteItemDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex-row">
            <AlertDialogCancel className="flex-1 rounded-[18px] border-2 border-border bg-background">
              <Text className="text-h6 uppercase text-foreground">{copy.cancel}</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleDeleteItem} className="flex-1 rounded-[18px] bg-destructive">
              <Text className="text-h6 uppercase text-destructive-foreground">{copy.delete}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PaperCard>
  );
}
