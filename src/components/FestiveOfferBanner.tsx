import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FESTIVE_OFFER, isFestiveOfferActive } from '../lib/festiveOffer';

const DISMISS_KEY = 'pn_festive_banner_dismissed';

// Dashain–Tihar offer strip. Hides itself after the offer ends (see lib/festiveOffer).
export const FestiveOfferBanner: React.FC = () => {
  const { navigateTo } = useStore();
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (hidden || !isFestiveOfferActive()) return null;

  const close = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // private mode: just hide for now
    }
  };

  return (
    <div className="bg-[#7A1F1F] text-[#FFF4E0] border-b border-[#5E1717]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 text-xs sm:text-sm">
        <span aria-hidden="true" className="shrink-0">🪔</span>
        <p className="flex-1 leading-snug">
          <strong>Dashain &amp; Tihar offer:</strong> {FESTIVE_OFFER.percent}% off {FESTIVE_OFFER.categoryLabel} products with code{' '}
          <strong className="tracking-wide bg-[#FFF4E0] text-[#7A1F1F] px-1.5 rounded">{FESTIVE_OFFER.code}</strong>.
          <span className="hidden sm:inline"> Limited time, ends {FESTIVE_OFFER.endsLabel}.</span>
        </p>
        <button
          type="button"
          onClick={() => navigateTo('shop')}
          className="shrink-0 inline-flex items-center px-3 py-1 rounded-full bg-[#E8A33D] text-[#3A0E0E] font-semibold hover:bg-[#F0B657] transition-colors"
        >
          Shop now
        </button>
        <button
          type="button"
          onClick={close}
          className="shrink-0 p-1 rounded-full hover:bg-[#5E1717]"
          aria-label="Close offer banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
