import React from 'react';
import { FileCode, Database, Cpu, ShieldCheck, Key, Terminal, ExternalLink } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/register',
      desc: 'Register a new farmer account',
      payload: '{ name, email, password, phone, state, district, location, preferredLanguage }'
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      desc: 'Authenticate user & receive signed JWT bearer token',
      payload: '{ email, password }'
    },
    {
      method: 'POST',
      path: '/api/crops/recommend',
      desc: 'AI Crop Recommendation Engine using soil nutrients and climate',
      payload: '{ nitrogen, phosphorus, potassium, temperature, humidity, rainfall, soilPh, soilType, location }'
    },
    {
      method: 'POST',
      path: '/api/disease/detect',
      desc: 'AI Vision Plant Pathology scanner for leaf disease identification',
      payload: '{ image (Base64), mimeType, cropName? }'
    },
    {
      method: 'POST',
      path: '/api/soil/analyze',
      desc: 'Soil fertility index computation (0-100) & fertilizer scheduling',
      payload: '{ nitrogen, phosphorus, potassium, ph, moisture, organicMatter, soilType }'
    },
    {
      method: 'GET',
      path: '/api/market/prices',
      desc: 'Query APMC mandi commodity prices, MSP support rates, and 7-day trends',
      payload: 'Query params: search, crop, state, page, limit'
    },
    {
      method: 'POST',
      path: '/api/profit/calculate',
      desc: 'Farm economic simulation, net margins, ROI %, and break-even points',
      payload: '{ cropName, landArea, seedsCost, fertilizersCost, labourCost, expectedYield, expectedPrice }'
    },
    {
      method: 'GET',
      path: '/api/schemes',
      desc: 'Central and state government agricultural subsidy catalog',
      payload: 'Query params: category, state, search'
    },
    {
      method: 'POST',
      path: '/api/chat/message',
      desc: 'Agro Vision AI Bilingual Assistant (Gemini API + Agronomy Fallback)',
      payload: '{ message, language: "en" | "ta", history: [] }'
    },
    {
      method: 'GET',
      path: '/api/weather/current',
      desc: 'Real-time agro-meteorological advisory and 5-day microclimate forecast',
      payload: 'Query params: location'
    }
  ];

  return (
    <div id="api-docs-root" className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
          <FileCode className="w-3.5 h-3.5 text-emerald-700" />
          <span>Developer & Platform Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Agro Vision Full-Stack REST API & Engine Specs
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          The Agro Vision platform runs a modular Express.js + React.js architecture designed with model-agnostic AI adapters, automated offline agronomy fallbacks, and JWT-authenticated endpoints.
        </p>

        {/* Key Architectural Highlights */}
        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <Cpu className="w-4 h-4 text-emerald-700 mb-1.5" />
            <h4 className="text-xs font-bold text-stone-900">Zero-Crash Fallbacks</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              If GEMINI_API_KEY is not present, all models seamlessly route through official agronomy rule engines.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <ShieldCheck className="w-4 h-4 text-purple-700 mb-1.5" />
            <h4 className="text-xs font-bold text-stone-900">JWT & bcrypt Protection</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Salted password hashing and token-based session persistence for farmer privacy.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <Database className="w-4 h-4 text-blue-700 mb-1.5" />
            <h4 className="text-xs font-bold text-stone-900">Live JSON Datastore</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Persistent local document datastore mimicking Mongoose collections with atomic writes.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-700" />
          <span>Core REST API Endpoints</span>
        </h3>

        <div className="divide-y divide-stone-100">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="py-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {ep.method}
                </span>
                <code className="text-xs font-bold text-stone-900">{ep.path}</code>
              </div>
              <p className="text-xs text-stone-600">{ep.desc}</p>
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-[11px] font-mono text-stone-600">
                {ep.payload}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
