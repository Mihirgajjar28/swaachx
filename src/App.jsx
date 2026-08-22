import React, { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { NotificationToast } from './components/layout/NotificationToast';
import { AuthView } from './components/auth/AuthView';
import { SignInModal } from './components/auth/SignInModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { CitizenDashboardView } from './views/CitizenDashboardView';
import { DriverDashboardView } from './views/DriverDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { ReportsView } from './views/ReportsView';
import { VehiclesView } from './views/VehiclesView';
import { RoutesView } from './views/RoutesView';
import { DustbinsView } from './views/DustbinsView';
import { DriverPersistentDispatchBanner } from './components/layout/DriverPersistentDispatchBanner';
import './App.css';

const MainContent = () => {
  const { currentUser, activeTab, activeRole, isAdminLoginOpen, closeAdminLogin } = useDashboard();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock background page scroll whenever mobile sidebar drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Authentication Gate: If unauthenticated, user is strictly locked out of the app
  if (!currentUser) {
    return (
      <>
        <AuthView />
        <NotificationToast />
      </>
    );
  }

  const renderActiveView = () => {
    if (activeRole === 'admin') {
      return <AdminDashboardView />;
    }

    if (activeRole === 'driver') {
      switch (activeTab) {
        case 'dashboard':
          return <DriverDashboardView />;
        case 'routes':
          return <RoutesView />;
        case 'vehicles':
          return <VehiclesView />;
        default:
          return <DriverDashboardView />;
      }
    }

    // Citizen Role
    switch (activeTab) {
      case 'dashboard':
        return <CitizenDashboardView />;
      case 'dustbins':
        return <DustbinsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <CitizenDashboardView />;
    }
  };

  return (
    <div className={`app-layout ${isMobileMenuOpen ? 'drawer-active' : ''}`}>
      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Page Content View */}
        <main className="page-content">
          <DriverPersistentDispatchBanner />
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (rendered on <= 768px screens) */}
      <MobileBottomNav />

      {/* Dedicated Modals */}
      <SignInModal />
      <RegisterModal />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={closeAdminLogin} />

      {/* Real-time notification feedback */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <MainContent />
    </DashboardProvider>
  );
}
