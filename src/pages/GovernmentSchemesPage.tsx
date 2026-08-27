import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Search,
  ExternalLink,
  CheckCircle2,
  FileText,
  Sparkles,
  HelpCircle,
  Building,
  Plus,
  Eye
} from 'lucide-react';
import { GovernmentScheme, PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.js';

interface GovernmentSchemesPageProps {
  setCurrentPage?: (page: PageId) => void;
}

const CATEGORIES = [
  'All',
  'Direct Income Support',
  'Crop Insurance',
  'Irrigation Subsidy',
  'Farm Mechanization',
  'Organic Farming',
  'Infrastructure & Credit'
];

export const GovernmentSchemesPage: React.FC<GovernmentSchemesPageProps> = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await api.getSchemes({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search || undefined
      });
      setSchemes(res);
    } catch (err) {
      console.warn('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  return (
    <div id="government-schemes-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <Landmark className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ta' ? 'அரசு மானியங்கள் & நேரடி நிதி உதவி' : 'Direct Farmer Subsidies & Benefits'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {t.schemes.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.schemes.subtitle}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              id="input-schemes-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ta' ? 'திட்டம் அல்லது மானியம் தேடுக (PM-KISAN, சொட்டு நீர், காப்பீடு)...' : 'Search subsidies (PM-KISAN, Micro Irrigation, Solar, Tractors)...'}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-500">
            No government schemes match the selected category.
          </div>
        ) : (
          schemes.map(s => (
            <div
              key={s._id}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                    {s.category}
                  </span>
                  <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                    {s.fundingAmount}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 mb-2 leading-snug">
                  {s.schemeName}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                  {s.benefits}
                </p>

                <div className="space-y-2 border-t border-stone-100 pt-3 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{s.ministry}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{s.eligibility[0] || 'Open to all registered farmers'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedScheme(s)}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Check Eligibility</span>
                </button>

                <a
                  href={s.applicationUrl || s.officialLink || 'https://agricoop.nic.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <span>Apply Online</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <Modal
          isOpen={!!selectedScheme}
          onClose={() => setSelectedScheme(null)}
          title={selectedScheme.schemeName}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-300 font-semibold">{selectedScheme.ministry}</p>
                <h3 className="text-lg font-bold mt-0.5">{selectedScheme.fundingAmount}</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/20 text-white">
                {selectedScheme.category}
              </span>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-1">{t.schemes.benefits}</h4>
              <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200 leading-relaxed">
                {selectedScheme.benefits}
              </p>
            </div>

            {/* Eligibility */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-1.5">{t.schemes.eligibility}</h4>
              <ul className="space-y-1 text-xs text-stone-700">
                {selectedScheme.eligibility.map((e, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-1.5">{t.schemes.documents}</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedScheme.documentsRequired.map((d, idx) => (
                  <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Application Steps */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-1.5">{t.schemes.steps}</h4>
              <p className="text-xs text-stone-700 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                {selectedScheme.applicationProcess}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-100">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
              >
                Close
              </button>

              <a
                href={selectedScheme.applicationUrl || selectedScheme.officialLink || 'https://agricoop.nic.in'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <span>{t.schemes.applyNow}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
