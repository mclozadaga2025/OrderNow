import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';
import {
  ActionPill,
  FilterChip,
  FormField,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
} from '@/components/ordernows/primitives';
import { Text } from '@/components/ui/text';
import { localizeMenuCategory } from '@/lib/localizeOrdernows';
import { menuCategories, parseVndInput } from '@/lib/ordernows';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const ADD_ITEM_COPY = {
  en: {
    title: 'Add Cost Item',
    editTitle: 'Edit Cost Item',
    missingSubtitle: 'The selected place could not be loaded.',
    badge: 'COST ITEM FORM',
    missingTitle: 'Missing place',
    missingDescription: 'Return to the place catalog and reopen this flow from a valid place.',
    backToVenues: 'Back to Places',
    item: 'ITEM',
    venueTarget: 'Place Target',
    savedLocally: "The new row saves locally inside this place's price list.",
    updatedLocally: "Changes save locally inside this place's price list.",
    itemName: 'Item Name',
    itemPlaceholder: 'Court fee, racket rental, bottled water...',
    price: 'Price (VND)',
    description: 'Description',
    descriptionPlaceholder: 'Optional note about service, duration, or serving detail',
    category: 'Type',
    menuBucket: 'Item group',
    categoryDescription: 'Used for icon treatment in the place screen.',
    saveItem: 'Save Item',
    updateItem: 'Update Item',
    backToVenue: 'Back to Place',
    createSubtitle: 'Create a reusable cost item with price and type so it appears in this place.',
    editSubtitle: 'Update the saved cost item so the place price list stays in sync.',
  },
  vi: {
    title: 'Thêm mục chi phí',
    editTitle: 'Sửa mục chi phí',
    missingSubtitle: 'Không thể tải địa điểm đã chọn.',
    badge: 'BIỂU MẪU MỤC CHI PHÍ',
    missingTitle: 'Không tìm thấy địa điểm',
    missingDescription: 'Quay lại danh sách địa điểm và mở luồng thêm mục từ một địa điểm hợp lệ.',
    backToVenues: 'Quay lại địa điểm',
    item: 'MỤC',
    venueTarget: 'Địa điểm',
    savedLocally: 'Mục mới được lưu cục bộ trong bảng giá của địa điểm này.',
    updatedLocally: 'Thay đổi được lưu cục bộ trong bảng giá của địa điểm này.',
    itemName: 'Tên mục chi phí',
    itemPlaceholder: 'Phí sân 1 giờ, Thuê vợt, Nước suối...',
    price: 'Giá (VND)',
    description: 'Mô tả',
    descriptionPlaceholder: 'Ghi chú tùy chọn về dịch vụ, thời lượng hoặc khẩu phần',
    category: 'Loại',
    menuBucket: 'Nhóm mục',
    categoryDescription: 'Dùng để hiển thị biểu tượng trong màn địa điểm.',
    saveItem: 'Lưu mục',
    updateItem: 'Cập nhật mục',
    backToVenue: 'Quay lại địa điểm',
    createSubtitle: 'Tạo mục chi phí với giá và loại để hiển thị trong địa điểm này.',
    editSubtitle: 'Cập nhật mục chi phí đã lưu để đồng bộ trong bảng giá địa điểm.',
  },
} as const;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPriceInput(value: string | number) {
  const rawValue = String(value);

  if (!/\d/.test(rawValue)) {
    return '';
  }

  return new Intl.NumberFormat('vi-VN').format(parseVndInput(rawValue));
}

export default function VenueAddItemScreen() {
  const { language } = useLanguage();
  const copy = ADD_ITEM_COPY[language];
  const params = useLocalSearchParams<{ id: string; itemId?: string }>();
  const venueId = getParamValue(params.id) ?? '';
  const itemId = getParamValue(params.itemId);
  const venue = useOrdernowsStore((state) => state.venues.find((entry) => entry.id === venueId));
  const addMenuItem = useOrdernowsStore((state) => state.addMenuItem);
  const updateMenuItem = useOrdernowsStore((state) => state.updateMenuItem);
  const menuItem = venue?.menuItems.find((item) => item.id === itemId);
  const isEditing = Boolean(menuItem);
  const [name, setName] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<(typeof menuCategories)[number]>('Drinks');
  const [loadedItemId, setLoadedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!menuItem || loadedItemId === menuItem.id) return;

    setName(menuItem.name);
    setPriceInput(formatPriceInput(menuItem.price));
    setDescription(menuItem.description ?? '');
    setCategory(menuItem.category);
    setLoadedItemId(menuItem.id);
  }, [loadedItemId, menuItem]);

  function handlePriceInputChange(value: string) {
    setPriceInput(formatPriceInput(value));
  }

  if (!venue || !venueId || (itemId && !menuItem)) {
    return (
      <OrdernowsScreen
        title={itemId ? copy.editTitle : copy.title}
        subtitle={copy.missingSubtitle}
        badge={copy.badge}>
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

  function handleSubmit() {
    const price = parseVndInput(priceInput);

    if (!name.trim() || price <= 0) {
      return;
    }

    const input = {
      name: name.trim(),
      price,
      description: description.trim() || undefined,
      category,
    };

    if (menuItem) {
      updateMenuItem(venueId, menuItem.id, input);
    } else {
      addMenuItem(venueId, input);
    }

    router.replace({
      pathname: '/venue/[id]',
      params: { id: venueId },
    });
  }

  return (
    <OrdernowsScreen
      keyboardAware
      title={isEditing ? copy.editTitle : copy.title}
      subtitle={isEditing ? copy.editSubtitle : copy.createSubtitle}
      badge={`${venue.name.toUpperCase()} / ${copy.item}`}>
      <PaperCard className="mb-6 p-5">
        <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{copy.venueTarget}</Text>
        <Text className="mt-2 text-h2 text-foreground uppercase">{venue.name}</Text>
        <Text className="mt-1 text-body text-muted-foreground">
          {isEditing ? copy.updatedLocally : copy.savedLocally}
        </Text>
      </PaperCard>

      <FormField
        label={copy.itemName}
        icon="NotebookText"
        value={name}
        onChangeText={setName}
        placeholder={copy.itemPlaceholder}
      />
      <FormField
        label={copy.price}
        icon="Wallet"
        keyboardType="numeric"
        value={priceInput}
        onChangeText={handlePriceInputChange}
        placeholder="10.000"
      />
      <FormField
        label={copy.description}
        icon="ReceiptText"
        value={description}
        onChangeText={setDescription}
        placeholder={copy.descriptionPlaceholder}
        multiline
      />

      <SectionHeading
        eyebrow={copy.category}
        title={copy.menuBucket}
        description={copy.categoryDescription}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        {menuCategories.map((entry) => (
          <FilterChip
            key={entry}
            label={localizeMenuCategory(entry, language)}
            active={category === entry}
            onPress={() => setCategory(entry)}
          />
        ))}
      </ScrollView>

      <View className="flex-row gap-2">
        <ActionPill
          label={copy.backToVenue}
          icon="ArrowLeft"
          tone="neutral"
          onPress={() =>
            router.replace({
              pathname: '/venue/[id]',
              params: { id: venueId },
            })
          }
          className="flex-1"
        />
        <ActionPill
          label={isEditing ? copy.updateItem : copy.saveItem}
          icon={isEditing ? 'Save' : 'Plus'}
          onPress={handleSubmit}
          className="flex-1"
        />
      </View>
    </OrdernowsScreen>
  );
}
