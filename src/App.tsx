import React, { useState, useEffect } from 'react';
import { PageId } from './types.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { NotificationProvider } from './context/NotificationContext.js';

import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { BottomNav } from './components/BottomNav.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { FarmerDashboard } from './pages/FarmerDashboard.js';
import { CropRecommendationPage } from './pages/CropRecommendationPage.js';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage.js';
import { SoilHealthPage } from './pages/SoilHealthPage.js';
import { MarketPricesPage } from './pages/MarketPricesPage.js';
import { ProfitCalculatorPage } from './pages/ProfitCalculatorPage.js';
import { GovernmentSchemesPage } from './pages/GovernmentSchemesPage.js';
import { FarmerCommunityPage } from './pages/FarmerCommunityPage.js';
import { AIChatbotPage } from './pages/AIChatbotPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { ApiDocsPage } from './pages/ApiDocsPage.js';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If user logs in while on landing/login/register, switch to dashboard
  useEffect(() => {
    if (user && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('dashboard');
    }
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage setCurrentPage={setCurrentPage} />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'register':
        return <RegisterPage setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <FarmerDashboard setCurrentPage={setCurrentPage} />;
      case 'crop-recommendation':
        return <CropRecommendationPage setCurrentPage={setCurrentPage} />;
      case 'disease-detection':
        return <DiseaseDetectionPage setCurrentPage={setCurrentPage} />;
      case 'soil-health':
        return <SoilHealthPage setCurrentPage={setCurrentPage} />;
      case 'market-prices':
        return <MarketPricesPage setCurrentPage={setCurrentPage} />;
      case 'profit-calculator':
        return <ProfitCalculatorPage setCurrentPage={setCurrentPage} />;
      case 'government-schemes':
        return <GovernmentSchemesPage setCurrentPage={setCurrentPage} />;
      case 'farmer-community':
        return <FarmerCommunityPage setCurrentPage={setCurrentPage} />;
      case 'ai-chatbot':
        return <AIChatbotPage setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage setCurrentPage={setCurrentPage} />;
      case 'api-docs':
        return <ApiDocsPage />;
      default:
        return <LandingPage setCurrentPage={setCurrentPage} />;
    }
  };

  const isFullLanding = currentPage === 'landing';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 relative">
        {/* Desktop Collapsible / Persistent Sidebar (hidden on full landing if desired, or accessible for fast switching) */}
        {!isFullLanding && (
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main
          id="main-viewport"
          className={`flex-1 transition-all duration-200 pb-20 lg:pb-8 ${
            !isFullLanding ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : 'p-0 w-full'
          }`}
        >
          {renderPageContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <MainAppContent />
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
