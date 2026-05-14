import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { RemoteConfig } from '../types';

class ConfigService {
  private config: RemoteConfig | null = null;
  private readonly CONFIG_ID = 'main_config';

  public async initConfig() {
    const docRef = doc(db, 'app_config', this.CONFIG_ID);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) {
      const initialConfig: RemoteConfig = {
        maintenanceMode: false,
        minWithdrawalAfrica: 50,
        minWithdrawalEurope: 70,
        adMobEnabled: true,
        platformCommission: 0.35,
        appVersion: '1.0.0',
        adMobAppId: 'ca-app-pub-1692654524980057~7842501030',
        adMobRewardedId: 'ca-app-pub-1692654524980057/5757943924',
        adMobInterstitialId: 'ca-app-pub-1692654524980057/5674928308',
        modules: {
          nav: { name: 'Navigation UI', status: 'complete', enabled: true },
          admob: { name: 'Monétisation AdMob', status: 'partial', enabled: true },
          quotes: { name: 'Moteur Citations', status: 'complete', enabled: true },
          social: { name: 'Interaction Sociale', status: 'partial', enabled: true },
          video: { name: 'Vidéos/Vidéo', status: 'beta', enabled: true },
          firebase: { name: 'Backend Firebase', status: 'stable', enabled: true }
        },
        customScripts: '',
        integrations: {
          adMobAppId: 'ca-app-pub-1692654524980057~7842501030',
          adMobRewardedId: 'ca-app-pub-1692654524980057/5757943924',
          adMobInterstitialId: 'ca-app-pub-1692654524980057/5674928308'
        }
      };
      await setDoc(docRef, initialConfig);
      this.config = initialConfig;
    } else {
      this.config = snap.data() as RemoteConfig;
    }
  }

  public subscribe(callback: (config: RemoteConfig) => void) {
    return onSnapshot(doc(db, 'app_config', this.CONFIG_ID), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as RemoteConfig;
        this.config = data;
        callback(data);
      }
    });
  }

  public async updateConfig(updates: Partial<RemoteConfig>) {
    const docRef = doc(db, 'app_config', this.CONFIG_ID);
    await updateDoc(docRef, updates);
  }

  public getConfig(): RemoteConfig | null {
    return this.config;
  }
}

export const configService = new ConfigService();
