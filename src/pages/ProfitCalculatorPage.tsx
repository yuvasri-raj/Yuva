import React, { useState } from 'react';
import {
  Calculator,
  Sparkles,
  TrendingUp,
  ArrowRight,
  PieChart as PieIcon,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Percent,
  Layers,
  Scale
} from 'lucide-react';
import { ProfitCalculation, PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';

interface ProfitCalculatorPageProps {
  setCurrentPage?: (page: PageId) => void;
}

const CROP_TEMPLATES = [
  {
    name: 'Paddy / Rice (1 Acre)',
    crop: 'Paddy (Rice)',
    area: 1,
    seeds: 2500,
    fertilizers: 4500,
    pesticides: 2800,
    labour: 12000,
    irrigation: 3000,
    machinery: 5000,
    misc: 1500,
    yield: 26,
    price: 2300
  },
  {
    name: 'Maize / Corn (2 Acres)',
    crop: 'Hybrid Maize',
    area: 2,
    seeds: 4000,
    fertilizers: 7000,
    pesticides: 3500,
    labour: 14000,
    irrigation: 4000,
    machinery: 8000,
    misc: 2000,
    yield: 60,
    price: 2250
  },
  {
    name: 'Turmeric (1 Acre)',
    crop: 'Turmeric (Erode Local)',
    area: 1,
    seeds: 18000,
    fertilizers: 12000,
    pesticides: 6000,
    labour: 25000,
    irrigation: 6000,
    machinery: 10000,
    misc: 5000,
    yield: 25,
    price: 13500
  },
  {
    name: 'Tomato (1 Acre)',
    crop: 'Tomato (Hybrid)',
    area: 1,
    seeds: 6000,
    fertilizers: 10000,
    pesticides: 8000,
    labour: 22000,
    irrigation: 5000,
    machinery: 6000,
    misc: 3000,
    yield: 180,
    price: 900
  }
];

export const ProfitCalculatorPage: React.FC<ProfitCalculatorPageProps> = () => {
  const { t, language } = useLanguage();

  const [cropName, setCropName] = useState<string>('Paddy (Rice)');
  const [landArea, setLandArea] = useState<number>(1);
  const [seedsCost, setSeedsCost] = useState<number>(2500);
  const [fertilizersCost, setFertilizersCost] = useState<number>(4500);
  const [pesticidesCost, setPesticidesCost] = useState<number>(2800);
  const [labourCost, setLabourCost] = useState<number>(12000);
  const [irrigationCost, setIrrigationCost] = useState<number>(3000);
  const [machineryCost, setMachineryCost] = useState<number>(5000);
  const [miscellaneousCost, setMiscellaneousCost] = useState<number>(1500);

  const [expectedYield, setExpectedYield] = useState<number>(26); // Quintals
  const [expectedPrice, setExpectedPrice] = useState<number>(2300); // ₹ per Quintal

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProfitCalculation | null>(null);

  const handleApplyTemplate = (tpl: typeof CROP_TEMPLATES[0]) => {
    setCropName(tpl.crop);
    setLandArea(tpl.area);
    setSeedsCost(tpl.seeds);
    setFertilizersCost(tpl.fertilizers);
    setPesticidesCost(tpl.pesticides);
    setLabourCost(tpl.labour);
    setIrrigationCost(tpl.irrigation);
    setMachineryCost(tpl.machinery);
    setMiscellaneousCost(tpl.misc);
    setExpectedYield(tpl.yield);
    setExpectedPrice(tpl.price);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.calculateProfit({
        cropName,
        landArea,
        seedsCost,
        fertilizersCost,
        pesticidesCost,
        labourCost,
        irrigationCost,
        machineryCost,
        miscellaneousCost,
        expectedYield,
        expectedPrice
      });
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="profit-calculator-root" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
          <Calculator className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === 'ta' ? 'பண்ணை பொருளியல் கணக்கீடு' : 'Farm Economics & ROI Engine'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
          {t.profit.title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          {t.profit.subtitle}
        </p>
      </div>

      {/* Preset Quick Fill Bar */}
      <div className="bg-stone-100/80 p-3 rounded-2xl border border-stone-200/80">
        <span className="text-xs font-bold text-stone-600 block mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'ta' ? 'மாதிரி பயிர் செலவு வார்ப்புருக்கள்:' : 'Pre-configured Crop Cost Sheets:'}</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CROP_TEMPLATES.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-bold text-stone-800 shadow-xs transition-all truncate"
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Farm Inputs & Production Costs</span>
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.profit.cropName}
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.profit.landArea}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={landArea}
                  onChange={(e) => setLandArea(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Cost Breakdown Inputs */}
            <div>
              <span className="text-xs font-bold text-stone-700 block mb-2">Cost Categories (₹)</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.profit.seeds}</label>
                  <input
                    type="number"
                    value={seedsCost}
                    onChange={(e) => setSeedsCost(Number(e.target.value))}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.profit.fertilizers}</label>
                  <input
                    type="number"
                    value={fertilizersCost}
                    onChange={(e) => setFertilizersCost(Number(e.target.value))}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.profit.pesticides}</label>
                  <input
                    type="number"
                    value={pesticidesCost}
                    onChange={(e) => setPesticidesCost(Number(e.target.value))}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.profit.labour}</label>
                  <input
                    type="number"
                    value={labourCost}
                    onChange={(e) => setLabourCost(Number(e.target.value))}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.profit.irrigation}</label>
                  <input
                    type="number"
                    value={irrigationCost}
                    onChange={(e) => setIrrigationCost(Number(e.target.value))}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.profit.machinery}</label>
                  <input
                    type="number"
                    value={machineryCost}
                    onChange={(e) => setMachineryCost(Number(e.target.value))}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Yield & Price Projections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.profit.yield}
                </label>
                <input
                  type="number"
                  value={expectedYield}
                  onChange={(e) => setExpectedYield(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.profit.marketPrice}
                </label>
                <input
                  type="number"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            <button
              id="btn-calculate-profit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-800/20 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <span>{t.common.loading}</span>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>{t.profit.calculateBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Profit Projection Report */}
        <div className="lg:col-span-5">
          {result ? (
            <div id="profit-calculation-result" className="bg-white rounded-3xl border border-emerald-300 shadow-md p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-950">Economic Forecast</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {result.cropName} ({result.landArea} Acre)
                </span>
              </div>

              {/* Net Profit Banner */}
              <div className={`p-5 rounded-2xl text-white ${result.netProfit >= 0 ? 'bg-gradient-to-r from-emerald-900 to-teal-950' : 'bg-gradient-to-r from-rose-900 to-red-950'}`}>
                <p className="text-xs text-emerald-200 font-semibold">{t.profit.netProfit}</p>
                <h3 className="text-3xl font-black mt-0.5">
                  ₹{result.netProfit.toLocaleString()}
                </h3>

                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="bg-white/20 px-2.5 py-1 rounded-lg font-bold">
                    ROI: {result.roi}%
                  </span>
                  <span className="text-emerald-200">
                    Margin: {result.profitMargin}%
                  </span>
                </div>
              </div>

              {/* Breakdown Figures */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">{t.profit.totalCost}</span>
                  <strong className="text-stone-900 text-sm">₹{result.totalCost.toLocaleString()}</strong>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">{t.profit.totalRevenue}</span>
                  <strong className="text-emerald-950 text-sm">₹{result.totalRevenue.toLocaleString()}</strong>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">{t.profit.breakEvenPrice}</span>
                  <strong className="text-stone-900 text-sm">₹{result.breakEvenPrice.toLocaleString()} /qtl</strong>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">{t.profit.breakEvenYield}</span>
                  <strong className="text-stone-900 text-sm">{result.breakEvenYield} Quintals</strong>
                </div>
              </div>

              {/* Cost Category Percentages */}
              {result.costBreakdown && Object.keys(result.costBreakdown).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-900 mb-2">Expense Distribution (%)</h4>
                  <div className="space-y-1.5 text-xs text-stone-600">
                    {Object.entries(result.costBreakdown).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="capitalize">{k.replace('Cost', '')}</span>
                        <span className="font-bold text-stone-900">₹{Number(v).toLocaleString()} ({Math.round((Number(v) / (result.totalCost || 1)) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">No calculation run yet</h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Enter your input costs and expected crop yield on the left to evaluate projected net margin and break-even targets.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
