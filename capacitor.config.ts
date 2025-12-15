import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.studymondex',
  appName: 'StudyMon Dex',
  webDir: 'dist',
  server: {
    // For development, you can use the Lovable sandbox URL
    // url: 'https://033027f8-29bf-42fd-9735-b8a7558eca22.lovableproject.com?forceHideBadge=true',
    // cleartext: true,
    // For production (offline APK), comment out the above and keep androidScheme
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
  },
};

export default config;

