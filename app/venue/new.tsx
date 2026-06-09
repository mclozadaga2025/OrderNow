import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';
import {
  ActionPill,
  FormField,
  OrdernowsScreen,
  PaperCard,
} from '@/components/ordernows/primitives';
import { Text } from '@/components/ui/text';
import { useLanguage } from '@/lib/useLanguage';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const NEW_VENUE_COPY = {
  en: {
    title: 'New Venue',
    subtitle: 'Register a place before menu items start arriving in the ordering flow.',
    badge: 'VENUE FORM',
    venueNotes: 'Venue Notes',
    notesTitle: 'Name is required. Address and hours can stay loose.',
    notesDescription: 'New venues appear instantly in the venues tab and become selectable in the transaction builder.',
    venueName: 'Venue Name',
    venuePlaceholder: 'Blue Note Cafe, The Corner Bakery...',
    address: 'Address',
    addressPlaceholder: '123 Jazz Street',
    openUntil: 'Open Until',
    backToVenues: 'Back to Venues',
    saveVenue: 'Save Venue',
  },
  vi: {
    title: 'Thêm địa điểm',
    subtitle: 'Đăng ký một địa điểm trước khi thêm món vào luồng đặt món.',
    badge: 'BIỂU MẪU ĐỊA ĐIỂM',
    venueNotes: 'Ghi chú địa điểm',
    notesTitle: 'Tên là bắt buộc. Địa chỉ và giờ mở cửa có thể cập nhật sau.',
    notesDescription: 'Địa điểm mới xuất hiện ngay trong tab địa điểm và có thể chọn khi tạo giao dịch.',
    venueName: 'Tên địa điểm',
    venuePlaceholder: 'Cà phê Góc Phố, Tiệm Bánh...',
    address: 'Địa chỉ',
    addressPlaceholder: '123 Phố Cà Phê',
    openUntil: 'Mở đến',
    backToVenues: 'Quay lại địa điểm',
    saveVenue: 'Lưu địa điểm',
  },
} as const;

export default function NewVenueScreen() {
  const { language } = useLanguage();
  const copy = NEW_VENUE_COPY[language];
  const addVenue = useOrdernowsStore((state) => state.addVenue);
  const addressInputRef = useRef<TextInput>(null);
  const openUntilInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openUntil, setOpenUntil] = useState('10 PM');

  function handleSubmit() {
    if (!name.trim()) {
      return;
    }

    const venueId = addVenue({
      name: name.trim(),
      address: address.trim(),
      openUntil: openUntil.trim() || '10 PM',
    });

    router.replace({
      pathname: '/venue/[id]',
      params: { id: venueId },
    });
  }

  return (
    <OrdernowsScreen
      keyboardAware
      title={copy.title}
      subtitle={copy.subtitle}
      badge={copy.badge}>
      <PaperCard className="mb-6 p-5">
        <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{copy.venueNotes}</Text>
        <Text className="mt-2 text-h2 text-foreground uppercase">{copy.notesTitle}</Text>
        <Text className="mt-2 text-body text-muted-foreground">
          {copy.notesDescription}
        </Text>
      </PaperCard>

      <FormField
        label={copy.venueName}
        icon="Store"
        value={name}
        onChangeText={setName}
        placeholder={copy.venuePlaceholder}
        autoCapitalize="words"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => addressInputRef.current?.focus()}
      />
      <FormField
        ref={addressInputRef}
        label={copy.address}
        icon="MapPin"
        value={address}
        onChangeText={setAddress}
        placeholder={copy.addressPlaceholder}
        autoCapitalize="words"
        returnKeyType="next"
        blurOnSubmit={false}
        textContentType="fullStreetAddress"
        onSubmitEditing={() => openUntilInputRef.current?.focus()}
      />
      <FormField
        ref={openUntilInputRef}
        label={copy.openUntil}
        icon="Clock3"
        value={openUntil}
        onChangeText={setOpenUntil}
        placeholder="10 PM"
        autoCapitalize="characters"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <View className="flex-row gap-2">
        <ActionPill label={copy.backToVenues} icon="ArrowLeft" tone="neutral" onPress={() => router.replace('/(tabs)/venues')} className="flex-1" />
        <ActionPill label={copy.saveVenue} icon="Plus" onPress={handleSubmit} className="flex-1" />
      </View>
    </OrdernowsScreen>
  );
}
