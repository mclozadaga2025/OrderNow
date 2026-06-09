import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth/AuthProvider';
import LucideIcon, { type IconName } from '@/lib/icons/LucideIcon';
import { localizeStorageStatus } from '@/lib/localizeStorageStatus';
import { useLanguage } from '@/lib/useLanguage';
import { cn } from '@/lib/utils';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';

const SETTINGS_MENU_COPY = {
  en: {
    title: 'Account Settings',
    close: 'Close settings',
    biometricLogin: 'Face ID / fingerprint',
    biometricDescription: 'Require biometrics when reopening the app.',
    biometricPrompt: 'Confirm biometric login',
    biometricFailed: 'Could Not Update Biometric Login',
    localJsonLedger: 'Local JSON Ledger',
    localJsonDescription: 'Export a backup or replace this device ledger from a JSON file.',
    exportingJson: 'Exporting JSON',
    exportJson: 'Export JSON',
    exportJsonFailed: 'Could Not Export JSON',
    importingJson: 'Importing JSON',
    importJson: 'Import JSON',
    importJsonTitle: 'Replace your local ledger?',
    importJsonDescription:
      'Importing a JSON file replaces the current local ledger on this device. Export a backup first if you need to keep it.',
    importJsonConfirm: 'Choose JSON File',
    importJsonFailed: 'Could Not Import JSON',
    deletingAccount: 'Deleting Account',
    deleteAccount: 'Delete Account',
    deleteAccountTitle: 'Delete your account?',
    deleteAccountDescription:
      'This permanently deletes your account and cannot be undone. Your locally stored ledger remains on this device.',
    cancel: 'Cancel',
    deleteAccountConfirm: 'Delete Account',
    deleteAccountFailed: 'Could Not Delete Account',
    signingOut: 'Signing Out',
    signOut: 'Sign Out',
    signOutFailed: 'Could Not Sign Out',
    reviewAccount: 'Google Play review access',
  },
  vi: {
    title: 'Cài đặt tài khoản',
    close: 'Đóng cài đặt',
    biometricLogin: 'Face ID / vân tay',
    biometricDescription: 'Yêu cầu sinh trắc học khi mở lại ứng dụng.',
    biometricPrompt: 'Xác nhận đăng nhập bằng sinh trắc học',
    biometricFailed: 'Không thể cập nhật đăng nhập sinh trắc học',
    localJsonLedger: 'Sổ JSON cục bộ',
    localJsonDescription: 'Xuất bản sao lưu hoặc thay sổ trên thiết bị bằng một tệp JSON.',
    exportingJson: 'Đang xuất JSON',
    exportJson: 'Xuất JSON',
    exportJsonFailed: 'Không thể xuất JSON',
    importingJson: 'Đang nhập JSON',
    importJson: 'Nhập JSON',
    importJsonTitle: 'Thay thế sổ dữ liệu cục bộ?',
    importJsonDescription:
      'Nhập tệp JSON sẽ thay thế sổ dữ liệu hiện tại trên thiết bị này. Hãy xuất bản sao lưu trước nếu bạn cần giữ lại dữ liệu.',
    importJsonConfirm: 'Chọn tệp JSON',
    importJsonFailed: 'Không thể nhập JSON',
    deletingAccount: 'Đang xóa tài khoản',
    deleteAccount: 'Xóa tài khoản',
    deleteAccountTitle: 'Xóa tài khoản của bạn?',
    deleteAccountDescription:
      'Thao tác này xóa vĩnh viễn tài khoản và không thể hoàn tác. Sổ dữ liệu lưu cục bộ vẫn còn trên thiết bị này.',
    cancel: 'Hủy',
    deleteAccountConfirm: 'Xóa tài khoản',
    deleteAccountFailed: 'Không thể xóa tài khoản',
    signingOut: 'Đang đăng xuất',
    signOut: 'Đăng xuất',
    signOutFailed: 'Không thể đăng xuất',
    reviewAccount: 'Quyền review Google Play',
  },
} as const;

interface MenuActionProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}

function SettingsMenuAction({
  icon,
  label,
  onPress,
  disabled = false,
  tone = 'default',
}: MenuActionProps) {
  const content = (
    <>
      <View className="w-5 items-center">
        <LucideIcon
          name={icon}
          size={16}
          strokeWidth={2}
          className={tone === 'danger' ? 'text-destructive' : 'text-foreground'}
        />
      </View>
      <Text
        className={cn(
          'text-body text-foreground',
          tone === 'danger' && 'text-destructive',
          disabled && 'text-muted-foreground'
        )}>
        {label}
      </Text>
    </>
  );

  if (Platform.OS !== 'web') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        className={cn(
          'flex-row items-center gap-2 border-t border-border px-4 py-3 active:bg-secondary',
          disabled && 'opacity-50'
        )}>
        {content}
      </Pressable>
    );
  }

  return (
    <DropdownMenuItem
      disabled={disabled}
      onPress={onPress}
      className="rounded-none border-t border-border px-4 py-3 active:bg-secondary web:hover:bg-secondary web:focus:bg-secondary">
      {content}
    </DropdownMenuItem>
  );
}

export function OrdernowsSettingsMenu() {
  const [isNativeMenuOpen, setIsNativeMenuOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isImportingData, setIsImportingData] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUpdatingBiometrics, setIsUpdatingBiometrics] = useState(false);
  const {
    deleteAccount,
    isBiometricLoginEnabled,
    isGooglePlayReviewAccess,
    session,
    setBiometricLoginEnabled,
    signOut,
  } = useAuth();
  const exportData = useOrdernowsStore((state) => state.exportData);
  const importData = useOrdernowsStore((state) => state.importData);
  const storageError = useOrdernowsStore((state) => state.storageError);
  const storageStatus = useOrdernowsStore((state) => state.storageStatus);
  const { language } = useLanguage();
  const copy = SETTINGS_MENU_COPY[language];
  const isTransferringData = isExportingData || isImportingData;
  const accountLabel = isGooglePlayReviewAccess
    ? copy.reviewAccount
    : session?.user.email;

  async function handleBiometricLoginChange(isEnabled: boolean) {
    if (isUpdatingBiometrics) {
      return;
    }

    setIsUpdatingBiometrics(true);
    try {
      const errorMessage = await setBiometricLoginEnabled(isEnabled, copy.biometricPrompt);

      if (errorMessage) {
        Alert.alert(copy.biometricFailed, errorMessage);
      }
    } catch (error) {
      Alert.alert(
        copy.biometricFailed,
        error instanceof Error ? error.message : copy.biometricFailed
      );
    } finally {
      setIsUpdatingBiometrics(false);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      const errorMessage = await signOut();

      if (errorMessage) {
        Alert.alert(copy.signOutFailed, errorMessage);
      }
    } catch (error) {
      Alert.alert(copy.signOutFailed, error instanceof Error ? error.message : copy.signOutFailed);
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleExportData() {
    if (isTransferringData) {
      return;
    }

    if (Platform.OS !== 'web') {
      setIsNativeMenuOpen(false);
    }

    setIsExportingData(true);
    try {
      await exportData();

      const errorMessage = useOrdernowsStore.getState().storageError;
      if (errorMessage) {
        Alert.alert(copy.exportJsonFailed, errorMessage);
      }
    } catch (error) {
      Alert.alert(
        copy.exportJsonFailed,
        error instanceof Error ? error.message : copy.exportJsonFailed
      );
    } finally {
      setIsExportingData(false);
    }
  }

  async function handleImportData() {
    if (isTransferringData) {
      return;
    }

    if (Platform.OS !== 'web') {
      setIsNativeMenuOpen(false);
    }

    setIsImportingData(true);
    try {
      const didImport = await importData();
      const errorMessage = useOrdernowsStore.getState().storageError;

      if (!didImport && errorMessage) {
        Alert.alert(copy.importJsonFailed, errorMessage);
      }
    } catch (error) {
      Alert.alert(
        copy.importJsonFailed,
        error instanceof Error ? error.message : copy.importJsonFailed
      );
    } finally {
      setIsImportingData(false);
    }
  }

  async function handleDeleteAccount() {
    if (isDeletingAccount) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      const errorMessage = await deleteAccount();

      if (errorMessage) {
        Alert.alert(copy.deleteAccountFailed, errorMessage);
      }
    } catch (error) {
      Alert.alert(
        copy.deleteAccountFailed,
        error instanceof Error ? error.message : copy.deleteAccountFailed
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }

  function confirmImportData() {
    if (Platform.OS === 'web') {
      if (globalThis.confirm(copy.importJsonDescription)) {
        void handleImportData();
      }
      return;
    }

    setIsNativeMenuOpen(false);
    Alert.alert(copy.importJsonTitle, copy.importJsonDescription, [
      { text: copy.cancel, style: 'cancel' },
      { text: copy.importJsonConfirm, onPress: () => void handleImportData() },
    ]);
  }

  function confirmDeleteAccount() {
    if (Platform.OS === 'web') {
      if (globalThis.confirm(copy.deleteAccountDescription)) {
        void handleDeleteAccount();
      }
      return;
    }

    Alert.alert(copy.deleteAccountTitle, copy.deleteAccountDescription, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.deleteAccountConfirm,
        style: 'destructive',
        onPress: () => void handleDeleteAccount(),
      },
    ]);
  }

  function handleNativeSignOut() {
    setIsNativeMenuOpen(false);
    void handleSignOut();
  }

  function confirmNativeDeleteAccount() {
    setIsNativeMenuOpen(false);
    confirmDeleteAccount();
  }

  const menuContent = (
    <>
      <View className="bg-foreground px-4 py-4">
        <Text className="text-button uppercase text-background">{copy.title}</Text>
        <Text className="text-caption mt-1 tracking-[1.1px] text-background opacity-70">
          {accountLabel}
        </Text>
      </View>

      <View className="flex-row items-center gap-3 px-4 py-4">
        <View className="w-5 items-center">
          <LucideIcon name="ScanFace" className="text-foreground" size={17} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-body text-foreground">{copy.biometricLogin}</Text>
          <Text className="text-caption mt-1 leading-4 text-muted-foreground">
            {copy.biometricDescription}
          </Text>
        </View>
        <Switch
          checked={isBiometricLoginEnabled}
          disabled={isUpdatingBiometrics || isGooglePlayReviewAccess}
          onCheckedChange={(isEnabled) => void handleBiometricLoginChange(isEnabled)}
        />
      </View>

      <View className="h-px bg-border" />

      <View className="flex-row items-start gap-3 px-4 py-4">
        <View className="w-5 items-center pt-0.5">
          <LucideIcon name="Database" className="text-foreground" size={17} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-body text-foreground">{copy.localJsonLedger}</Text>
          <Text className="text-caption mt-1 leading-4 text-muted-foreground">
            {copy.localJsonDescription}
          </Text>
          <Text
            className={cn(
              'text-caption mt-2 leading-4',
              storageError ? 'text-destructive' : 'text-muted-foreground'
            )}>
            {storageError ?? localizeStorageStatus(storageStatus, language)}
          </Text>
        </View>
      </View>

      <SettingsMenuAction
        icon="Download"
        label={isExportingData ? copy.exportingJson : copy.exportJson}
        disabled={isTransferringData}
        onPress={() => void handleExportData()}
      />
      <SettingsMenuAction
        icon="Upload"
        label={isImportingData ? copy.importingJson : copy.importJson}
        disabled={isTransferringData}
        onPress={confirmImportData}
      />

      <SettingsMenuAction
        icon="LogOut"
        label={isSigningOut ? copy.signingOut : copy.signOut}
        disabled={isSigningOut}
        onPress={Platform.OS === 'web' ? () => void handleSignOut() : handleNativeSignOut}
      />
      {!isGooglePlayReviewAccess ? (
        <SettingsMenuAction
          icon="Trash2"
          label={isDeletingAccount ? copy.deletingAccount : copy.deleteAccount}
          disabled={isDeletingAccount}
          onPress={Platform.OS === 'web' ? confirmDeleteAccount : confirmNativeDeleteAccount}
          tone="danger"
        />
      ) : null}
    </>
  );

  if (Platform.OS !== 'web') {
    return (
      <>
        <Pressable
          accessibilityLabel={copy.title}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setIsNativeMenuOpen(true)}
          className="h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card active:opacity-75">
          <LucideIcon name="Settings2" className="text-foreground" size={19} strokeWidth={2.2} />
        </Pressable>
        <Modal
          animationType="fade"
          navigationBarTranslucent
          onRequestClose={() => setIsNativeMenuOpen(false)}
          statusBarTranslucent
          transparent
          visible={isNativeMenuOpen}>
          <SafeAreaView className="flex-1 justify-end bg-overlay/80 px-4 py-6">
            <Pressable
              accessibilityLabel={copy.close}
              accessibilityRole="button"
              onPress={() => setIsNativeMenuOpen(false)}
              style={StyleSheet.absoluteFill}
            />
            <View className="overflow-hidden rounded-[22px] border-2 border-border bg-card">
              {menuContent}
            </View>
          </SafeAreaView>
        </Modal>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        accessibilityLabel={copy.title}
        className="h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card active:opacity-75">
        <LucideIcon name="Settings2" className="text-foreground" size={19} strokeWidth={2.2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 rounded-[22px] border-2 border-border bg-card p-0 shadow-xl">
        {menuContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
