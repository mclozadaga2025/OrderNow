import { useEffect } from 'react';
import { loadMobileAds } from '@/components/ads/mobile-ads-loader.native';
import { preloadNewTransactionInterstitial } from '@/components/ads/new-transaction-interstitial';

export function MobileAdsInitializer() {
  useEffect(() => {
    void loadMobileAds();
    void preloadNewTransactionInterstitial();
  }, []);

  return null;
}
