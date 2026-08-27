import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Sparkles,
  History,
  CheckCircle2,
  AlertCircle,
  Droplets,
  Activity,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { SoilReport, PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { HealthMeter } from '../components/HealthMeter.js';

interface SoilHealthPageProps {
  setCurrentPage?: (page: PageId) => void;
}

export const SoilHealthPage: React.FC<SoilHealthPageProps> = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [nitrogen, setNitrogen] = useState<number>(140);
  const [phosphorus, setPhosphorus] = useState<number>(38);
  const [potassium, setPotassium] = useState<number>(160);
  const [ph, setPh] = useState<number>(6.8);
  const [moisture, setMoisture] = useState<number>(55);
  const [organicMatter, setOrganicMatter] = useState<number>(0.92);
  const [soilType, setSoilType] = useState<string>('Loam Soil');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SoilReport | null>(null);
  const [history, setHistory] = useState<SoilReport[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const data = await api.getSoilHistory();
      setHistory(data);
    } catch (err) {
      console.warn('Failed to load soil history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.analyzeSoil({
        nitrogen,
        phosphorus,
        potassium,
        ph,
        moisture,
        organicMatter,
        soilType
      });
      setResult(res);
      if (user) fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Soil analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="soil-health-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ta' ? 'மண் பரிசோதனை & உரம் மேலாண்மை' : 'Soil Testing & Fertility Index'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {t.soil.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.soil.subtitle}
          </p>
        </div>

        {user && (
          <button
            id="btn-toggle-soil-history"
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <History className="w-4 h-4 text-emerald-700" />
            <span>{showHistory ? 'Hide History' : `History (${history.length})`}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Inputs + Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'மண் மாதிரியின் அளவீடுகள்' : 'Soil Laboratory Sample Parameters'}</span>
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* NPK Inputs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">Nitrogen (kg/ha)</label>
                <input
                  id="input-soil-n"
                  type="number"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(Number(e.target.value))}
                  required
                  className="w-full text-base font-black text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-teal-800 mb-1">Phosphorus (kg/ha)</label>
                <input
                  id="input-soil-p"
                  type="number"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(Number(e.target.value))}
                  required
                  className="w-full text-base font-black text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-amber-800 mb-1">Potassium (kg/ha)</label>
                <input
                  id="input-soil-k"
                  type="number"
                  value={potassium}
                  onChange={(e) => setPotassium(Number(e.target.value))}
                  required
                  className="w-full text-base font-black text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>
            </div>

            {/* pH, Moisture, Organic Matter */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Soil pH (1-14)</label>
                <input
                  id="input-soil-ph"
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="10.0"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  required
                  className="w-full text-sm font-bold text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Moisture (%)</label>
                <input
                  id="input-soil-moisture"
                  type="number"
                  min="0"
                  max="100"
                  value={moisture}
                  onChange={(e) => setMoisture(Number(e.target.value))}
                  required
                  className="w-full text-sm font-bold text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Organic Carbon %</label>
                <input
                  id="input-soil-oc"
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  value={organicMatter}
                  onChange={(e) => setOrganicMatter(Number(e.target.value))}
                  required
                  className="w-full text-sm font-bold text-stone-900 bg-transparent focus:outline-hidden"
                />
              </div>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.soil.soilType}
              </label>
              <select
                id="select-soil-type"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Loam Soil">Loam Soil (வண்டல் மண்)</option>
                <option value="Clayey Soil">Clayey Soil (களிமண்)</option>
                <option value="Black Cotton Soil">Black Cotton Soil (கரிசல் மண்)</option>
                <option value="Red Loam Soil">Red Loam Soil (செம்மண்)</option>
                <option value="Sandy Loam">Sandy Loam (மணல் வண்டல் மண்)</option>
              </select>
            </div>

            <button
              id="btn-submit-soil-analysis"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-800/20 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <span>{t.common.loading}</span>
              ) : (
                <>
                  <FlaskConical className="w-5 h-5" />
                  <span>{t.soil.analyzeBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Soil Health Index Report Column */}
        <div className="lg:col-span-6">
          {result ? (
            <div id="soil-analysis-result" className="bg-white rounded-3xl border border-emerald-300 shadow-md p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-950">Soil Health Report</span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {result.soilType}
                </span>
              </div>

              {/* Meter Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-300 font-semibold">{t.soil.scoreTitle}</p>
                  <h3 className="text-3xl font-black mt-0.5">{result.healthScore} <span className="text-sm font-normal text-emerald-200">/ 100</span></h3>
                  <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/20 text-white">
                    {result.rating}
                  </span>
                </div>

                <HealthMeter score={result.healthScore} size="lg" />
              </div>

              {/* Status Breakdown Pills */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 mb-2">Nutrient Assessment Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">Nitrogen</span>
                    <strong className="text-emerald-900">{result.nutrientStatus.nitrogenStatus}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">Phosphorus</span>
                    <strong className="text-teal-900">{result.nutrientStatus.phosphorusStatus}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">Potassium</span>
                    <strong className="text-amber-900">{result.nutrientStatus.potassiumStatus}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">pH Reaction</span>
                    <strong className="text-stone-900">{result.nutrientStatus.phStatus}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">Moisture</span>
                    <strong className="text-blue-900">{result.nutrientStatus.moistureStatus}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">Organic Carbon</span>
                    <strong className="text-stone-900">{result.nutrientStatus.organicMatterStatus}</strong>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 mb-2">{t.soil.recommendations}</h4>
                <ul className="space-y-1.5 text-xs text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <FlaskConical className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">No soil test evaluated yet</h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Enter your soil test parameters on the left to generate your official Soil Health Index and custom fertilizer dosage schedule.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <span>Your Previous Soil Health Reports</span>
          </h3>

          <div className="divide-y divide-stone-100">
            {history.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">No previous soil reports found.</p>
            ) : (
              history.map(item => (
                <div key={item._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <strong className="text-xs font-bold text-stone-900">{item.soilType} — Score {item.healthScore}/100 ({item.rating})</strong>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      pH: {item.ph} | Moisture: {item.moisture}% | OC: {item.organicMatter}%
                    </p>
                  </div>
                  <button
                    onClick={() => setResult(item)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
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
