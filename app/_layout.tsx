import '@/global.css';
import '@/appearance-polyfill';

import {
  Theme as NavigationTheme,
  ThemeProvider as NavigationThemeProvider,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { LanguageProvider, useLanguage } from '@/lib/useLanguage';
import { AndroidBootstrapSplash } from '@/components/android-bootstrap-splash';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OrdernowsSettingsMenu } from '@/components/ordernows/settings-menu';
import LucideIcon from '@/lib/icons/LucideIcon';
import { ThemeProvider, useTheme } from '@/theming/ThemeProvider';
import darkTheme from '@/theming/themes/dark';
import lightTheme from '@/theming/themes/light';
import { Oswald_500Medium } from '@expo-google-fonts/oswald/500Medium';
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald/600SemiBold';
import { Oswald_700Bold } from '@expo-google-fonts/oswald/700Bold';
import { SourceSans3_400Regular } from '@expo-google-fonts/source-sans-3/400Regular';
import { SourceSans3_600SemiBold } from '@expo-google-fonts/source-sans-3/600SemiBold';
import { SourceSans3_700Bold } from '@expo-google-fonts/source-sans-3/700Bold';
import { useFonts } from 'expo-font';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from '@/lib/keyboard-controller';
import { WebPortalContext } from '@/components/WebPortalContext';
import * as SplashScreen from 'expo-splash-screen';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';
import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider';
import { BiometricLockScreen } from '@/components/auth/biometric-lock-screen';
import { MobileAdsInitializer } from '@/components/ads/mobile-ads-initializer';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

void SplashScreen.preventAutoHideAsync();

const ROOT_COPY = {
  en: {
    goBack: 'Go back',
    newMember: 'New Member',
    memberDetail: 'Member Detail',
    topUpWallet: 'Top Up Wallet',
    transferWallet: 'Transfer Wallet',
    newVenue: 'New Venue',
    venueDetail: 'Venue Detail',
    addMenuItem: 'Add Menu Item',
    newTransaction: 'New Transaction',
    transactionDetail: 'Transaction Detail',
    manageGroups: 'Manage Groups',
    groupDetail: 'Group Detail',
  },
  vi: {
    goBack: 'Quay lại',
    newMember: 'Thêm thành viên',
    memberDetail: 'Chi tiết thành viên',
    topUpWallet: 'Nạp tiền vào ví',
    transferWallet: 'Trao đổi ví',
    newVenue: 'Thêm địa điểm',
    venueDetail: 'Chi tiết địa điểm',
    addMenuItem: 'Thêm món',
    newTransaction: 'Tạo giao dịch',
    transactionDetail: 'Chi tiết giao dịch',
    manageGroups: 'Quản lý nhóm',
    groupDetail: 'Chi tiết nhóm',
  },
} as const;

const styles = StyleSheet.create({
  gestureHandlerRoot: {
    flex: 1,
  },
});

function HeaderBackButton({ accessibilityLabel }: { accessibilityLabel: string }) {
  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/home');
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={goBack}
      className="h-12 w-12 items-center justify-center active:opacity-60 web:ring-offset-background web:transition-opacity web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2">
      <LucideIcon name="ArrowLeft" className="text-foreground" size={20} strokeWidth={1.8} />
    </Pressable>
  );
}

function RootContent() {
  const hasMounted = React.useRef(false);
  const [portalContainer, setPortalContainer] = React.useState<View | null>(null);
  const {
    isBiometricLocked,
    isGooglePlayReviewAccess,
    isInitialized: isAuthInitialized,
    session,
  } = useAuth();
  const { isDarkColorScheme } = useColorScheme();
  const { language } = useLanguage();
  const copy = ROOT_COPY[language];
  const usesIosVietnameseTextMetrics = Platform.OS === 'ios' && language === 'vi';
  const { theme, setTheme } = useTheme();
  const hydrateFromLocalStorage = useOrdernowsStore((state) => state.hydrateFromLocalStorage);
  const hasHydratedOrdernowsStore = useOrdernowsStore((state) => state.hasHydrated);
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });
  const isLoadingFonts = !fontsLoaded && !fontError;

  const navigationTheme: NavigationTheme = React.useMemo(() => {
    const navigationThemeBase = isDarkColorScheme ? NavigationDarkTheme : NavigationDefaultTheme;
    const baseColors = navigationThemeBase.colors;
    return {
      ...navigationThemeBase,
      colors: {
        ...baseColors,
        background: theme.colors.background ?? baseColors.background,
        border: theme.colors.border ?? baseColors.border,
        card: theme.colors.card ?? baseColors.card,
        notification: theme.colors.destructive ?? baseColors.notification,
        primary: theme.colors.primary ?? baseColors.primary,
        text: theme.colors.foreground ?? baseColors.text,
      },
    };
  }, [theme, isDarkColorScheme]);

  React.useEffect(() => {
    if (isDarkColorScheme && theme.name !== 'dark') {
      setTheme('dark');
    }
    if (!isDarkColorScheme && theme.name !== 'light') {
      setTheme('light');
    }
  }, [isDarkColorScheme, setTheme, theme.name]);

  React.useEffect(() => {
    void setAndroidNavigationBar(isDarkColorScheme ? 'dark' : 'light');
  }, [isDarkColorScheme]);

  React.useEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Adds the background color to the html element to prevent white background on overscroll.
      // eslint-disable-next-line no-undef
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  React.useEffect(() => {
    void hydrateFromLocalStorage();
  }, [hydrateFromLocalStorage]);

  const isAppReady =
    isColorSchemeLoaded &&
    !isLoadingFonts &&
    isAuthInitialized &&
    hasHydratedOrdernowsStore;

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      void SplashScreen.hideAsync();
    }
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== 'android' && isAppReady) {
      void SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return Platform.OS === 'android' ? <AndroidBootstrapSplash /> : null;
  }

  if (session && isBiometricLocked) {
    return <BiometricLockScreen />;
  }

  const hasAppAccess = Boolean(session) || isGooglePlayReviewAccess;

  return (
    <WebPortalContext.Provider value={{ container: portalContainer as unknown as HTMLElement | null }}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
        <Stack
          screenOptions={() => ({
            headerStyle: {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
            headerTintColor: theme.colors.foreground,
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerShadowVisible: false,
            headerLeft: () => <HeaderBackButton accessibilityLabel={copy.goBack} />,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTitleStyle: {
              fontFamily: theme.typography.h2?.fontFamily,
              fontSize: 22,
              lineHeight: usesIosVietnameseTextMetrics ? 30 : undefined,
              paddingTop: usesIosVietnameseTextMetrics ? 2 : undefined,
              letterSpacing: 1,
            },
            headerRight: () => (
              <View className="flex-row items-center gap-2">
                <ThemeToggle />
                <OrdernowsSettingsMenu />
              </View>
            ),
          })}>
          <Stack.Protected guard={!hasAppAccess}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={hasAppAccess}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="member/new" options={{ title: copy.newMember }} />
            <Stack.Screen name="member/[id]" options={{ title: copy.memberDetail }} />
            <Stack.Screen name="member/[id]/top-up" options={{ title: copy.topUpWallet }} />
            <Stack.Screen name="member/[id]/transfer" options={{ title: copy.transferWallet }} />
            <Stack.Screen name="venue/new" options={{ title: copy.newVenue }} />
            <Stack.Screen name="venue/[id]" options={{ title: copy.venueDetail }} />
            <Stack.Screen name="venue/[id]/add-item" options={{ title: copy.addMenuItem }} />
            <Stack.Screen name="transaction/new" options={{ title: copy.newTransaction }} />
            <Stack.Screen name="transaction/[id]" options={{ title: copy.transactionDetail }} />
            <Stack.Screen name="group/manage" options={{ title: copy.manageGroups }} />
            <Stack.Screen name="group/[id]" options={{ title: copy.groupDetail }} />
          </Stack.Protected>
        </Stack>
        {
          // View used as a portal container on web
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
            }}
            ref={setPortalContainer}
          />
        }
        {
          // PortalHost used as a portal container on native
          <PortalHost />
        }
      </NavigationThemeProvider>
    </WebPortalContext.Provider>
  );
}

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.gestureHandlerRoot}>
      <KeyboardProvider>
        <LanguageProvider>
          <ThemeProvider
            initialThemeName={isDarkColorScheme ? 'dark' : 'light'}
            themes={[lightTheme, darkTheme]}>
            <AuthProvider>
              <MobileAdsInitializer />
              <RootContent />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
