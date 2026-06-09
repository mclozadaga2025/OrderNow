import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { H1 } from '@/components/ui/typography';
import { useAuth } from '@/lib/auth/AuthProvider';
import LucideIcon from '@/lib/icons/LucideIcon';
import { useLanguage } from '@/lib/useLanguage';

const BIOMETRIC_LOCK_COPY = {
  en: {
    title: 'Account locked',
    description: 'Use Face ID, Touch ID, or fingerprint authentication to continue.',
    prompt: 'Unlock Ordernows',
    unlock: 'Unlock account',
    unlocking: 'Unlocking...',
    signOut: 'Sign out',
  },
  vi: {
    title: 'Tài khoản đã khóa',
    description: 'Dùng Face ID, Touch ID hoặc vân tay để tiếp tục.',
    prompt: 'Mở khóa Ordernows',
    unlock: 'Mở khóa tài khoản',
    unlocking: 'Đang mở khóa...',
    signOut: 'Đăng xuất',
  },
} as const;

export function BiometricLockScreen() {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRequestedUnlock = useRef(false);
  const isUnlockingRef = useRef(false);
  const { signOut, unlockWithBiometrics } = useAuth();
  const { language } = useLanguage();
  const copy = BIOMETRIC_LOCK_COPY[language];

  const handleUnlock = useCallback(async () => {
    if (isUnlockingRef.current) {
      return;
    }

    isUnlockingRef.current = true;
    setIsUnlocking(true);
    setErrorMessage(null);
    try {
      const error = await unlockWithBiometrics(copy.prompt);
      setErrorMessage(error);
    } finally {
      isUnlockingRef.current = false;
      setIsUnlocking(false);
    }
  }, [copy.prompt, unlockWithBiometrics]);

  useEffect(() => {
    function requestUnlockWhenActive(state = AppState.currentState) {
      if (state !== 'active' || hasRequestedUnlock.current) {
        return;
      }

      hasRequestedUnlock.current = true;
      void handleUnlock();
    }

    requestUnlockWhenActive();
    const subscription = AppState.addEventListener('change', requestUnlockWhenActive);

    return () => {
      subscription.remove();
    };
  }, [handleUnlock]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-[420px] items-center rounded-[26px] border-2 border-border bg-card p-6 shadow-xl">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-accent">
          <LucideIcon name="ScanFace" className="text-accent-foreground" size={32} />
        </View>
        <H1 className="text-center uppercase">{copy.title}</H1>
        <Text className="text-body mt-3 text-center leading-6 text-muted-foreground">
          {copy.description}
        </Text>

        {errorMessage ? (
          <Text className="text-body mt-4 text-center leading-5 text-destructive">{errorMessage}</Text>
        ) : null}

        <Button
          className="mt-6 w-full"
          disabled={isUnlocking}
          onPress={() => void handleUnlock()}
          size="lg">
          {isUnlocking ? <ActivityIndicator /> : <Text>{copy.unlock}</Text>}
        </Button>
        <Button className="mt-3 w-full" onPress={() => void signOut()} variant="outline">
          <Text>{copy.signOut}</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
