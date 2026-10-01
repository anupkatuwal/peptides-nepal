import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Menu, X, User } from 'lucide-react';

// The Peptides Nepal logo (also the Instagram profile picture and trademark).
// Colours and geometry are fixed: do not restyle this with the site palette.
export const BrandMark: React.FC<{ size?: 'md' | 'sm'; className?: string }> = ({ size = 'md', className = '' }) => {
  const box = size === 'md' ? 'w-10 h-10 rounded-xl' : 'w-8 h-8 rounded-lg';
  const icon = size === 'md' ? 'w-7 h-7' : 'w-5 h-5';
  return (
    <span className={`${box} bg-[#3E481D] text-white inline-flex items-center justify-center shrink-0 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" className={icon}>
        <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4,32 12,20 17,26 24,10 31,22 36,32" />
        </g>
        <g fill="currentColor">
          <circle cx="4" cy="32" r="2.6" /><circle cx="12" cy="20" r="2.6" /><circle cx="17" cy="26" r="2.6" />
          <circle cx="31" cy="22" r="2.6" /><circle cx="36" cy="32" r="2.6" />
        </g>
        <circle cx="24" cy="10" r="4.5" fill="#DC143C" />
      </svg>
    </span>
  );
};

const LINKS: { view: string; label: string; match: string[] }[] = [
  { view: 'guides', label: 'Guides', match: ['guides', 'guide-detail'] },
  { view: 'lab-results', label: 'Lab results', match: ['lab-results'] },
  { view: 'quiz', label: 'Myth quiz', match: ['quiz'] },
  { view: 'calculator', label: 'Calculator', match: ['calculator'] },
  { view: 'shop', label: 'Shop', match: ['shop', 'product-detail'] },
  { view: 'contact', label: 'Contact', match: ['contact', 'support'] },
];

export const Navbar: React.FC = () => {
  const { cartCount, setIsCartOpen, currentView, navigateTo, currentUser, switchUserRole } = useStore();
  const [open, setOpen] = useState(false);

  const go = (view: string) => {
    navigateTo(view);
    setOpen(false);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#F2F5F3]/92 backdrop-blur-md border-b border-[#CBD5CF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <button onClick={() => go('home')} className="flex items-center gap-3 shrink-0" aria-label="Peptides Nepal home">
          <BrandMark />
          <span className="text-left">
            <span className="block font-bold text-lg text-[#0E2A23] tracking-tight leading-none">Peptides Nepal</span>
            <span className="hidden sm:block text-[11px] font-medium text-[#4B635A] tracking-wider uppercase mt-1">Verified Purity &amp; Education</span>
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
          {LINKS.map(l => {
            const active = l.match.includes(currentView);
            return (
              <button
                key={l.view}
                onClick={() => go(l.view)}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-2 text-[15px] rounded-md transition-colors ${
                  active ? 'text-[#0E2A23] font-semibold underline decoration-2 underline-offset-[10px] decoration-[#2152B8]' : 'text-[#3F574D] hover:text-[#0E2A23]'
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {isAdmin && (
            <button onClick={() => go('admin')} className="hidden sm:inline px-3 py-2 text-sm font-semibold text-[#0E2A23] hover:underline">
              Admin
            </button>
          )}
          <button
            onClick={() => go('account')}
            className="p-2.5 rounded-full text-[#0E2A23] hover:bg-[#E4EBE7]"
            aria-label="Your account and orders"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full text-[#0E2A23] hover:bg-[#E4EBE7]"
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-[#C2362B] text-white text-[11px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2.5 rounded-full text-[#0E2A23] hover:bg-[#E4EBE7]"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-[#CBD5CF] bg-[#F2F5F3] px-4 py-3" aria-label="Mobile">
          {LINKS.map(l => (
            <button
              key={l.view}
              onClick={() => go(l.view)}
              className={`block w-full text-left px-2 py-3 text-lg border-b border-[#E4EBE7] last:border-0 ${
                l.match.includes(currentView) ? 'font-semibold text-[#0E2A23]' : 'text-[#3F574D]'
              }`}
            >
              {l.label}
            </button>
          ))}
          {isAdmin && (
            <div className="flex gap-4 pt-3">
              <button onClick={() => go('admin')} className="text-sm font-semibold text-[#0E2A23] underline">Admin dashboard</button>
              <button onClick={() => { switchUserRole('customer'); setOpen(false); }} className="text-sm text-[#3F574D] underline">
                Sign out of admin
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};
