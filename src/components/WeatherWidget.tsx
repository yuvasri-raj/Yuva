import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Compass,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { WeatherInfo } from '../types.js';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.js';

interface WeatherWidgetProps {
  initialLocation?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ initialLocation = 'Coimbatore, Tamil Nadu' }) => {
  const { language } = useLanguage();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoc, setSearchLoc] = useState<string>(initialLocation);
  const [activeLoc, setActiveLoc] = useState<string>(initialLocation);

  const fetchWeather = async (loc: string) => {
    try {
      setLoading(true);
      const data = await api.getWeather(loc);
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(activeLoc);
  }, [activeLoc]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLoc.trim()) {
      setActiveLoc(searchLoc.trim());
    }
  };

  if (loading && !weather) {
    return (
      <div id="weather-widget-loading" className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 flex items-center justify-center min-h-[160px]">
        <div className="flex items-center gap-3 text-emerald-800 text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>{language === 'ta' ? 'வானிலை தகவல்கள் ஏற்றப்படுகின்றன...' : 'Loading Agro-Weather data...'}</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div id="weather-widget" className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight">
              {language === 'ta' ? 'வேளாண் வானிலை வழிகாட்டி' : 'Agro-Meteorological Advisory'}
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                weather.isLive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {weather.isLive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {weather.isLive ? (language === 'ta' ? 'நேரலை API' : 'Live API') : (language === 'ta' ? 'வட்டார மாதிரி' : 'Agro Forecast')}
            </span>
          </div>
          <p className="text-xs text-emerald-200/80 mt-0.5 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            <span>{weather.location}</span>
          </p>
        </div>

        {/* Quick Location Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchLoc}
              onChange={(e) => setSearchLoc(e.target.value)}
              placeholder={language === 'ta' ? 'ஊர் / மாவட்டம்...' : 'District / Town...'}
              className="bg-white/10 text-white placeholder-emerald-200/60 text-xs px-3 py-1.5 rounded-xl border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 w-36 sm:w-48 transition-all"
            />
          </div>
          <button
            type="submit"
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs"
            title="Search weather for location"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Main Body */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Current Temp */}
          <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
              <Sun className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 leading-none">
                {weather.temperature}°C
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">{weather.condition}</p>
              <p className="text-[11px] text-slate-400">Feels like {weather.feelsLike}°C</p>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">{language === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}</p>
              <p className="text-sm font-bold text-slate-800">{weather.humidity}%</p>
            </div>
          </div>

          {/* Rainfall */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">{language === 'ta' ? 'மழைப்பொழிவு' : 'Rainfall'}</p>
              <p className="text-sm font-bold text-slate-800">{weather.rainfall} mm</p>
            </div>
          </div>

          {/* Wind */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">{language === 'ta' ? 'காற்று வேகம்' : 'Wind Speed'}</p>
              <p className="text-sm font-bold text-slate-800">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        {/* Agronomic Advisory Note */}
        <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-3">
          <Droplets className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-950 font-medium leading-relaxed">
            <strong className="text-emerald-900 font-bold">{language === 'ta' ? 'பண்ணை ஆலோசனை: ' : 'Field Advisory: '}</strong>
            {weather.advisory}
          </p>
        </div>

        {/* 5-Day Forecast Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700 mb-3">
            {language === 'ta' ? '5 நாள் வானிலை முன்னறிவிப்பு' : '5-Day Agro Forecast'}
          </p>
          <div className="grid grid-cols-5 gap-2.5 text-center">
            {weather.forecast.map((fc, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-600 truncate">{fc.day}</p>
                <p className="text-xs font-black text-slate-800 mt-1">{fc.tempMax}° / {fc.tempMin}°</p>
                <p className="text-[10px] text-emerald-600 font-semibold truncate mt-0.5">{fc.condition}</p>
                <p className="text-[9px] text-blue-600 font-medium mt-0.5">{fc.rainChance}% rain</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
