import React from 'react';
import { useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { InstagramBanner } from './components/InstagramBanner';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GuidesPage } from './pages/GuidesPage';
import { LabResultsPage } from './pages/LabResultsPage';
import { DosageCalculatorPage } from './pages/DosageCalculatorPage';
import { QuizPage } from './pages/QuizPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage, SupportTermsPage } from './pages/LegalPages';

export const AppContent: React.FC = () => {
  const { currentView } = useStore();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'guides':
      case 'guide-detail':
        return <GuidesPage />;
      case 'lab-results':
        return <LabResultsPage />;
      case 'calculator':
        return <DosageCalculatorPage />;
      case 'quiz':
        return <QuizPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'account':
        return <AccountPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'support':
        return <SupportTermsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F5F3] text-[#10241E] selection:bg-[#B9C7BF] selection:text-[#0A1F19]">
      <Navbar />
      {/* Not on checkout, account or admin screens, where it would distract. */}
      {!['checkout', 'order-confirmation', 'account', 'admin'].includes(currentView) && <InstagramBanner />}
      <main className="flex-1">
        {renderView()}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default AppContent;
