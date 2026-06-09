import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LucideIcon from '@/lib/icons/LucideIcon';
import { useLanguage } from '@/lib/useLanguage';
import { useTheme } from '@/theming/ThemeProvider';

export default function TabsLayout() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const usesIosVietnameseTextMetrics = Platform.OS === 'ios' && language === 'vi';
  const labels =
    language === 'vi'
      ? { home: 'Trang chủ', members: 'Thành viên', venues: 'Địa điểm' }
      : { home: 'Home', members: 'Members', venues: 'Venues' };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 2,
          height: 66 + insets.bottom,
          paddingTop: 7,
        },
        tabBarActiveTintColor: theme.colors.foreground,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        tabBarItemStyle: {
          paddingBottom: 5,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.button?.fontFamily,
          fontSize: 11,
          lineHeight: usesIosVietnameseTextMetrics ? 18 : 14,
          paddingTop: usesIosVietnameseTextMetrics ? 2 : undefined,
          letterSpacing: 1.3,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap = {
            home: 'ReceiptText',
            members: 'UsersRound',
            venues: 'Store',
          } as const;

          const routeName = route.name as keyof typeof iconMap;

          return (
            <LucideIcon
              name={iconMap[routeName] ?? 'ReceiptText'}
              color={color}
              size={focused ? size + 1 : size}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          );
        },
      })}>
      <Tabs.Screen
        name="home"
        options={{
          title: labels.home,
          tabBarLabel: labels.home,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: labels.members,
          tabBarLabel: labels.members,
        }}
      />
      <Tabs.Screen
        name="venues"
        options={{
          title: labels.venues,
          tabBarLabel: labels.venues,
        }}
      />
    </Tabs>
  );
}
