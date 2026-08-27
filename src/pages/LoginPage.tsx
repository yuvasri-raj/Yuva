import React, { useState } from 'react';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldAlert, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { PageId } from '../types.js';

interface LoginPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (type: 'farmer' | 'admin') => {
    if (type === 'farmer') {
      setEmail('farmer@agrovision.com');
      setPassword('Farmer@123');
    } else {
      setEmail('admin@agrovision.gov.in');
      setPassword('Admin@123');
    }
    setError(null);
  };

  return (
    <div id="login-page-root" className="min-h-screen bg-stone-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-700/20">
              <Sprout className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-emerald-950 tracking-tight">
              {language === 'ta' ? 'விவசாயி உள்நுழைவு' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'ta' ? 'உங்கள் Agro Vision கணக்கில் நுழையவும்' : 'Sign in to access your farm intelligence dashboard'}
            </p>
          </div>

          {/* 1-Click Quick Demo Login Pill Bar */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ta' ? '1-கிளிக் மாதிரி கணக்கு தேர்வு:' : '1-Click Demo Accounts for Testing:'}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-demo-farmer-login"
                onClick={() => handleQuickDemoFill('farmer')}
                className="py-1.5 px-2.5 rounded-xl bg-white border border-emerald-300 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100/50 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Demo Farmer
              </button>
              <button
                type="button"
                id="btn-demo-admin-login"
                onClick={() => handleQuickDemoFill('admin')}
                className="py-1.5 px-2.5 rounded-xl bg-white border border-purple-300 text-[11px] font-bold text-purple-800 hover:bg-purple-50 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Demo Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@agrovision.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50/50"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <span>{language === 'ta' ? 'சரிபார்க்கிறது...' : 'Authenticating...'}</span>
              ) : (
                <>
                  <span>{language === 'ta' ? 'உள்நுழைக' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-100">
            <p className="text-xs text-stone-500">
              {language === 'ta' ? 'புதிய கணக்கு இல்லையா?' : "Don't have an account yet?"}{' '}
              <button
                id="btn-go-to-register"
                onClick={() => setCurrentPage('register')}
                className="text-emerald-700 hover:text-emerald-900 font-bold ml-1"
              >
                {language === 'ta' ? 'இப்போதே பதிவுசெய்க' : 'Register now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
