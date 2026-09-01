import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.nixacademy.app',
  appName: 'Nix Academy',
  webDir: 'dist',
  backgroundColor: '#141210',
  android: {
    backgroundColor: '#141210',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: '#141210',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#141210',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'native',
    },
  },
};

export default config;
