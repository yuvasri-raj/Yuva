export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'farmer' | 'admin';
  state: string;
  district: string;
  location: string;
  preferredLanguage: 'en' | 'ta';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICropRecommendation {
  _id: string;
  userId: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilType: string;
  soilPh?: number;
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

export interface IDiseaseDetection {
  _id: string;
  userId: string;
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
  createdAt: string;
}

export interface ISoilReport {
  _id: string;
  userId: string;
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

export interface IMarketPrice {
  _id: string;
  cropName: string;
  marketName: string;
  location: string;
  state: string;
  district: string;
  price: number;
  unit: string;
  date: string;
  source: string;
  msp?: number;
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
  createdAt: string;
}

export interface IProfitCalculation {
  _id: string;
  userId: string;
  cropName: string;
  landArea: number; // in acres
  landAreaUnit: string;
  seedCost: number;
  fertilizerCost: number;
  pesticideCost: number;
  labourCost: number;
  irrigationCost: number;
  otherCost: number;
  expectedYield: number; // in Quintals or Kg
  yieldUnit: string;
  sellingPrice: number; // per unit
  totalCost: number;
  expectedRevenue: number;
  expectedProfit: number;
  profitMargin: number;
  breakEvenYield: number;
  breakEvenPrice: number;
  createdAt: string;
}

export interface IGovernmentScheme {
  _id: string;
  schemeName: string;
  description: string;
  eligibility: string[];
  benefits: string;
  documentsRequired: string[];
  applicationProcess: string;
  officialLink: string;
  state: string;
  category: 'Direct Income Support' | 'Crop Insurance' | 'Subsidy & Machinery' | 'Soil & Irrigation' | 'Organic Farming' | 'Credit & Loan';
  farmerCategory: string;
  fundingAmount?: string;
  createdAt: string;
}

export interface ICommunityPost {
  _id: string;
  userId: string;
  userName: string;
  userRole?: string;
  userLocation?: string;
  title: string;
  content: string;
  category: 'Crop' | 'Disease' | 'Soil' | 'Market' | 'Government Schemes' | 'General Farming';
  likes: string[]; // array of userIds
  commentsCount: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  _id: string;
  postId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface IChatMessage {
  _id: string;
  userId: string;
  message: string;
  response: string;
  language: 'en' | 'ta';
  isDemo?: boolean;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'scheme' | 'market' | 'community' | 'disease' | 'crop' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}
