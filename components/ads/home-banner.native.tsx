import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { loadMobileAds } from '@/components/ads/mobile-ads-loader.native';

const ANDROID_HOME_BANNER_UNIT_ID = 'ca-app-pub-8148257689708201/8089072724';

export function HomeBanner() {
  const [googleMobileAds, setGoogleMobileAds] =
    useState<typeof import('react-native-google-mobile-ads') | null>(null);

  useEffect(() => {
    let isMounted = true;

    void loadMobileAds().then((module) => {
      if (isMounted && module) {
        setGoogleMobileAds(module);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!googleMobileAds) {
    return null;
  }

  const { BannerAd, BannerAdSize, TestIds } = googleMobileAds;

  return (
    <View className="mt-6 items-center">
      <BannerAd
        unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : ANDROID_HOME_BANNER_UNIT_ID}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}
