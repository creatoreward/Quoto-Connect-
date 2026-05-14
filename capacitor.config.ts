import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quotoconnect.app',
  appName: 'Quoto Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
