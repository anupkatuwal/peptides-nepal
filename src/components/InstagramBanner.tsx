import React, { useState } from 'react';
import { X } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/peptidesnepal/';
const DISMISS_KEY = 'pn_ig_banner_dismissed';

const InstagramGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// Slim "follow us" strip under the navbar. Visitors can close it; it stays closed
// for the rest of their visit.
export const InstagramBanner: React.FC = () => {
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (hidden) return null;

  const close = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // private mode: just hide for now
    }
  };

  return (
    <div className="bg-[#3E481D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 text-xs sm:text-sm">
        <InstagramGlyph className="w-4 h-4 shrink-0 text-[#C0CBA9]" />
        <p className="flex-1 leading-snug">
          New peptide science posts every other day, with sources.
          <span className="hidden sm:inline"> Myths, research and plain explanations.</span>
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#3E481D] font-bold hover:bg-[#F4F4EA] transition-colors"
        >
          Follow @peptidesnepal
        </a>
        <button
          type="button"
          onClick={close}
          className="shrink-0 p-1 rounded-full hover:bg-white/10"
          aria-label="Close Instagram banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
