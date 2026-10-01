import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Menu, X, User } from 'lucide-react';

// The mark: three amino-acid tiles in prayer-flag colours, the same tiles the
// home page uses to spell a peptide.
export const BrandMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-flex gap-[3px] ${className}`} aria-hidden="true">
    <span className="w-2.5 h-5 rounded-[3px] bg-[#2152B8]" />
    <span className="w-2.5 h-5 rounded-[3px] bg-[#E3A81B] translate-y-1" />
    <span className="w-2.5 h-5 rounded-[3px] bg-[#C2362B]" />
  </span>
);

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
          <span className="font-display text-[19px] font-extrabold text-[#0E2A23] tracking-tight">Peptides Nepal</span>
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
