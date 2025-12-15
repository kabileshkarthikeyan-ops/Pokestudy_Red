import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.studymondex',
  appName: 'StudyMon Dex',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
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
  },
};

export default config;

