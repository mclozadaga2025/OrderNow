import { Platform, TurboModuleRegistry } from 'react-native';

let mobileAdsPromise: Promise<typeof import('react-native-google-mobile-ads') | null> | undefined;

export function loadMobileAds() {
  if (Platform.OS !== 'android' || !TurboModuleRegistry.get('RNGoogleMobileAdsModule')) {
    return Promise.resolve(null);
  }

  mobileAdsPromise ??= import('react-native-google-mobile-ads')
    .then(async (module) => {
      await module.default().initialize();
      return module;
    })
    .catch(() => null);

  return mobileAdsPromise;
}
