import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  ActionPill,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
  StatTile,
} from '@/components/ordernows/primitives';
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
import { type MenuItem, formatVnd, getMenuCategoryIcon } from '@/lib/ordernows';
import LucideIcon from '@/lib/icons/LucideIcon';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const VENUE_DETAIL_COPY = {
  en: {
    detailTitle: 'Venue Detail',
    missingSubtitle: 'The requested venue could not be found.',
    missingBadge: 'MISSING VENUE',
    missingTitle: 'Missing venue',
    missingDescription: 'Return to the venue catalog and open another card.',
    backToVenues: 'Back to Venues',
    subtitle: 'Venue profile with the current menu cabinet used for quick-fill ordering and transaction setup.',
    menuItems: 'MENU ITEMS',
    venueCard: 'Venue card',
    noAddress: 'No address yet',
    openUntil: 'Open until',
    addMenuItem: 'Add Menu Item',
    items: 'Items',
    itemsHint: 'Current menu rows saved locally',
    averagePrice: 'Average Price',
    averageHint: 'Rough venue benchmark',
    menuCatalog: 'Menu Catalog',
    allItems: 'All stored items',
    catalogDescription: 'Tap add item to grow the venue menu used by the transaction builder.',
    emptyTitle: 'No menu items yet',
    emptyDescription: 'Add the first dish or drink so this venue can be used for quick-fill ordering.',
    editItem: 'Edit item',
    deleteItem: 'Delete item',
    deleteItemTitle: 'Delete menu item?',
    deleteItemDescription: 'This item will be removed from the saved venue menu.',
    cancel: 'Cancel',
    delete: 'Delete',
  },
  vi: {
    detailTitle: 'Chi tiết địa điểm',
    missingSubtitle: 'Không tìm thấy địa điểm đã chọn.',
    missingBadge: 'THIẾU ĐỊA ĐIỂM',
    missingTitle: 'Không tìm thấy địa điểm',
    missingDescription: 'Quay lại danh sách địa điểm và mở một thẻ khác.',
    backToVenues: 'Quay lại địa điểm',
    subtitle: 'Thông tin địa điểm và thực đơn hiện tại dùng để điền nhanh khi tạo giao dịch.',
    menuItems: 'MÓN',
    venueCard: 'Thẻ địa điểm',
    noAddress: 'Chưa có địa chỉ',
    openUntil: 'Mở đến',
    addMenuItem: 'Thêm món',
    items: 'Số món',
    itemsHint: 'Các món đang được lưu cục bộ',
    averagePrice: 'Giá trung bình',
    averageHint: 'Mức giá tham khảo của địa điểm',
    menuCatalog: 'Thực đơn',
    allItems: 'Tất cả món đã lưu',
    catalogDescription: 'Thêm món để mở rộng thực đơn dùng khi tạo giao dịch.',
    emptyTitle: 'Chưa có món',
    emptyDescription: 'Thêm đồ ăn hoặc đồ uống đầu tiên để dùng tính năng điền nhanh.',
    editItem: 'Sửa món',
    deleteItem: 'Xóa món',
    deleteItemTitle: 'Xóa món?',
    deleteItemDescription: 'Món này sẽ bị xóa khỏi menu địa điểm đã lưu.',
    cancel: 'Hủy',
    delete: 'Xóa',
  },
} as const;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function VenueDetailScreen() {
  const { language } = useLanguage();
  const copy = VENUE_DETAIL_COPY[language];
  const params = useLocalSearchParams<{ id: string }>();
  const venueId = getParamValue(params.id);
  const venue = useOrdernowsStore((state) => state.venues.find((entry) => entry.id === venueId));
  const deleteMenuItem = useOrdernowsStore((state) => state.deleteMenuItem);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<MenuItem | null>(null);

  function handleDeleteItem() {
    if (!venueId || !pendingDeleteItem) return;

    deleteMenuItem(venueId, pendingDeleteItem.id);
    setPendingDeleteItem(null);
  }

  if (!venue) {
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
            <ActionPill label={copy.backToVenues} icon="ArrowLeft" tone="secondary" onPress={() => router.replace('/(tabs)/venues')} />
          </View>
        </PaperCard>
      </OrdernowsScreen>
    );
  }

  const averagePrice =
    venue.menuItems.length > 0
      ? Math.round(venue.menuItems.reduce((sum, item) => sum + item.price, 0) / venue.menuItems.length)
      : 0;

  return (
    <OrdernowsScreen
      title={venue.name}
      subtitle={copy.subtitle}
      badge={`${venue.menuItems.length} ${copy.menuItems}`}>
      <PaperCard className="mb-6 p-5">
        <View className="flex-row items-start gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-[26px] border-2 border-border bg-secondary">
            <LucideIcon name={venue.icon} className="text-foreground" size={34} strokeWidth={1.9} />
          </View>

          <View className="flex-1">
            <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{copy.venueCard}</Text>
            <Text className="mt-2 text-h2 text-foreground uppercase">
              {localizeOrdernowsText(venue.address || copy.noAddress, language)}
            </Text>
            <Text className="mt-1 text-body text-muted-foreground">{copy.openUntil} {venue.openUntil}</Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-2">
          <ActionPill
            label={copy.addMenuItem}
            icon="Plus"
            onPress={() =>
              router.push({
                pathname: '/venue/[id]/add-item',
                params: { id: venue.id },
              })
            }
            className="flex-1"
          />
        </View>
      </PaperCard>

      <View className="mb-6 flex-row gap-3">
        <StatTile label={copy.items} value={`${venue.menuItems.length}`} hint={copy.itemsHint} />
        <StatTile
          label={copy.averagePrice}
          value={averagePrice > 0 ? formatVnd(averagePrice) : '0đ'}
          hint={copy.averageHint}
        />
      </View>

      <SectionHeading
        eyebrow={copy.menuCatalog}
        title={copy.allItems}
        description={copy.catalogDescription}
      />

      {venue.menuItems.map((item) => (
        <PaperCard key={item.id} className="mb-3 p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <LucideIcon
                  name={getMenuCategoryIcon(item.category)}
                  className="text-foreground"
                  size={16}
                  strokeWidth={2}
                />
                <Text className="text-h4 text-foreground uppercase">{item.name}</Text>
              </View>

              {item.description ? (
                <Text className="mt-2 text-body text-muted-foreground">{item.description}</Text>
              ) : null}
            </View>

            <View className="rounded-[18px] border-2 border-border bg-background px-3 py-2">
              <Text className="text-h5 text-foreground uppercase">{formatVnd(item.price)}</Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3 border-t-2 border-border pt-3">
            <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
              {localizeMenuCategory(item.category, language)}
            </Text>

            <View className="flex-row gap-2">
              <Pressable
                accessibilityLabel={copy.editItem}
                onPress={() =>
                  router.push({
                    pathname: '/venue/[id]/add-item',
                    params: { id: venue.id, itemId: item.id },
                  })
                }
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
        </PaperCard>
      ))}

      {venue.menuItems.length === 0 ? (
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.emptyTitle}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.emptyDescription}
          </Text>
        </PaperCard>
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
    </OrdernowsScreen>
  );
}
