import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  Cpu,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  CloudSun
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <div id="settings-page-root" className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <SettingsIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Platform Configuration</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900">Application Settings</h2>
          <p className="text-xs text-stone-500 mt-0.5">Manage language, integration diagnostics, and alert preferences</p>
        </div>

        {/* Language Selection Section */}
        <div className="border-t border-stone-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-700" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">Interface Language / இடைமுக மொழி</h4>
                <p className="text-[11px] text-stone-500">Choose between English and Tamil across all screens</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  language === 'ta'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>
        </div>

        {/* Integration Status & Diagnostics */}
        <div className="border-t border-stone-100 pt-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
            <Cpu className="w-4 h-4 text-emerald-700" />
            <span>AI Models & Service Integrations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Gemini Status */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">Gemini AI Models</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Crop recommendation, disease vision scanner, and Tamil chatbot are fully wired with rule-based fallback safeguards.
              </p>
            </div>

            {/* Weather Status */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">Agro-Weather API</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CloudSun className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Delivers 5-day regional precipitation, humidity, and micro-climate advisories.
              </p>
            </div>

            {/* Mandi Feed Status */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">APMC Mandi Feed</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Live
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Synced with national and regional regulated market committee price feeds.
              </p>
            </div>

            {/* Local DB */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">Persistent Storage</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Encrypted JSON
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Encrypted persistent database layer preserving user accounts, field histories, and posts.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & Audio */}
        <div className="border-t border-stone-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-emerald-700" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">Weather & Market Alerts</h4>
                <p className="text-[11px] text-stone-500">Receive in-app popups on price surges and disease advisories</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
