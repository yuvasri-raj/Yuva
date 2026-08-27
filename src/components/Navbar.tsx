import React, { useState } from 'react';
import {
  Sprout,
  Globe,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { PageId } from '../types.js';
import { NotificationPanel } from './NotificationPanel.js';

interface NavbarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  toggleSidebar,
  isSidebarOpen
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header id="app-navbar" className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-sidebar"
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              id="btn-brand-home"
              onClick={() => setCurrentPage(user ? 'dashboard' : 'landing')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-400 flex items-center justify-center text-emerald-950 font-black shadow-xs group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-800 block leading-tight">
                  Agro Vision
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block leading-none">
                  {language === 'ta' ? 'நுண்ணறிவு வேளாண் தளம்' : 'Smart Agriculture AI'}
                </span>
              </div>
            </button>
          </div>

          {/* Center: Sleek Quick Advisory Pill (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200/70 text-slate-700 text-xs font-semibold">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kisan Support: <strong className="font-bold text-slate-900">1800-180-1551</strong> (24x7 Toll Free)</span>
          </div>

          {/* Right Controls: Language, Notifications, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                id="btn-lang-en"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                id="btn-lang-ta"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'ta'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Notifications Button */}
            {user && (
              <div className="relative">
                <button
                  id="btn-notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationPanel
                    onClose={() => setShowNotifications(false)}
                    setCurrentPage={setCurrentPage}
                  />
                )}
              </div>
            )}

            {/* User Dropdown / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-dropdown"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 focus:outline-hidden transition-colors"
                >
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover border border-emerald-600/30"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold capitalize">{user.role}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          <ShieldAlert className="w-3 h-3" /> System Admin
                        </span>
                      )}
                    </div>

                    <button
                      id="menu-btn-profile"
                      onClick={() => {
                        setCurrentPage('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      {t.nav.profile}
                    </button>

                    {user.role === 'admin' && (
                      <button
                        id="menu-btn-admin"
                        onClick={() => {
                          setCurrentPage('admin-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-600" />
                        {t.nav.adminDashboard}
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        id="menu-btn-logout"
                        onClick={() => {
                          logout();
                          setCurrentPage('landing');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        {t.nav.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-login"
                  onClick={() => setCurrentPage('login')}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {t.nav.login}
                </button>
                <button
                  id="btn-nav-register"
                  onClick={() => setCurrentPage('register')}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors"
                >
                  {t.nav.register}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
