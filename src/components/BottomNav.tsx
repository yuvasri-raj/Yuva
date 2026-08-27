import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Wheat,
  TrendingUp,
  BotMessageSquare
} from 'lucide-react';
import { PageId } from '../types.js';

interface BottomNavProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const items: Array<{ id: PageId; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'crop-recommendation', label: 'Crops', icon: <Wheat className="w-5 h-5" /> },
    { id: 'disease-detection', label: 'Scan', icon: <ScanLine className="w-5 h-5" /> },
    { id: 'market-prices', label: 'Market', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'ai-chatbot', label: 'AI Chat', icon: <BotMessageSquare className="w-5 h-5" /> }
  ];

  return (
    <nav
      id="app-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg flex items-center justify-around"
    >
      {items.map(item => {
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-emerald-700 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
