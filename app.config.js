const APP_DESCRIPTION =
  "GomBill helps groups record shared bills, manage members and venues, track wallet balances, and review every transaction in one place.";

module.exports = {
  android: {
    // Android 16 (SDK 54 target) enforces edge-to-edge; the old
    // `edgeToEdgeEnabled` opt-out is deprecated and intentionally omitted.
    softwareKeyboardLayoutMode: "resize",
    icon: "./assets/images/icon.png",
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.tuanpham.gombill",
    versionCode: 1,
    allowBackup: undefined,
    permissions: undefined,
    blockedPermissions: undefined,
  },
  assetBundlePatterns: ["**/*"],
  experiments: { typedRoutes: true, tsconfigPaths: true },
  icon: "./assets/images/icon.png",
  ios: {
    icon: "./assets/images/icon.png",
    supportsTablet: true,
    buildNumber: "1",
    bundleIdentifier: "com.tuanpham.gombill",
    usesAppleSignIn: false,
    requireFullScreen: false,
    associatedDomains: undefined,
    appStoreUrl: undefined,
    isTabletOnly: undefined,
    infoPlist: {
      NSCameraUsageDescription: undefined,
      NSMicrophoneUsageDescription: undefined,
      NSPhotoLibraryUsageDescription: undefined,
      NSPhotoLibraryAddUsageDescription: undefined,
      NSLocationWhenInUseUsageDescription: undefined,
      NSLocationAlwaysUsageDescription: undefined,
      NSContactsUsageDescription: undefined,
      NSCalendarsUsageDescription: undefined,
      NSRemindersUsageDescription: undefined,
      NSMotionUsageDescription: undefined,
      NSFaceIDUsageDescription: undefined,
      NSSpeechRecognitionUsageDescription: undefined,
      NSBluetoothPeripheralUsageDescription: undefined,
      NSAppleMusicUsageDescription: undefined,
      NSUserTrackingUsageDescription: undefined,
    },
    privacyManifests: undefined,
    bitcode: undefined,
  },
  name: "GomBill",
  orientation: "portrait",
  plugins: [
    "expo-font",
    "expo-asset",
    [
      "expo-local-authentication",
      {
        faceIDPermission:
          "Cho ph\xE9p $(PRODUCT_NAME) s\u1EED d\u1EE5ng Face ID \u0111\u1EC3 m\u1EDF kh\xF3a t\xE0i kho\u1EA3n.",
      },
    ],

    [
      "expo-splash-screen",
      {
        backgroundColor: "#ffffff",
        image: "./assets/images/icon.png",
        imageWidth: 180,
        android: {
          backgroundColor: "#ffffff",
          image: "./assets/images/icon.png",
          imageWidth: 180,
        },
        ios: {
          backgroundColor: "#ffffff",
          image: "./assets/gombill_splash.png",
          resizeMode: "cover",
        },
      },
    ],

    [
      "react-native-google-mobile-ads",
      {
        androidAppId: "ca-app-pub-8148257689708201~7622854625",
        iosAppId: "ca-app-pub-3940256099942544~1458002511",
      },
    ],

    [
      "expo-router",
      {
        origin: "https://7dde2fb7ff.sandbox.draftbit.dev:5101",
        headOrigin: "https://7dde2fb7ff.sandbox.draftbit.dev:5100",
      },
    ],

    ["./plugins/draftbit-auto-launch-url-plugin"],
  ],

  scheme: "gombill",
  slug: "gombill",
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
    themeColor: undefined,
    name: "GomBill",
    shortName: "GomBill",
    lang: undefined,
    backgroundColor: undefined,
    description: APP_DESCRIPTION,
    orientation: undefined,
    startUrl: undefined,
  },
  platforms: ["ios", "android", "web"],
  description: APP_DESCRIPTION,

  locales: undefined,
  extra: undefined,
  jsEngine: undefined,
  notification: {
    icon: undefined,
    color: undefined,
    iosDisplayInForeground: false,
    androidMode: "default",
    androidCollapsedTitle: undefined,
  },
};
