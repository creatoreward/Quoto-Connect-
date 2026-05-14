export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  coverURL?: string;
  bio?: string;
  phoneNumber?: string;
  balance: number;
  coins?: number;
  quotoPoints?: number;
  videosWatchedTotal: number;
  contentViewsTotal?: number;  // Cumul des vues sur tous les contenus (reels, posts, quotes)
  adRevenueCreator: number;      // Revenus gagnés par ses contenus (vues publicitaires)
  adRevenueRewarded: number;     // Revenus gagnés en regardant des vidéos
  totalAdRevenueGenerated: number; // Total généré pour la plateforme par cet user
  totalWithdrawn: number;        // Total d'argent retiré
  revenueAdsForUnlock: number;   // Revenus générés pour ouvrir des fonctions
  revenueChallenges: number;     // Gains par les défis
  revenueInvites: number;        // Gains par invitations
  revenueEvents: number;         // Gains sur les évènements
  revenueBirthdays: number;       // Gains sur les anniversaires
  revenueCreatorBonus: number;   // Bonus Creator Reward (viral)
  creatorStatus?: 'pending' | 'signed' | 'verified';
  followersCount: number;
  followingCount: number;
  createdAt: any;
  role: UserRole;
  isVerified: boolean;
  status?: 'active' | 'alerted' | 'suspended';
  isPaymentSuspended?: boolean;
  region?: 'Africa' | 'Europe' | 'Other';
  country?: string;
  province?: string;
  cityCurrent?: string;
  cityOrigin?: string;
  birthDate?: string;
  gender?: 'homme' | 'femme' | 'autre';
  profession?: string;
  withdrawalMethod?: 'MobileMoney' | 'Crypto' | 'Bank';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'follow' | 'post_reels' | 'weekly_views' | 'engagement';
  rewardPoints?: number;
  rewardMoney?: number;
  targetCount: number;
  requirement?: {
    views?: number;
    likes?: number;
    comments?: number;
    reels?: number;
  };
  isActive: boolean;
  createdAt: any;
}

export interface UserChallengeProgress {
  userId: string;
  challengeId: string;
  currentCount: number;
  isCompleted: boolean;
  updatedAt: any;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'nowpayments' | 'flutterwave';
  type: 'deposit' | 'withdraw';
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
}

export interface Quote {
  id?: string;
  text: string;
  author: string;
  category: string;
  creatorId: string;
  createdAt: any;
  tags: string[];
  likesCount: number;
  viewsCount: number;
  sentiment?: 'joyful' | 'sad' | 'neutral' | 'inspirational';
  language: string;
}

export interface SocialPost {
  id?: string;
  quoteId: string;
  userId: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: any;
}

export interface Reel {
  id: string;
  userId: string;
  userName: string;
  description: string;
  videoURL: string;
  thumbnailURL?: string;
  likesCount: number;
  viewsCount: number;
  createdAt: any;
}

export interface Comment {
  id?: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: any;
}

export interface AdStatus {
  interstitialCount: number;
  lastRewardedAt?: any;
  testMode: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverURL?: string;
  membersCount: number;
  ownerId: string;
  isPrivate: boolean;
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  groupId?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export interface QuotoPage {
  id: string;
  name: string;
  description: string;
  category: string;
  followersCount: number;
  ownerId: string;
  isVerified: boolean;
  photoURL?: string;
  coverURL?: string;
}

export interface RemoteConfig {
  maintenanceMode: boolean;
  minWithdrawalAfrica: number;
  minWithdrawalEurope: number;
  adMobEnabled: boolean;
  adMobAppId?: string;
  adMobRewardedId?: string;
  adMobInterstitialId?: string;
  platformCommission: number; // 0.35
  appVersion: string;
  modules?: Record<string, {
    name: string;
    status: 'complete' | 'partial' | 'beta' | 'stable' | 'hidden';
    enabled: boolean;
  }>;
  customScripts?: string;
  integrations?: {
    gemini?: string;
    nowPayments?: string;
    flutterwavePublic?: string;
    flutterwaveSecret?: string;
    adMobAppId?: string;
    adMobRewardedId?: string;
    adMobInterstitialId?: string;
    tiktokPixelId?: string;
    facebookAppId?: string;
  };
}

export interface DeveloperTask {
  id: string;
  adminId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  createdAt: any;
}
