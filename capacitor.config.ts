import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.pokestudyred',
  appName: 'Pokestudy Red',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    // Prevent fullscreen - run as normal Android app
    backgroundColor: '#1a1a2e',
  },
  ios: {
    contentInset: 'automatic',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
      overlaysWebView: false,
    },
  },
};

export default config;

