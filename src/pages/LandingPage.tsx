import React from 'react';
import {
  Sprout,
  Wheat,
  ScanLine,
  FlaskConical,
  TrendingUp,
  Calculator,
  Landmark,
  BotMessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Users,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';

interface LandingPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      id: 'crop-recommendation' as PageId,
      icon: <Wheat className="w-6 h-6 text-emerald-600" />,
      title: language === 'ta' ? 'AI பயிர் பரிந்துரை' : 'AI Crop Recommendation',
      desc: language === 'ta' ? 'NPK ஊட்டச்சத்துக்கள் மற்றும் வானிலையை அடிப்படையாகக் கொண்டு அதிக மகசூல் தரும் பயிர்களைத் தேர்ந்தெடுக்கவும்.' : 'Predict the most profitable and suitable crop using soil nutrients (NPK), climate factors, and agro-climatic data.',
      badge: 'ML Engine'
    },
    {
      id: 'disease-detection' as PageId,
      icon: <ScanLine className="w-6 h-6 text-emerald-600" />,
      title: language === 'ta' ? 'இலை நோய் கண்டறிதல்' : 'Leaf Disease Detection',
      desc: language === 'ta' ? 'பாதிக்கப்பட்ட இலை புகைப்படத்தைப் பதிவேற்றி நோய் தீவிரம் மற்றும் இயற்கை/ரசாயன தீர்வுகளை உடனடியாகப் பெறவும்.' : 'Instant AI vision scanning for leaf diseases with severity grading, visible symptoms, and organic bio-control remedies.',
      badge: 'AI Vision'
    },
    {
      id: 'soil-health' as PageId,
      icon: <FlaskConical className="w-6 h-6 text-emerald-600" />,
      title: language === 'ta' ? 'மண் வள பகுப்பாய்வு' : 'Soil Health Analysis',
      desc: language === 'ta' ? 'மண் pH, கரிமச் சத்து மற்றும் ஊட்டச்சத்து சமநிலையைக் கணக்கிட்டு மண் வள அட்டையை உருவாக்கவும்.' : 'Generate a customized 0-100 Soil Health Index with fertilizer balancing and soil remediation guidance.',
      badge: 'Health Index'
    },
    {
      id: 'market-prices' as PageId,
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      title: language === 'ta' ? 'நேரலை சந்தை விலைகள்' : 'Mandi Market Prices',
      desc: language === 'ta' ? 'நாடு முழுவதும் உள்ள ஒழுங்குமுறை விற்பனைக் கூடங்களின் தினசரி விளைபொருள் விலைகள் மற்றும் MSP ஆதரவு விலை.' : 'Track live APMC commodity auction prices, government MSP support rates, and 7-day price fluctuations.',
      badge: 'Live APMC'
    },
    {
      id: 'profit-calculator' as PageId,
      icon: <Calculator className="w-6 h-6 text-emerald-600" />,
      title: language === 'ta' ? 'பண்ணை லாபக் கணக்கீட்டுக் கருவி' : 'Farm Economics Calculator',
      desc: language === 'ta' ? 'விதை, உரம், ஆட்கள் கூலி செலவுகளை கணக்கிட்டு நிகர லாபம் மற்றும் நஷ்டமில்லா விற்பனை விலையை முன்கூட்டியே அறியவும்.' : 'Simulate production expenses, expected yield, and calculate break-even targets and net profit margins.',
      badge: 'Financial Tool'
    },
    {
      id: 'government-schemes' as PageId,
      icon: <Landmark className="w-6 h-6 text-emerald-600" />,
      title: language === 'ta' ? 'அரசு மானியங்கள் & திட்டங்கள்' : 'Government Subsidies & Schemes',
      desc: language === 'ta' ? 'PM-KISAN, பயிர் காப்பீடு, சொட்டு நீர் பாசன மானியங்களுக்கான தகுதி வரம்புகள் மற்றும் விண்ணப்பிக்கும் முறைகள்.' : 'Direct access to central and state agricultural schemes, eligibility checklists, and official portal links.',
      badge: 'Direct Subsidies'
    }
  ];

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sleek Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100 bg-gradient-to-b from-white via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ta' ? 'விவசாயிகளுக்கான முழுமையான AI தளம்' : 'Next-Gen Smart Agriculture Platform'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                {language === 'ta' ? (
                  <>
                    சிறந்த விவசாயத்திற்கு <span className="text-emerald-600 underline decoration-emerald-300 decoration-4">நுண்ணறிவு தொழில்நுட்பம்</span>
                  </>
                ) : (
                  <>
                    Smart Technology for <span className="text-emerald-600 underline decoration-emerald-300 decoration-4">Smarter Farming</span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {t.heroDesc}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="btn-hero-get-started"
                  onClick={() => setCurrentPage(user ? 'dashboard' : 'register')}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xs flex items-center gap-2 transition-all hover:gap-3"
                >
                  <span>{user ? t.nav.dashboard : t.nav.getStarted}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-hero-explore"
                  onClick={() => setCurrentPage('crop-recommendation')}
                  className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-sm shadow-xs hover:bg-slate-50 transition-all"
                >
                  {t.nav.exploreFeatures}
                </button>

                <button
                  id="btn-hero-ask-ai"
                  onClick={() => setCurrentPage('ai-chatbot')}
                  className="px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-sm flex items-center gap-2 transition-all"
                >
                  <BotMessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ta' ? 'AI உதவியாளர்' : 'Ask Agro AI'}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div>
                  <p className="text-2xl font-black text-slate-800">98.4%</p>
                  <p className="text-xs text-slate-500 font-medium">{language === 'ta' ? 'பரிந்துரை துல்லியம்' : 'Recommendation Accuracy'}</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">100+</p>
                  <p className="text-xs text-slate-500 font-medium">{language === 'ta' ? 'அரசு மானியங்கள்' : 'Active Schemes & MSP'}</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">24x7</p>
                  <p className="text-xs text-slate-500 font-medium">{language === 'ta' ? 'தமிழ் & ஆங்கில AI' : 'Bilingual Agro Assistant'}</p>
                </div>
              </div>
            </div>

            {/* Right Hero Card Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
                {/* Floating Badge */}
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>AI Powered</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold">{language === 'ta' ? 'நேரலை விவசாய வழிகாட்டி' : 'Live Smart Agronomy Feed'}</p>
                      <h3 className="text-lg font-bold text-white">Coimbatore Farm Zone</h3>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Sample Live Card 1: Crop */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Wheat className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">{language === 'ta' ? 'பரிந்துரைக்கப்பட்ட பயிர்' : 'Optimal Recommended Crop'}</p>
                        <p className="text-sm font-bold text-white">Maize (Hybrid Corn)</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      94% Match
                    </span>
                  </div>

                  {/* Sample Live Card 2: Disease */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <ScanLine className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">{language === 'ta' ? 'இலை ஸ்கேன் கண்டறிதல்' : 'Leaf Pathology Diagnostic'}</p>
                        <p className="text-sm font-bold text-white">Tomato Early Blight</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                      Moderate
                    </span>
                  </div>

                  {/* Sample Live Card 3: Mandi */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">{language === 'ta' ? 'மண்டி விலை போக்கு' : 'Erode Turmeric Mandi'}</p>
                        <p className="text-sm font-bold text-white">₹14,200 / Quintal</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      +6.8% Up
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Soil Health: <strong className="text-emerald-400">88/100 (Good)</strong></span>
                  <span>Weather: <strong className="text-white">31°C Sunny</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              {language === 'ta' ? 'ஒருங்கிணைந்த வேளாண் சேவைகள்' : 'End-to-End Smart Agriculture Suite'}
            </h2>
            <p className="text-base text-slate-500">
              {language === 'ta'
                ? 'விதைப்பு முதல் அறுவடை மற்றும் விற்பனை வரை ஒவ்வொரு கட்டத்திலும் விவசாயிகளுக்கு துல்லியமான வழிகாட்டுதல்.'
                : 'Empowering farm decisions from pre-sowing soil testing to harvest disease protection and direct mandi sales.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                id={`feature-card-${f.id}`}
                onClick={() => setCurrentPage(f.id)}
                className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      {f.icon}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 group-hover:border-emerald-500 group-hover:text-emerald-700 transition-colors">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                  <span>{language === 'ta' ? 'பயன்படுத்துக' : 'Launch Feature'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & AI Chatbot Highlight */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Community Box */}
            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                {language === 'ta' ? 'விவசாயிகள் சமூகம் & அனுபவப் பகிர்வு' : 'Farmer Peer Community'}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {language === 'ta'
                  ? 'பிற விவசாயிகளுடன் இணைந்து புதிய இயற்கை முறைகள், பூச்சி எச்சரிக்கைகள் மற்றும் சந்தை நிலவரங்களை கலந்தாலோசியுங்கள்.'
                  : 'Connect with progressive farmers, agricultural officers, and scientists. Share field findings, pest alerts, and organic formulations.'}
              </p>
              <button
                id="btn-landing-community"
                onClick={() => setCurrentPage('farmer-community')}
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>{language === 'ta' ? 'சமூகத்தில் இணைக' : 'Explore Community Forum'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* AI Assistant Box */}
            <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                <BotMessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {language === 'ta' ? 'Agro Assistant — தமிழ் & ஆங்கில AI' : 'Agro Assistant AI Companion'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {language === 'ta'
                  ? 'பயிர் நோய்கள், உர கணக்கீடு, பூச்சி கட்டுப்பாடு, அல்லது அரசு திட்டங்கள் குறித்து எப்போது வேண்டுமானாலும் கேளுங்கள்.'
                  : 'Ask domain-specific questions in English or Tamil. Receive agronomic recommendations, fertilizer dosage schedules, and subsidy instructions.'}
              </p>
              <button
                id="btn-landing-chat"
                onClick={() => setCurrentPage('ai-chatbot')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all"
              >
                <span>{language === 'ta' ? 'AI உதவியாளரிடம் பேசுக' : 'Chat with Agro Assistant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block">Agro Vision</span>
                <span className="text-xs text-slate-400">Smart Technology for Smarter Farming</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <button onClick={() => setCurrentPage('crop-recommendation')} className="hover:text-white transition-colors">Crops</button>
              <button onClick={() => setCurrentPage('disease-detection')} className="hover:text-white transition-colors">Disease</button>
              <button onClick={() => setCurrentPage('soil-health')} className="hover:text-white transition-colors">Soil</button>
              <button onClick={() => setCurrentPage('market-prices')} className="hover:text-white transition-colors">Mandi</button>
              <button onClick={() => setCurrentPage('government-schemes')} className="hover:text-white transition-colors">Schemes</button>
              <button onClick={() => setCurrentPage('api-docs')} className="hover:text-white transition-colors">API Docs</button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Agro Vision. All agricultural data verified through official APMC & Agronomy knowledge engines.</p>
            <p>National Kisan Toll Free: 1800-180-1551</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
