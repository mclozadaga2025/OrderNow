module.exports = {
  android: {
    edgeToEdgeEnabled: false,
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
    bundleIdentifier: "com.draftbit.newapp",
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
  name: "Thu Chi",
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
          image:
            "./assets/a_vibrant_and_youthful_mobile_splash_screen_for_thu_chi_app._a_soft_gradient.png",
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

  scheme: "thu-chi",
  slug: "thu-chi",
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
    themeColor: undefined,
    name: undefined,
    shortName: undefined,
    lang: undefined,
    backgroundColor: undefined,
    description: undefined,
    orientation: undefined,
    startUrl: undefined,
  },
  platforms: ["ios", "android", "web"],
  description:
    'Thu chi l\xE0 m\u1ED9t \u1EE9ng d\u1EE5ng di \u0111\u1ED9ng qu\u1EA3n l\xFD t\xE0i ch\xEDnh c\xE1 nh\xE2n th\xF4ng minh, \u0111\u01B0\u1EE3c thi\u1EBFt k\u1EBF nh\u1EB1m gi\xFAp ng\u01B0\u1EDDi d\xF9ng d\u1EC5 d\xE0ng ki\u1EC3m so\xE1t d\xF2ng ti\u1EC1n, thi\u1EBFt l\u1EADp ng\xE2n s\xE1ch v\xE0 \u0111\u1EA1t \u0111\u01B0\u1EE3c c\xE1c m\u1EE5c ti\xEAu t\xE0i ch\xEDnh b\u1EC1n v\u1EEFng. V\u1EDBi giao di\u1EC7n t\u1ED1i gi\u1EA3n, tr\u1EF1c quan v\xE0 t\u1ED1i \u01B0u tr\u1EA3i nghi\u1EC7m ng\u01B0\u1EDDi d\xF9ng, \u1EE9ng d\u1EE5ng lo\u1EA1i b\u1ECF s\u1EF1 ph\u1EE9c t\u1EA1p c\u1EE7a c\xE1c ph\u01B0\u01A1ng ph\xE1p ghi ch\xE9p truy\u1EC1n th\u1ED1ng, bi\u1EBFn vi\u1EC7c qu\u1EA3n l\xFD chi ti\xEAu h\xE0ng ng\xE0y tr\u1EDF th\xE0nh m\u1ED9t th\xF3i quen \u0111\u01A1n gi\u1EA3n v\xE0 nhanh ch\xF3ng.\n\nT\xEDnh n\u0103ng c\u1ED1t l\xF5i (Key Features)\nGhi ch\xE9p chi ti\xEAu si\xEAu t\u1ED1c: Ph\xE2n lo\u1EA1i v\xE0 l\u01B0u l\u1EA1i c\xE1c kho\u1EA3n thu, kho\u1EA3n chi ch\u1EC9 v\u1EDBi v\xE0i thao t\xE1c ch\u1EA1m.\n\nThi\u1EBFt l\u1EADp ng\xE2n s\xE1ch th\xF4ng minh: \u0110\u1EB7t h\u1EA1n m\u1EE9c chi ti\xEAu cho t\u1EEBng danh m\u1EE5c (\u0103n u\u1ED1ng, mua s\u1EAFm, gi\u1EA3i tr\xED...) v\xE0 nh\u1EADn c\u1EA3nh b\xE1o t\u1EF1 \u0111\u1ED9ng khi s\u1EAFp v\u01B0\u1EE3t h\u1EA1n m\u1EE9c.\n\nB\xE1o c\xE1o tr\u1EF1c quan (Bi\u1EC3u \u0111\u1ED3 tr\u1EF1c quan): Th\u1ED1ng k\xEA d\xF2ng ti\u1EC1n theo tu\u1EA7n, th\xE1ng, n\u0103m d\u01B0\u1EDBi d\u1EA1ng bi\u1EC3u \u0111\u1ED3 b\xE1nh v\xE0 bi\u1EC3u \u0111\u1ED3 c\u1ED9t, gi\xFAp ng\u01B0\u1EDDi d\xF9ng d\u1EC5 d\xE0ng nh\u1EADn di\u1EC7n "l\u1ED7 h\u1ED5ng" t\xE0i ch\xEDnh.',

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
