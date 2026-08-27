import React, { useState, useEffect } from 'react';
import {
  Wheat,
  Sparkles,
  ArrowRight,
  History,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sprout,
  Droplets,
  Thermometer,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';
import { CropRecommendation, PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface CropRecommendationPageProps {
  setCurrentPage?: (page: PageId) => void;
}

const REGIONAL_PRESETS = [
  {
    name: 'Coimbatore - Maize & Millets',
    data: { n: 110, p: 45, k: 35, temp: 29, hum: 65, rain: 750, ph: 6.8, soilType: 'Loam Soil', location: 'Coimbatore, Tamil Nadu' }
  },
  {
    name: 'Thanjavur Delta - Paddy (Rice)',
    data: { n: 85, p: 48, k: 40, temp: 26, hum: 82, rain: 1150, ph: 6.2, soilType: 'Clayey Alluvial Soil', location: 'Thanjavur, Tamil Nadu' }
  },
  {
    name: 'Erode - Turmeric & Sugarcane',
    data: { n: 130, p: 60, k: 80, temp: 31, hum: 70, rain: 880, ph: 7.0, soilType: 'Red Loam Soil', location: 'Erode, Tamil Nadu' }
  },
  {
    name: 'Deccan - Cotton & Groundnut',
    data: { n: 120, p: 40, k: 25, temp: 32, hum: 55, rain: 600, ph: 7.4, soilType: 'Black Cotton Soil', location: 'Rajkot, Gujarat' }
  }
];

export const CropRecommendationPage: React.FC<CropRecommendationPageProps> = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [nitrogen, setNitrogen] = useState<number>(110);
  const [phosphorus, setPhosphorus] = useState<number>(45);
  const [potassium, setPotassium] = useState<number>(35);
  const [temperature, setTemperature] = useState<number>(29);
  const [humidity, setHumidity] = useState<number>(65);
  const [rainfall, setRainfall] = useState<number>(750);
  const [soilPh, setSoilPh] = useState<number>(6.8);
  const [soilType, setSoilType] = useState<string>('Loam Soil');
  const [location, setLocation] = useState<string>(user?.district ? `${user.district}, ${user.state || 'Tamil Nadu'}` : 'Coimbatore Agro Zone');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CropRecommendation | null>(null);
  const [history, setHistory] = useState<CropRecommendation[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const data = await api.getCropHistory();
      setHistory(data);
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleApplyPreset = (preset: typeof REGIONAL_PRESETS[0]) => {
    setNitrogen(preset.data.n);
    setPhosphorus(preset.data.p);
    setPotassium(preset.data.k);
    setTemperature(preset.data.temp);
    setHumidity(preset.data.hum);
    setRainfall(preset.data.rain);
    setSoilPh(preset.data.ph);
    setSoilType(preset.data.soilType);
    setLocation(preset.data.location);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const rec = await api.recommendCrop({
        nitrogen,
        phosphorus,
        potassium,
        temperature,
        humidity,
        rainfall,
        soilPh,
        soilType,
        location
      });
      setResult(rec);
      if (user) fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Crop recommendation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="crop-recommendation-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <Wheat className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ta' ? 'நுண்ணறிவு வேளாண்மை' : 'AI Agronomic Advisor'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {t.crop.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.crop.subtitle}
          </p>
        </div>

        {user && (
          <button
            id="btn-toggle-crop-history"
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <History className="w-4 h-4 text-emerald-700" />
            <span>{showHistory ? 'Hide History' : `History (${history.length})`}</span>
          </button>
        )}
      </div>

      {/* Preset Quick Fill Bar */}
      <div className="bg-stone-100/80 p-3 rounded-2xl border border-stone-200/80">
        <span className="text-xs font-bold text-stone-600 block mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'ta' ? 'பிரபல வட்டார மாதிரி மதிப்புகள்:' : 'Quick Regional Presets for Instant Simulation:'}</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REGIONAL_PRESETS.map((p, idx) => (
            <button
              key={idx}
              id={`btn-crop-preset-${idx}`}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-bold text-stone-800 shadow-xs transition-all truncate"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form + Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'மண் ஊட்டச்சத்து & காலநிலை தரவுகள்' : 'Soil Nutrients & Agro-Climate Parameters'}</span>
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* N-P-K Row */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700">NPK Soil Nutrients (kg / hectare)</span>
                <span className="text-[10px] text-stone-400">Nitrogen / Phosphorus / Potassium</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Nitrogen */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 focus-within:border-emerald-500">
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {t.crop.nLabel}
                  </label>
                  <input
                    id="input-crop-n"
                    type="number"
                    min="0"
                    max="300"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(Number(e.target.value))}
                    required
                    className="w-full text-base font-black text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>

                {/* Phosphorus */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 focus-within:border-emerald-500">
                  <label className="block text-[11px] font-bold text-teal-800 mb-1">
                    {t.crop.pLabel}
                  </label>
                  <input
                    id="input-crop-p"
                    type="number"
                    min="0"
                    max="200"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(Number(e.target.value))}
                    required
                    className="w-full text-base font-black text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>

                {/* Potassium */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 focus-within:border-emerald-500">
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">
                    {t.crop.kLabel}
                  </label>
                  <input
                    id="input-crop-k"
                    type="number"
                    min="0"
                    max="200"
                    value={potassium}
                    onChange={(e) => setPotassium(Number(e.target.value))}
                    required
                    className="w-full text-base font-black text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Climate & Weather Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Temperature */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-500" />
                  <span>{t.crop.tempLabel}</span>
                </label>
                <input
                  id="input-crop-temp"
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  required
                  className="w-full text-sm font-bold text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>

              {/* Humidity */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <span>{t.crop.humidityLabel}</span>
                </label>
                <input
                  id="input-crop-humidity"
                  type="number"
                  min="10"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  required
                  className="w-full text-sm font-bold text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>

              {/* Rainfall */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.crop.rainfallLabel}
                </label>
                <input
                  id="input-crop-rainfall"
                  type="number"
                  min="0"
                  max="3000"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  required
                  className="w-full text-sm font-bold text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>
            </div>

            {/* Soil Type, pH & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Soil Type */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.crop.soilTypeLabel}
                </label>
                <select
                  id="select-crop-soil-type"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Loam Soil">Loam Soil</option>
                  <option value="Clayey Alluvial Soil">Clayey Alluvial Soil</option>
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Red Loam Soil">Red Loam Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>

              {/* Soil pH */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.crop.phLabel}
                </label>
                <input
                  id="input-crop-ph"
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="10.0"
                  value={soilPh}
                  onChange={(e) => setSoilPh(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.crop.locationLabel}
                </label>
                <input
                  id="input-crop-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Coimbatore, Tamil Nadu"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              id="btn-submit-crop-recommendation"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-800/20 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <span>{language === 'ta' ? 'AI மாதிரி பகுப்பாய்வு செய்கிறது...' : 'Analyzing Agro-Climate parameters with AI...'}</span>
              ) : (
                <>
                  <Sprout className="w-5 h-5" />
                  <span>{t.crop.btnSubmit}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-5">
          {result ? (
            <div id="crop-recommendation-result" className="bg-white rounded-3xl border border-emerald-300 shadow-md p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Wheat className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-900">{t.crop.recommended}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    result.isDemo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {result.isDemo ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {result.isDemo ? 'Knowledge Base Fallback' : 'Gemini AI Verified'}
                </span>
              </div>

              {/* Main Crop Hero */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white">
                <p className="text-[11px] text-emerald-300 font-semibold">{t.crop.recommended}</p>
                <h3 className="text-2xl font-black tracking-tight mt-0.5">{result.recommendedCrop}</h3>

                <div className="mt-3 flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-xs font-bold">
                    {result.confidence}% Match Confidence
                  </div>
                  <span className="text-[11px] text-emerald-200">{result.soilType}</span>
                </div>
              </div>

              {/* Why Suitable Explanation */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 mb-1">{t.crop.whySuitable}</h4>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                  {result.explanation}
                </p>
              </div>

              {/* Secondary Alternatives */}
              {result.secondaryCrops && result.secondaryCrops.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-900 mb-1.5">{t.crop.secondaryCrops}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.secondaryCrops.map((c, i) => (
                      <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Guidance Checklist */}
              {result.guidance && result.guidance.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-900 mb-2">{t.crop.guidance}</h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {result.guidance.map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Wheat className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">No recommendation computed yet</h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Enter your soil test parameters on the left and click "Get AI Crop Recommendation" or pick a regional preset.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Recommendations Log */}
      {showHistory && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <span>Your Previous Crop Recommendation Log</span>
          </h3>

          <div className="divide-y divide-stone-100">
            {history.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">No previous recommendations found.</p>
            ) : (
              history.map(item => (
                <div key={item._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-stone-900">{item.recommendedCrop}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {item.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      NPK: {item.nitrogen}-{item.phosphorus}-{item.potassium} | Soil: {item.soilType} | pH: {item.soilPh}
                    </p>
                  </div>
                  <button
                    onClick={() => setResult(item)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 self-start sm:self-auto"
                  >
                    View Details →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
