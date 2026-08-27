import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Plus,
  Edit2,
  Calendar,
  MapPin,
  Landmark,
  Eye
} from 'lucide-react';
import { MarketPrice, PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.js';

interface MarketPricesPageProps {
  setCurrentPage?: (page: PageId) => void;
}

export const MarketPricesPage: React.FC<MarketPricesPageProps> = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCommodity, setSelectedCommodity] = useState<MarketPrice | null>(null);

  // Admin update modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingPrice, setEditingPrice] = useState<Partial<MarketPrice>>({});

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await api.getMarketPrices({
        search: search || undefined,
        state: selectedState !== 'All' ? selectedState : undefined
      });
      setPrices(res.data || []);
    } catch (err) {
      console.warn('Market prices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedState]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrices();
  };

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPrice._id) {
        await api.updateMarketPrice(editingPrice._id, editingPrice);
      } else {
        await api.createMarketPrice(editingPrice);
      }
      setIsEditModalOpen(false);
      fetchPrices();
    } catch (err: any) {
      alert(err.message || 'Failed to save market price.');
    }
  };

  // Mini Trend SVG Renderer
  const renderTrendSVG = (trend: { date: string; price: number }[]) => {
    if (!trend || trend.length < 2) return null;
    const values = trend.map(t => t.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const height = 32;
    const width = 100;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    }).join(' ');

    const isUp = values[values.length - 1] >= values[0];

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={isUp ? '#10b981' : '#f43f5e'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div id="market-prices-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ta' ? 'அகில இந்திய APMC மண்டி நேரலை' : 'All-India APMC Mandi Live Feed'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {t.market.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.market.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <button
              id="btn-admin-add-price"
              onClick={() => {
                setEditingPrice({
                  cropName: '',
                  marketName: 'Coimbatore Mandi',
                  state: 'Tamil Nadu',
                  price: 3000,
                  msp: 2500,
                  trendDirection: 'up',
                  changePercentage: 2.5
                });
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rate</span>
            </button>
          )}

          <button
            id="btn-refresh-market-prices"
            onClick={fetchPrices}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'ta' ? 'புதுப்பிக்க' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              id="input-market-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ta' ? 'பயிர் அல்லது மண்டி தேடுக...' : 'Search crop (Paddy, Maize, Turmeric) or Mandi...'}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0"
          >
            Search
          </button>
        </form>

        {/* State Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', 'Tamil Nadu', 'Karnataka', 'Punjab', 'Maharashtra', 'Gujarat'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedState === st
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prices Table Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">{t.market.cropHeader}</th>
                <th className="py-3.5 px-4">{t.market.mandiHeader}</th>
                <th className="py-3.5 px-4">{t.market.priceHeader}</th>
                <th className="py-3.5 px-4">{t.market.mspHeader}</th>
                <th className="py-3.5 px-4">{t.market.changeHeader}</th>
                <th className="py-3.5 px-4">{t.market.trendHeader}</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 font-medium">
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    No commodity rates found matching query.
                  </td>
                </tr>
              ) : (
                prices.map(p => (
                  <tr key={p._id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900 text-sm">{p.cropName}</div>
                      <span className="text-[10px] text-stone-400">{p.unit || 'Quintal (100 kg)'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">{p.marketName}</div>
                      <span className="text-[10px] text-emerald-700">{p.district || p.state}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-sm font-black text-emerald-950">
                        ₹{p.price.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-stone-400">Modal Rate</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-stone-700">
                        ₹{p.msp ? p.msp.toLocaleString() : 'N/A'}
                      </div>
                      {p.msp && p.price >= p.msp ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                          +₹{p.price - p.msp} above MSP
                        </span>
                      ) : p.msp ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-sm">
                          -₹{p.msp - p.price} below MSP
                        </span>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-4">
                      <div
                        className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-lg ${
                          p.trendDirection === 'up'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.trendDirection === 'down'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {p.trendDirection === 'up' ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : p.trendDirection === 'down' ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        <span>{p.changePercentage}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {renderTrendSVG(p.history7Days)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCommodity(p)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-600 transition-colors"
                          title="View 7-day trading range"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {user?.role === 'admin' && (
                          <button
                            onClick={() => {
                              setEditingPrice(p);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                            title="Edit rate"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commodity Details Modal */}
      {selectedCommodity && (
        <Modal
          isOpen={!!selectedCommodity}
          onClose={() => setSelectedCommodity(null)}
          title={`${selectedCommodity.cropName} — Mandi Trading Report`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-300 font-semibold">{selectedCommodity.marketName}, {selectedCommodity.state}</p>
                <h3 className="text-2xl font-black mt-0.5">₹{selectedCommodity.price.toLocaleString()} <span className="text-xs font-normal text-emerald-200">/ {selectedCommodity.unit || 'Quintal'}</span></h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/20 text-white">
                  MSP: ₹{selectedCommodity.msp.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold text-stone-900">7-Day APMC Daily Rate Progression</h4>
              <div className="divide-y divide-stone-200 text-xs">
                {selectedCommodity.history7Days?.map((h, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <span className="text-stone-600 font-medium">{h.date}</span>
                    <strong className="text-emerald-950 font-bold">₹{h.price.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCommodity(null)}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Edit Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={editingPrice._id ? 'Edit Mandi Commodity Price' : 'Add New Commodity Rate'}
          maxWidth="md"
        >
          <form onSubmit={handleAdminSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Crop Name</label>
              <input
                type="text"
                value={editingPrice.cropName || ''}
                onChange={(e) => setEditingPrice({ ...editingPrice, cropName: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mandi Name</label>
                <input
                  type="text"
                  value={editingPrice.marketName || ''}
                  onChange={(e) => setEditingPrice({ ...editingPrice, marketName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  value={editingPrice.state || ''}
                  onChange={(e) => setEditingPrice({ ...editingPrice, state: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editingPrice.price || 0}
                  onChange={(e) => setEditingPrice({ ...editingPrice, price: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">MSP (₹)</label>
                <input
                  type="number"
                  value={editingPrice.msp || 0}
                  onChange={(e) => setEditingPrice({ ...editingPrice, msp: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
              >
                Save Rate
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
