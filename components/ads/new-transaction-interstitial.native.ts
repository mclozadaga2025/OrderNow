import { Platform, StatusBar } from 'react-native';
import { loadMobileAds } from '@/components/ads/mobile-ads-loader.native';

type GoogleMobileAds = NonNullable<Awaited<ReturnType<typeof loadMobileAds>>>;
type InterstitialAdInstance = ReturnType<GoogleMobileAds['InterstitialAd']['createForAdRequest']>;

let interstitialPromise: Promise<InterstitialAdInstance | null> | undefined;
let isLoaded = false;
let isLoading = false;
let isShowing = false;
let resolveClosed: (() => void) | undefined;

function getProductionAdUnitId() {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_ADMOB_ANDROID_NEW_TRANSACTION_INTERSTITIAL_UNIT_ID?.trim();
  }

  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_ADMOB_IOS_NEW_TRANSACTION_INTERSTITIAL_UNIT_ID?.trim();
  }

  return undefined;
}

function loadNextInterstitial(interstitial: InterstitialAdInstance) {
  if (isLoaded || isLoading || isShowing) {
    return;
  }

  isLoading = true;
  interstitial.load();
}

function settleShowingInterstitial() {
  isShowing = false;
  resolveClosed?.();
  resolveClosed = undefined;
}

async function createInterstitial() {
  const googleMobileAds = await loadMobileAds();

  if (!googleMobileAds) {
    return null;
  }

  const adUnitId = __DEV__ ? googleMobileAds.TestIds.INTERSTITIAL : getProductionAdUnitId();

  if (!adUnitId) {
    return null;
  }

  const interstitial = googleMobileAds.InterstitialAd.createForAdRequest(adUnitId);

  interstitial.addAdEventListener(googleMobileAds.AdEventType.LOADED, () => {
    isLoaded = true;
    isLoading = false;
  });
  interstitial.addAdEventListener(googleMobileAds.AdEventType.OPENED, () => {
    if (Platform.OS === 'ios') {
      StatusBar.setHidden(true);
    }
  });
  interstitial.addAdEventListener(googleMobileAds.AdEventType.CLOSED, () => {
    if (Platform.OS === 'ios') {
      StatusBar.setHidden(false);
    }

    isLoaded = false;
    settleShowingInterstitial();
    loadNextInterstitial(interstitial);
  });
  interstitial.addAdEventListener(googleMobileAds.AdEventType.ERROR, () => {
    isLoaded = false;
    isLoading = false;

    if (isShowing) {
      settleShowingInterstitial();
    }
  });

  return interstitial;
}

async function getInterstitial() {
  interstitialPromise ??= createInterstitial();
  return interstitialPromise;
}

export async function preloadNewTransactionInterstitial() {
  const interstitial = await getInterstitial();

  if (interstitial) {
    loadNextInterstitial(interstitial);
  }
}

export async function showNewTransactionInterstitial() {
  const interstitial = await getInterstitial();

  if (!interstitial || !isLoaded) {
    if (interstitial) {
      loadNextInterstitial(interstitial);
    }

    return;
  }

  isLoaded = false;
  isShowing = true;

  await new Promise<void>((resolve) => {
    resolveClosed = resolve;

    void interstitial.show().catch(() => {
      settleShowingInterstitial();
      loadNextInterstitial(interstitial);
    });
  });
}
