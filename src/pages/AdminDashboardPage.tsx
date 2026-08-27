import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  ScanLine,
  Wheat,
  TrendingUp,
  Landmark,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { AdminStats, PageId } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';

interface AdminDashboardPageProps {
  setCurrentPage?: (page: PageId) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [s, u] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers()
      ]);
      setStats(s);
      setUsersList(u);
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-stone-900">Administrator Access Required</h2>
        <p className="text-xs text-stone-500">
          This portal is reserved for certified agricultural department officers and system administrators. Please log in with an administrator account (e.g. <code>admin@agrovision.gov.in</code>).
        </p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(u =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.district?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div id="admin-dashboard-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
            <span>Ministry & Agronomy Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
            Platform Operations & Surveillance
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Real-time telemetry across crop recommendations, disease outbreak alerts, APMC market price feeds, and registered farming districts.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 text-purple-700 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 5 Big Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500">Farmers Registered</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.totalUsers || 0}</p>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm mt-1 inline-block">
            Active Accounts
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500">Disease Scans</span>
            <ScanLine className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.totalDiseaseScans || 0}</p>
          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-sm mt-1 inline-block">
            Vision Analyzed
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500">Crop Plans Generated</span>
            <Wheat className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.totalCropRecs || 0}</p>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm mt-1 inline-block">
            ML Predictions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500">Active Mandi Rates</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.totalMarketPrices || 0}</p>
          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm mt-1 inline-block">
            APMC Tracked
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500">Community Posts</span>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.totalPosts || 0}</p>
          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-sm mt-1 inline-block">
            Peer Threads
          </span>
        </div>
      </div>

      {/* Outbreak Surveillance & Crop Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outbreak Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Plant Pathology Outbreak Distribution</span>
            </h3>
            <span className="text-[10px] text-stone-400">Past 30 Days</span>
          </div>

          <div className="space-y-3">
            {stats?.diseaseBreakdown?.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">{d.name}</span>
                  <span className="text-stone-500 font-semibold">{d.count} occurrences ({Math.round((d.count / (stats?.totalDiseaseScans || 1)) * 100)}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${Math.min(100, (d.count / (stats?.totalDiseaseScans || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crop Recommendations Trend */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-600" />
              <span>Top Recommended Crops for Sowing</span>
            </h3>
            <span className="text-[10px] text-stone-400">Seasonal Forecast</span>
          </div>

          <div className="space-y-3">
            {stats?.cropBreakdown?.map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">{c.name}</span>
                  <span className="text-stone-500 font-semibold">{c.count} farmers advised</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, (c.count / (stats?.totalCropRecs || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-700" />
            <span>Registered Farmers & System Accounts</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search user..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 font-bold text-stone-900">{u.name}</td>
                  <td className="py-2.5 px-3 text-stone-600">{u.email}</td>
                  <td className="py-2.5 px-3 text-stone-600">{u.district ? `${u.district}, ${u.state}` : 'Tamil Nadu'}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
