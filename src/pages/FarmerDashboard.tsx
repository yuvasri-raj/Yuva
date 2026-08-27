import React, { useState, useEffect } from 'react';
import {
  Wheat,
  ScanLine,
  FlaskConical,
  TrendingUp,
  Calculator,
  Landmark,
  BotMessageSquare,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Clock
} from 'lucide-react';
import { PageId, CropRecommendation, DiseaseDetection, SoilReport, MarketPrice, GovernmentScheme, CommunityPost } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { WeatherWidget } from '../components/WeatherWidget.js';
import { HealthMeter } from '../components/HealthMeter.js';

interface FarmerDashboardProps {
  setCurrentPage: (page: PageId) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [latestCrop, setLatestCrop] = useState<CropRecommendation | null>(null);
  const [latestDisease, setLatestDisease] = useState<DiseaseDetection | null>(null);
  const [latestSoil, setLatestSoil] = useState<SoilReport | null>(null);
  const [topMarket, setTopMarket] = useState<MarketPrice | null>(null);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [cropRes, diseaseRes, soilRes, marketRes, schemesRes, postsRes] = await Promise.allSettled([
          api.getLatestCrop(),
          api.getLatestDisease(),
          api.getLatestSoil(),
          api.getMarketPrices(),
          api.getSchemes(),
          api.getCommunityPosts()
        ]);

        if (cropRes.status === 'fulfilled') setLatestCrop(cropRes.value);
        if (diseaseRes.status === 'fulfilled') setLatestDisease(diseaseRes.value);
        if (soilRes.status === 'fulfilled') setLatestSoil(soilRes.value);
        if (marketRes.status === 'fulfilled' && marketRes.value?.data?.length > 0) {
          setTopMarket(marketRes.value.data[0]);
        }
        if (schemesRes.status === 'fulfilled' && schemesRes.value) {
          setSchemes((schemesRes.value || []).slice(0, 3));
        }
        if (postsRes.status === 'fulfilled' && postsRes.value) {
          setPosts((postsRes.value || []).slice(0, 3));
        }
      } catch (err) {
        console.warn('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div id="farmer-dashboard-root" className="space-y-6">
      {/* Sleek Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-1">
            {language === 'ta' ? 'விவசாயி நுண்ணறிவு மையம்' : 'Farm Command Center'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {t.dashboard.welcome}, {user?.name || 'Farmer'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {language === 'ta'
              ? 'உங்கள் நிலத்தின் மண் வளம், பயிர் பாதுகாப்பு மற்றும் சந்தை வாய்ப்புகளை உடனுக்குடன் அறிந்து கொள்ளுங்கள்.'
              : 'Real-time agronomic insights, soil diagnosis, leaf pathology, and APMC mandi market trends for your land.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="dash-btn-ai-chat"
            onClick={() => setCurrentPage('ai-chatbot')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <BotMessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{t.dashboard.askAi}</span>
          </button>
          <button
            id="dash-btn-crop-rec"
            onClick={() => setCurrentPage('crop-recommendation')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
          >
            <Wheat className="w-4 h-4" />
            <span>{language === 'ta' ? 'பயிர் பரிந்துரை' : 'New Crop Plan'}</span>
          </button>
        </div>
      </div>

      {/* Weather Advisory Widget */}
      <WeatherWidget initialLocation={user?.district ? `${user.district}, ${user.state || 'Tamil Nadu'}` : 'Coimbatore, Tamil Nadu'} />

      {/* 4 Core Sleek Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Soil Health Score */}
        <div
          id="dash-card-soil"
          onClick={() => setCurrentPage('soil-health')}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.dashboard.soilScore}</span>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                {latestSoil?.rating || 'Optimal'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">
                {latestSoil ? latestSoil.healthScore : 88}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1 truncate">
              {latestSoil ? latestSoil.soilType : 'Loam Soil'}
            </p>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${latestSoil?.healthScore || 88}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-emerald-600">
              <span>{language === 'ta' ? 'மண் பரிசோதிக்க' : 'Test Soil Health'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 2: Recommended Crop */}
        <div
          id="dash-card-crop"
          onClick={() => setCurrentPage('crop-recommendation')}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.dashboard.latestRec}</span>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                {latestCrop?.confidence || 94}% Fit
              </span>
            </div>

            <p className="text-2xl font-black text-slate-800 leading-tight truncate">
              {latestCrop?.recommendedCrop || 'Maize (Corn)'}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1 truncate">
              {latestCrop?.season || 'Kharif / Monsoon'} Season
            </p>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${latestCrop?.confidence || 94}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-emerald-600">
              <span>{language === 'ta' ? 'பரிந்துரை பெற' : 'View Crop Guidance'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 3: Disease Pathology */}
        <div
          id="dash-card-disease"
          onClick={() => setCurrentPage('disease-detection')}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.dashboard.latestDisease}</span>
              <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                AI Vision
              </span>
            </div>

            <p className="text-lg font-black text-slate-800 leading-snug line-clamp-1">
              {latestDisease ? `${latestDisease.cropName}: ${latestDisease.diseaseName}` : 'Tomato: Early Blight'}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Severity: <strong className="text-amber-600 font-bold">{latestDisease?.severity || 'Moderate'}</strong>
            </p>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${latestDisease?.confidence || 92}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-emerald-600">
              <span>{language === 'ta' ? 'இலையை ஸ்கேன் செய்ய' : 'Scan Plant Leaf'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 4: Top Mandi Price */}
        <div
          id="dash-card-market"
          onClick={() => setCurrentPage('market-prices')}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.dashboard.topMarket}</span>
              <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
                ▲ +6.8%
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">
                ₹{topMarket?.price ? topMarket.price.toLocaleString() : '14,200'}
              </span>
              <span className="text-xs font-bold text-slate-400">/qtl</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1 truncate">
              {topMarket?.cropName || 'Turmeric (Finger)'} • Erode APMC
            </p>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full w-3/4" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-emerald-600">
              <span>{language === 'ta' ? 'சந்தை விலைகள்' : 'Track Mandi Rates'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main 12-Column Grid (Sleek Interface arrangement) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Recommendation Feature Spotlight & Quick Actions (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Spotlight Card: AI Crop Recommendation Analysis */}
          <div className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-white">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                  {language === 'ta' ? 'விரிவான பகுப்பாய்வு' : 'AI Agronomic Recommendation'}
                </span>
                <h3 className="font-bold text-slate-800 text-base">
                  {latestCrop?.recommendedCrop || 'Maize (Corn)'} Precision Profile
                </h3>
              </div>
              <button
                onClick={() => setCurrentPage('crop-recommendation')}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>{language === 'ta' ? 'முழு விவரம்' : 'Full Analysis'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Expected Yield</p>
                  <p className="text-sm font-bold text-slate-700">{latestCrop?.expectedYield || '26-30 qtl/acre'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Water Need</p>
                  <p className="text-sm font-bold text-slate-700">{latestCrop?.waterRequirement || 'Moderate (500mm)'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</p>
                  <p className="text-sm font-bold text-slate-700">{latestCrop?.cropDurationDays || 110} Days</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Profitability</p>
                  <p className="text-sm font-bold text-emerald-600">{latestCrop?.profitabilityRating || 'High (₹42k/ac)'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <Wheat className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட சாகுபடி நடைமுறைகள்:' : 'Key Cultivation Advisory:'}
                  </p>
                  <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                    {latestCrop?.cultivationTips?.[0] || 'Apply FYM 5 tonnes/acre before primary tillage. Maintain ridge and furrow spacing at 60cm.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Agronomy Action Grid */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t.dashboard.quickActions}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => setCurrentPage('crop-recommendation')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-900 text-left transition-all flex flex-col justify-between group"
              >
                <Wheat className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-snug">{language === 'ta' ? 'பயிர் தேர்வு' : 'Crop Selector'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('disease-detection')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 text-slate-900 text-left transition-all flex flex-col justify-between group"
              >
                <ScanLine className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-snug">{language === 'ta' ? 'இலை ஸ்கேன்' : 'Plant Scan'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('soil-health')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-slate-100/60 text-slate-900 text-left transition-all flex flex-col justify-between group"
              >
                <FlaskConical className="w-6 h-6 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-snug">{language === 'ta' ? 'மண் வளம்' : 'Soil Testing'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('market-prices')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-300 hover:bg-amber-50/40 text-slate-900 text-left transition-all flex flex-col justify-between group"
              >
                <TrendingUp className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-snug">{language === 'ta' ? 'மண்டி விலை' : 'Mandi Rates'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('profit-calculator')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-900 text-left transition-all flex flex-col justify-between group"
              >
                <Calculator className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-snug">{language === 'ta' ? 'லாபக் கணக்கு' : 'Profit Calc'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('government-schemes')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-rose-300 hover:bg-rose-50/40 text-slate-900 text-left transition-all flex flex-col justify-between group"
              >
                <Landmark className="w-6 h-6 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-snug">{language === 'ta' ? 'அரசு மானியம்' : 'Subsidies'}</span>
              </button>
            </div>
          </div>

          {/* 2-Column: Active Government Schemes & Community Buzz */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Schemes */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-800">{t.dashboard.schemesAlert}</h3>
                  </div>
                  <button
                    onClick={() => setCurrentPage('government-schemes')}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    {t.common.viewAll}
                  </button>
                </div>

                <div className="space-y-3">
                  {schemes.map((s, i) => (
                    <div
                      key={s._id || i}
                      onClick={() => setCurrentPage('government-schemes')}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {s.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{s.fundingAmount}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{s.schemeName}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{s.benefits}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Community Buzz */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-800">{t.dashboard.communityBuzz}</h3>
                  </div>
                  <button
                    onClick={() => setCurrentPage('farmer-community')}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    {t.common.viewAll}
                  </button>
                </div>

                <div className="space-y-3">
                  {posts.map((p, i) => (
                    <div
                      key={p._id || i}
                      onClick={() => setCurrentPage('farmer-community')}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 truncate">{p.userName}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {p.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{p.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Agro Assistant Chat Sidecard (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                    <BotMessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-none">
                      {language === 'ta' ? 'வேளாண் AI உதவியாளர்' : 'Agro Assistant'}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini 2.5 Live
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('ai-chatbot')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  {language === 'ta' ? 'முழு அரட்டை' : 'Full Chat'}
                </button>
              </div>

              {/* Sample Sleek Chat Bubbles */}
              <div className="space-y-3 mb-4">
                <div className="bg-slate-100 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-700 leading-normal">
                  {language === 'ta'
                    ? 'வணக்கம்! உங்கள் பயிரில் ஏதேனும் பூச்சித் தாக்குதல் அல்லது உரத் தேவைகள் உள்ளதா? கேளுங்கள்.'
                    : 'Hello! Need instant guidance on crop fertilizers, pest management, or market auction timings?'}
                </div>
                <div className="bg-emerald-600 p-3.5 rounded-2xl rounded-tr-none text-xs text-white leading-normal ml-6">
                  {language === 'ta'
                    ? 'மக்காச்சோளத்திற்கு முதல் உரம் எப்போது இட வேண்டும்?'
                    : 'What is the ideal NPK dose for maize at 30 days after sowing?'}
                </div>
                <div className="bg-slate-100 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-700 leading-normal">
                  {language === 'ta'
                    ? 'விதைத்த 25-30 நாட்களில் யூரியா 50 கிலோ/ஏக்கர் மற்றும் பொட்டாஷ் 15 கிலோ/ஏக்கர் மேலுரமாக இடவும்.'
                    : 'Top dress with Urea (50 kg/acre) & Potash (15 kg/acre) at 25-30 DAS during weeding.'}
                </div>
              </div>

              {/* Fast Suggested Prompts */}
              <div className="space-y-1.5 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Inquiries</p>
                <button
                  onClick={() => setCurrentPage('ai-chatbot')}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 transition-colors truncate"
                >
                  🌱 {language === 'ta' ? 'இயற்கை பூச்சி விரட்டி தயார் செய்ய' : 'Organic bio-pesticide recipe'}
                </button>
                <button
                  onClick={() => setCurrentPage('ai-chatbot')}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 transition-colors truncate"
                >
                  💧 {language === 'ta' ? 'சொட்டு நீர் பாசன மானியம் விவரம்' : 'Drip irrigation subsidy steps'}
                </button>
              </div>
            </div>

            <button
              id="dash-btn-open-chatbot"
              onClick={() => setCurrentPage('ai-chatbot')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>{language === 'ta' ? 'உரையாடலைத் தொடங்க' : 'Ask Question Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
