import { AdStatus } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

class AdService {
  private adStatus: AdStatus = {
    interstitialCount: 0,
    lastRewardedAt: null,
    testMode: process.env.NODE_ENV !== 'production'
  };

  // Configuration des seuils
  public readonly REWARDS = {
    VIDEO_CALL: 5,        // 5 vidéos pour 1 appel
    AUDIO_MSG: 3,         // 3 vidéos pour 1 audio
    TEXT_MSG: 2,          // 2 vidéos pour 1 message écrit
    VIEW_BOOST: 5,        // 5 vidéos pour 100 vues
    BLUE_CHECK: 100       // 100 vidéos pour badge bleu
  };

  // Configuration eCPM et Partage (35% Plateforme, 65% Utilisateur)
  public readonly ECPM = {
    REWARDED: 10.0,  // 10$ pour 1000 vues = 0.01$ / vue
    INTERSTITIAL: 5.0 // 5$ pour 1000 vues = 0.005$ / vue
  };

  private readonly PLATFORM_PERCENT = 0.35;
  private readonly USER_PERCENT = 0.65;

  public incrementAction() {
    this.adStatus.interstitialCount++;
    if (this.adStatus.interstitialCount >= 3) {
      this.showInterstitial();
      this.adStatus.interstitialCount = 0;
    }
  }

  private showInterstitial() {
    console.log(`[AdMob] ${this.adStatus.testMode ? 'TEST' : 'REAL'} Interstitial Ad Displayed`);
  }

  public async showRewardedAd(userId?: string): Promise<boolean> {
    console.log("[AdMob] Rewarded Ad Completion Recorded");
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const totalRev = this.ECPM.REWARDED / 1000;
        const userShare = totalRev * this.USER_PERCENT;
        
        await updateDoc(userRef, {
          videosWatchedTotal: increment(1),
          adRevenueRewarded: increment(userShare),
          balance: increment(userShare),
          totalAdRevenueGenerated: increment(totalRev)
        });
        return true;
      } catch (err) {
        console.error("Error updating video count/revenue:", err);
        return false;
      }
    }
    return true;
  }

  /**
   * Enregistre une vue publicitaire sur un contenu et distribue les revenus au créateur
   */
  public async trackContentAdView(creatorId: string) {
    try {
      const creatorRef = doc(db, 'users', creatorId);
      const totalRev = this.ECPM.INTERSTITIAL / 1000;
      const creatorShare = totalRev * this.USER_PERCENT;

      await updateDoc(creatorRef, {
        adRevenueCreator: increment(creatorShare),
        balance: increment(creatorShare),
        totalAdRevenueGenerated: increment(totalRev),
        contentViewsTotal: increment(1)
      });
    } catch (err) {
      console.error("Error tracking content ad view:", err);
    }
  }

  public trackCTR(feature: string) {
    console.log(`[AdMob] Tracking CTR for ${feature}`);
  }
}

export const adService = new AdService();
