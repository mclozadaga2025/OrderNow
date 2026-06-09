import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

const BIOMETRIC_LOGIN_STORAGE_KEY = '@ordernows/biometric-login-enabled-v1';

export type BiometricAvailability = 'available' | 'not-enrolled' | 'not-supported' | 'web';

export async function getIsBiometricLoginEnabled() {
  if (Platform.OS === 'web') {
    return false;
  }

  return (await AsyncStorage.getItem(BIOMETRIC_LOGIN_STORAGE_KEY)) === 'true';
}

export async function setIsBiometricLoginEnabled(isEnabled: boolean) {
  if (isEnabled) {
    await AsyncStorage.setItem(BIOMETRIC_LOGIN_STORAGE_KEY, 'true');
    return;
  }

  await AsyncStorage.removeItem(BIOMETRIC_LOGIN_STORAGE_KEY);
}

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  if (Platform.OS === 'web') {
    return 'web';
  }

  if (!(await LocalAuthentication.hasHardwareAsync())) {
    return 'not-supported';
  }

  if (!(await LocalAuthentication.isEnrolledAsync())) {
    return 'not-enrolled';
  }

  return 'available';
}

export async function authenticateWithBiometrics(promptMessage: string) {
  const availability = await getBiometricAvailability();

  if (availability !== 'available') {
    return { availability, success: false } as const;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use device passcode',
  });

  return { availability, success: result.success } as const;
}
