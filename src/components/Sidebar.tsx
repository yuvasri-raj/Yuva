import React from 'react';
import {
  LayoutDashboard,
  Wheat,
  ScanLine,
  FlaskConical,
  TrendingUp,
  Calculator,
  Landmark,
  Users,
  BotMessageSquare,
  UserCircle,
  Settings,
  ShieldAlert,
  Code2,
  PhoneCall
} from 'lucide-react';
import { PageId } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface SidebarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const navItems: Array<{ id: PageId; label: string; icon: React.ReactNode; badge?: string; role?: string }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'crop-recommendation', label: t.nav.cropRecommendation, icon: <Wheat className="w-4 h-4" />, badge: 'AI' },
    { id: 'disease-detection', label: t.nav.diseaseDetection, icon: <ScanLine className="w-4 h-4" />, badge: 'Vision' },
    { id: 'soil-health', label: t.nav.soilHealth, icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'market-prices', label: t.nav.marketPrices, icon: <TrendingUp className="w-4 h-4" />, badge: 'APMC' },
    { id: 'profit-calculator', label: t.nav.profitCalculator, icon: <Calculator className="w-4 h-4" /> },
    { id: 'government-schemes', label: t.nav.governmentSchemes, icon: <Landmark className="w-4 h-4" /> },
    { id: 'farmer-community', label: t.nav.community, icon: <Users className="w-4 h-4" /> },
    { id: 'ai-chatbot', label: t.nav.aiChatbot, icon: <BotMessageSquare className="w-4 h-4" />, badge: 'Live' },
    { id: 'profile', label: t.nav.profile, icon: <UserCircle className="w-4 h-4" /> },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-4 h-4" /> },
    { id: 'api-docs', label: t.nav.apiDocs, icon: <Code2 className="w-4 h-4" /> }
  ];

  if (user?.role === 'admin') {
    navItems.push({
      id: 'admin-dashboard',
      label: t.nav.adminDashboard,
      icon: <ShieldAlert className="w-4 h-4 text-purple-600" />,
      badge: 'Admin'
    });
  }

  const handleNavClick = (pageId: PageId) => {
    setCurrentPage(pageId);
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-16 bottom-0 left-0 w-64 bg-emerald-950 text-slate-100 border-r border-emerald-900/50 z-40 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
            {language === 'ta' ? 'வேளாண் சேவைகள்' : 'Smart Agri Services'}
          </div>

          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-100/60 hover:text-white hover:bg-emerald-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-emerald-300' : 'text-emerald-400/60'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Admin'
                        ? 'bg-purple-900/80 text-purple-200 border border-purple-700/50'
                        : 'bg-emerald-900 text-emerald-300 border border-emerald-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Farmer Support / Profile Card */}
        <div className="p-4 space-y-3">
          {user ? (
            <div className="bg-emerald-900/50 rounded-2xl p-3.5 border border-emerald-900/60 text-white">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 bg-emerald-400 text-emerald-950 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">{user.name}</p>
                  <p className="text-[10px] text-emerald-300 truncate">
                    {user.farmLocation || user.district || 'Smart Farmer'}
                  </p>
                </div>
              </div>
              <button
                id="sidebar-btn-view-profile"
                onClick={() => handleNavClick('profile')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold py-1.5 rounded-lg transition-all text-center block"
              >
                {language === 'ta' ? 'சுயவிவரம்' : 'View Profile'}
              </button>
            </div>
          ) : (
            <div className="bg-emerald-900/50 rounded-2xl p-3.5 border border-emerald-900/60 text-white">
              <p className="text-xs font-bold text-white mb-1">
                {language === 'ta' ? 'உடனடி ஆதரவு' : 'Kisan Helpline'}
              </p>
              <p className="text-[10px] text-emerald-200 leading-tight mb-2">
                {language === 'ta' ? 'இலவச உதவி எண்: 1800-180-1551' : 'Free 24x7 farmer advisory line'}
              </p>
              <a
                href="tel:18001801551"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold py-1.5 rounded-lg transition-all text-center block"
              >
                1800-180-1551
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
