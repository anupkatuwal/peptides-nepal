import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  FileText, 
  Calculator, 
  HelpCircle, 
  UserCheck, 
  User, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    cartCount, 
    setIsCartOpen, 
    currentView, 
    navigateTo, 
    currentUser, 
    switchUserRole 
  } = useStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (view: string, params?: any) => {
    navigateTo(view, params);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F4F4EA]/90 backdrop-blur-md border-b border-[#DCE3CE]">
      {/* Top Banner */}
      <div className="bg-[#3E481D] text-[#F0F0E0] px-4 py-1.5 text-xs font-medium text-center flex flex-wrap items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#DC143C] animate-pulse"></span>
        <span>
          <strong>Official Nepal Partner</strong>: Delhi Peptides Company · Fixed INR (₹) Pricing · Nepal Delivery: <strong>10–14 Days</strong>
        </span>
        <span className="hidden sm:inline text-white/40">|</span>
        <span className="inline-flex items-center gap-1 text-[#A0D468] font-bold">
          📢 Active Offers Posted Online
        </span>
        <button 
          onClick={() => handleNav('shop')} 
          className="underline hover:text-white font-semibold ml-1"
        >
          View Latest Rate Lists →
        </button>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <button 
          onClick={() => handleNav('home')} 
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#3E481D] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 40 40" className="w-7 h-7" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4,32 12,20 17,26 24,10 31,22 36,32" />
              </g>
              <g fill="currentColor">
                <circle cx="4" cy="32" r="2.6" /><circle cx="12" cy="20" r="2.6" /><circle cx="17" cy="26" r="2.6" />
                <circle cx="31" cy="22" r="2.6" /><circle cx="36" cy="32" r="2.6" />
              </g>
              <circle cx="24" cy="10" r="4.5" fill="#DC143C" />
            </svg>
          </div>
          <div>
            <span className="block font-bold text-lg text-[#3E481D] tracking-tight leading-none">
              Peptides Nepal
            </span>
            <span className="block text-[11px] font-medium text-[#707E46] tracking-wider uppercase mt-0.5">
              Verified Purity &amp; Education
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button 
            onClick={() => handleNav('shop')}
            className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition-all flex items-center gap-1.5 ${
              currentView === 'shop' || currentView === 'product-detail'
                ? 'bg-[#3E481D] text-white shadow-md'
                : 'bg-[#3E481D]/10 text-[#3E481D] hover:bg-[#3E481D] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>🛒 Shop Peptides</span>
          </button>
          <button 
            onClick={() => handleNav('guides')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              currentView === 'guides' || currentView === 'guide-detail'
                ? 'bg-[#3E481D] text-white shadow-sm'
                : 'text-[#3E481D] hover:bg-[#3E481D]/10'
            }`}
          >
            Research Guide
          </button>
          <button 
            onClick={() => handleNav('lab-results')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-1.5 transition-colors ${
              currentView === 'lab-results'
                ? 'bg-[#3E481D] text-white shadow-sm'
                : 'text-[#3E481D] hover:bg-[#3E481D]/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#707E46]" />
            <span>Lab Results (COA)</span>
          </button>
          <button 
            onClick={() => handleNav('calculator')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-1.5 transition-colors ${
              currentView === 'calculator'
                ? 'bg-[#3E481D] text-white shadow-sm'
                : 'text-[#3E481D] hover:bg-[#3E481D]/10'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Dosage Calculator</span>
          </button>
          <button 
            onClick={() => handleNav('quiz')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-1.5 transition-colors ${
              currentView === 'quiz'
                ? 'bg-[#3E481D] text-white shadow-sm'
                : 'text-[#3E481D] hover:bg-[#3E481D]/10'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Myth Quiz</span>
          </button>
          <button 
            onClick={() => handleNav('contact')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              currentView === 'contact'
                ? 'bg-[#3E481D] text-white shadow-sm'
                : 'text-[#3E481D] hover:bg-[#3E481D]/10'
            }`}
          >
            Support
          </button>
        </nav>

        {/* Right Actions: Role pill, Cart button, User button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#B7C29E] bg-white/80 hover:bg-white text-[#3E481D] shadow-xs"
              title="Click to switch role or view account"
            >
              <span className={`w-2 h-2 rounded-full ${currentUser?.role === 'admin' ? 'bg-amber-600' : 'bg-emerald-600'}`}></span>
              <span>{currentUser?.role === 'admin' ? 'Admin Mode' : 'Customer'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#707E46]" />
            </button>

            {/* Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DCE3CE] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-[#F0F0E0]">
                  <p className="text-xs text-[#707E46]">Signed in as</p>
                  <p className="text-sm font-semibold text-[#3E481D] truncate">{currentUser?.name}</p>
                  <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAEBD9] text-[#3E481D]">
                    {currentUser?.role}
                  </span>
                </div>
                
                {currentUser?.role === 'admin' ? (
                  <button 
                    onClick={() => handleNav('admin')}
                    className="w-full text-left px-4 py-2 text-sm text-[#3E481D] hover:bg-[#F4F4EA] flex items-center gap-2 font-medium"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#707E46]" />
                    Admin Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => handleNav('account')}
                    className="w-full text-left px-4 py-2 text-sm text-[#3E481D] hover:bg-[#F4F4EA] flex items-center gap-2 font-medium"
                  >
                    <User className="w-4 h-4 text-[#707E46]" />
                    My Account &amp; Orders
                  </button>
                )}

                {/* Admin access is by Google sign-in on the #admin page only. */}
                {currentUser?.role === 'admin' && (
                  <div className="border-t border-[#F0F0E0] my-1 pt-1">
                    <button
                      onClick={() => {
                        switchUserRole('customer');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-[#3E481D] hover:bg-[#F4F4EA]"
                    >
                      Sign out of admin
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-[#3E481D] text-white hover:bg-[#2C3414] transition-transform active:scale-95 shadow-md flex items-center justify-center focus:outline-none"
            aria-label={`Shopping Cart, ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#DC143C] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#F4F4EA] shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#3E481D] hover:bg-[#3E481D]/10 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#DCE3CE] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleNav('shop')}
            className="w-full text-left px-4 py-3 rounded-xl font-bold bg-[#3E481D] text-white flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#A0D468]" />
              <span>🛒 Shop Peptide Store &amp; Supplies</span>
            </span>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">12 items</span>
          </button>
          <button
            onClick={() => handleNav('guides')}
            className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-[#3E481D] hover:bg-[#F4F4EA] flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#707E46]" />
            <span>Peptide Research Guide</span>
          </button>
          <button
            onClick={() => handleNav('lab-results')}
            className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-[#3E481D] hover:bg-[#F4F4EA] flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#707E46]" />
            <span>Lab Results &amp; Purity COA</span>
          </button>
          <button
            onClick={() => handleNav('calculator')}
            className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-[#3E481D] hover:bg-[#F4F4EA] flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-[#707E46]" />
            <span>Reconstitution &amp; Dosage Calculator</span>
          </button>
          <button
            onClick={() => handleNav('quiz')}
            className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-[#3E481D] hover:bg-[#F4F4EA] flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-[#707E46]" />
            <span>Myth vs Fact Quiz</span>
          </button>
          <button
            onClick={() => handleNav('contact')}
            className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-[#3E481D] hover:bg-[#F4F4EA]"
          >
            Customer Support &amp; Delivery FAQ
          </button>

          <div className="pt-3 border-t border-[#F0F0E0] flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 text-xs text-[#707E46]">
              <span>Active User: {currentUser?.name}</span>
              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => switchUserRole('customer')}
                  className="underline font-bold text-[#3E481D]"
                >
                  Sign out of admin
                </button>
              )}
            </div>
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => handleNav('admin')}
                className="w-full py-2.5 rounded-xl bg-amber-800 text-white font-medium text-center text-sm"
              >
                Admin Control Panel
              </button>
            ) : (
              <button
                onClick={() => handleNav('account')}
                className="w-full py-2.5 rounded-xl bg-[#3E481D] text-white font-medium text-center text-sm"
              >
                My Account &amp; Past Orders
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
