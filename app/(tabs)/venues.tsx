import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { LanguageToggle } from '@/components/LanguageToggle';
import { VenueCard } from '@/components/ordernows/venue-card';
import {
  ActionPill,
  OrdernowsScreen,
  PaperCard,
  SectionHeading,
  StatTile,
} from '@/components/ordernows/primitives';
import { Text } from '@/components/ui/text';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const VENUES_COPY = {
  en: {
    title: 'Venues',
    subtitle: 'Store locations, scan menu items, and prep quick-fill choices for future tabs.',
    badge: (venueCount: number, itemCount: number) => `${venueCount} VENUES / ${itemCount} MENU ITEMS`,
    venueLibrary: 'Venue Library',
    libraryTitle: 'Favorite ordering spots.',
    libraryDescription: 'Add places first, then expand each card to manage menu items.',
    newVenue: 'New Venue',
    savedVenues: 'Saved Venues',
    savedVenuesHint: 'Every venue saved locally',
    menuLibrary: 'Menu Library',
    menuLibraryHint: 'Across every venue on file',
    catalog: 'Catalog',
    cardsTitle: 'Expandable venue cards',
    cardsDescription: 'Open a venue to inspect the first items or jump to a detailed menu screen.',
    noVenues: 'No venues yet',
    noVenuesDescription: 'Add a new venue to start the catalog.',
  },
  vi: {
    title: 'Địa điểm',
    subtitle: 'Lưu địa điểm, xem món và chuẩn bị lựa chọn nhanh cho các giao dịch sau.',
    badge: (venueCount: number, itemCount: number) => `${venueCount} ĐỊA ĐIỂM / ${itemCount} MÓN`,
    venueLibrary: 'Thư viện địa điểm',
    libraryTitle: 'Các địa điểm đặt món yêu thích.',
    libraryDescription: 'Thêm địa điểm trước, sau đó mở từng thẻ để quản lý món.',
    newVenue: 'Thêm địa điểm',
    savedVenues: 'Địa điểm đã lưu',
    savedVenuesHint: 'Tất cả địa điểm lưu cục bộ',
    menuLibrary: 'Thư viện món',
    menuLibraryHint: 'Tổng hợp từ tất cả địa điểm đã lưu',
    catalog: 'Danh mục',
    cardsTitle: 'Thẻ địa điểm mở rộng',
    cardsDescription: 'Mở địa điểm để xem các món đầu tiên hoặc chuyển sang màn menu chi tiết.',
    noVenues: 'Chưa có địa điểm',
    noVenuesDescription: 'Thêm địa điểm mới để bắt đầu danh mục.',
  },
} as const;

export default function VenuesScreen() {
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);
  const { language } = useLanguage();
  const copy = VENUES_COPY[language];
  const venues = useOrdernowsStore((state) => state.venues);
  const deleteMenuItem = useOrdernowsStore((state) => state.deleteMenuItem);

  const totalMenuItems = venues.reduce((sum, venue) => sum + venue.menuItems.length, 0);

  return (
    <OrdernowsScreen
      title={copy.title}
      subtitle={copy.subtitle}
      badge={copy.badge(venues.length, totalMenuItems)}
      headerAction={<LanguageToggle />}>
      <PaperCard className="mb-6 p-5">
        <Text className="text-caption uppercase tracking-[1.8px] text-muted-foreground">{copy.venueLibrary}</Text>
        <Text className="mt-2 text-h2 text-foreground uppercase">
          {copy.libraryTitle}
        </Text>
        <Text className="mt-2 text-body text-muted-foreground">
          {copy.libraryDescription}
        </Text>

        <View className="mt-5 flex-row gap-2">
          <ActionPill
            label={copy.newVenue}
            icon="Plus"
            onPress={() => router.push('/venue/new')}
            className="flex-1"
          />
        </View>
      </PaperCard>

      <View className="mb-6 flex-row gap-3">
        <StatTile label={copy.savedVenues} value={`${venues.length}`} hint={copy.savedVenuesHint} />
        <StatTile label={copy.menuLibrary} value={`${totalMenuItems}`} hint={copy.menuLibraryHint} />
      </View>

      <SectionHeading
        eyebrow={copy.catalog}
        title={copy.cardsTitle}
        description={copy.cardsDescription}
      />

      {venues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          expanded={expandedVenueId === venue.id}
          onToggle={() => setExpandedVenueId((current) => (current === venue.id ? null : venue.id))}
          onOpen={() =>
            router.push({
              pathname: '/venue/[id]',
              params: { id: venue.id },
            })
          }
          onAddItem={() =>
            router.push({
              pathname: '/venue/[id]/add-item',
              params: { id: venue.id },
            })
          }
          onEditItem={(itemId) =>
            router.push({
              pathname: '/venue/[id]/add-item',
              params: { id: venue.id, itemId },
            })
          }
          onDeleteItem={(itemId) => deleteMenuItem(venue.id, itemId)}
        />
      ))}

      {venues.length === 0 ? (
        <PaperCard className="p-5">
          <Text className="text-h4 text-foreground uppercase">{copy.noVenues}</Text>
          <Text className="mt-2 text-body text-muted-foreground">
            {copy.noVenuesDescription}
          </Text>
        </PaperCard>
      ) : null}
    </OrdernowsScreen>
  );
}
