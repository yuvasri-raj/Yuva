export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'admin';
  location?: string;
  state?: string;
  district?: string;
  preferredLanguage?: 'en' | 'ta';
  profileImage?: string;
  createdAt?: string;
}

export interface CropRecommendation {
  _id: string;
  userId?: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilPh?: number;
  soilType: string;
  location: string;
  recommendedCrop: string;
  confidence: number;
  explanation: string;
  secondaryCrops?: string[];
  soilSuitability?: string;
  climateSuitability?: string;
  expectedBenefits?: string;
  guidance?: string[];
  isDemo?: boolean;
  createdAt: string;
}

export interface DiseaseDetection {
  _id: string;
  userId?: string;
  imageUrl: string;
  cropName: string;
  diseaseName: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  symptoms: string[];
  prevention: string[];
  treatment: {
    organic: string[];
    chemical: string[];
  };
  isDemo?: boolean;
  detectedAt: string;
  createdAt?: string;
}

export interface SoilReport {
  _id: string;
  userId?: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  organicMatter: number;
  soilType: string;
  healthScore: number;
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement';
  nutrientStatus: {
    nitrogenStatus: string;
    phosphorusStatus: string;
    potassiumStatus: string;
    phStatus: string;
    moistureStatus: string;
    organicMatterStatus: string;
  };
  recommendations: string[];
  isDemo?: boolean;
  createdAt: string;
}

export interface MarketPrice {
  _id: string;
  cropName: string;
  marketName: string;
  location?: string;
  state: string;
  district?: string;
  price: number;
  unit?: string;
  date?: string;
  source?: string;
  msp?: number;
  trendDirection?: 'up' | 'down' | 'stable';
  changePercentage?: number;
  history7Days?: Array<{ date: string; price: number }>;
  createdAt?: string;
}

export interface ProfitCalculation {
  _id: string;
  userId?: string;
  cropName: string;
  landArea: number;
  landAreaUnit?: string;
  seedCost?: number;
  fertilizerCost?: number;
  pesticideCost?: number;
  labourCost?: number;
  irrigationCost?: number;
  machineryCost?: number;
  otherCost?: number;
  expectedYield: number;
  yieldUnit?: string;
  expectedPrice: number;
  sellingPrice?: number;
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
  roi?: number;
  profitMargin: number;
  breakEvenYield: number;
  breakEvenPrice: number;
  costBreakdown?: Record<string, number>;
  createdAt: string;
}

export interface GovernmentScheme {
  _id: string;
  schemeName: string;
  description?: string;
  eligibility: string[];
  benefits: string;
  documentsRequired: string[];
  applicationProcess: string;
  applicationUrl?: string;
  officialLink?: string;
  ministry?: string;
  state?: string;
  category: string;
  farmerCategory?: string;
  fundingAmount?: string;
  createdAt?: string;
}

export interface CommunityPost {
  _id: string;
  userId: string;
  userName: string;
  userRole?: string;
  userLocation?: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: Array<{
    _id: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
  }>;
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'scheme' | 'market' | 'community' | 'disease' | 'crop' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface WeatherInfo {
  location: string;
  state?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  icon?: string;
  uvIndex?: number;
  advisory: string;
  isLive: boolean;
  forecast: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainChance: number;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalCropRecs: number;
  totalDiseaseScans: number;
  totalSoilReports: number;
  totalMarketPrices: number;
  totalSchemes: number;
  totalPosts: number;
  cropBreakdown: Array<{ name: string; count: number }>;
  diseaseBreakdown: Array<{ name: string; count: number }>;
}

export type PageId =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'crop-recommendation'
  | 'disease-detection'
  | 'soil-health'
  | 'market-prices'
  | 'profit-calculator'
  | 'government-schemes'
  | 'farmer-community'
  | 'ai-chatbot'
  | 'profile'
  | 'settings'
  | 'admin-dashboard'
  | 'api-docs';
