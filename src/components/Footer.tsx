import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useStore();

  return (
    <footer className="bg-[#1E230E] text-[#C0CBA9] pt-16 pb-12 border-t border-[#3E481D]/30">
      {/* Trust Highlights Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#2B3314] rounded-2xl p-6 border border-[#3E481D]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#3E481D] text-[#C0CBA9] flex-none">
              <ShieldCheck className="w-6 h-6 text-[#A0D468]" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">≥99% HPLC Certified Purity</h4>
              <p className="text-xs text-[#9BB07A] mt-1 leading-relaxed">
                Every batch is independently tested with accessible third-party analytical chromatography and Mass Spectrometry (MS) certificates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#3E481D] text-[#C0CBA9] flex-none">
              <Truck className="w-6 h-6 text-[#A0D468]" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Delhi Partner 10–14 Days Transit</h4>
              <p className="text-xs text-[#9BB07A] mt-1 leading-relaxed">
                Direct transit from our Delhi partner company. All orders in Nepal take a minimum of 10 days and typically arrive within 14 days with cold-chain protection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#3E481D] text-[#C0CBA9] flex-none">
              <Clock className="w-6 h-6 text-[#A0D468]" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Fixed INR (₹) Rates &amp; Online Offers</h4>
              <p className="text-xs text-[#9BB07A] mt-1 leading-relaxed">
                Prices are strictly fixed in Indian currency (₹). Ongoing discounts and promotional offers are posted directly online here for complete customer awareness.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3E481D] text-white flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-5 h-5" aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4,32 12,20 17,26 24,10 31,22 36,32" />
                </g>
                <circle cx="24" cy="10" r="4.5" fill="#DC143C" />
              </svg>
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Peptides Nepal</span>
          </div>
          <p className="text-sm text-[#9BB07A] leading-relaxed max-w-sm">
            Nepal's plain-language peptide research resource and laboratory supply hub. We cut through fitness marketing hype with verifiable science, PubMed citations, and HPLC batch testing.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a 
              href="https://instagram.com/peptidesnepal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2B3314] text-xs font-semibold text-white hover:bg-[#3E481D] border border-[#3E481D] transition-colors"
            >
              <span>Follow @peptidesnepal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A0D468]" />
            </a>
            <span className="text-xs text-[#707E46]">· 13+ published guides</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Catalog &amp; Shop</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                All Research Peptides
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                BPC-157 &amp; TB-500
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                GLP-1 Agonists (Semaglutide)
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                GHK-Cu Copper Peptide
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                Bacteriostatic Water &amp; Kits
              </button>
            </li>
          </ul>
        </div>

        {/* Research & Education */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Education &amp; Tools</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => navigateTo('guides')} className="hover:text-white transition-colors">
                Peptide Research Guide
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('lab-results')} className="hover:text-white transition-colors">
                Batch COA Verification
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('calculator')} className="hover:text-white transition-colors">
                Reconstitution Calculator
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('quiz')} className="hover:text-white transition-colors">
                Myth or Fact Quiz
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
                Nepal Delivery Information
              </button>
            </li>
          </ul>
        </div>

        {/* Payment & Compliance */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Accepted Payments</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2.5 py-1 rounded bg-[#60BB46]/20 text-[#8CE374] border border-[#60BB46]/40 text-xs font-bold">
              eSewa
            </span>
            <span className="px-2.5 py-1 rounded bg-[#5C2D91]/30 text-[#D4B5FF] border border-[#5C2D91]/50 text-xs font-bold">
              Khalti
            </span>
            <span className="px-2.5 py-1 rounded bg-[#3E481D] text-white border border-[#707E46] text-xs font-bold">
              Fonepay / Bank
            </span>
            <span className="px-2.5 py-1 rounded bg-[#A0D468]/20 text-[#A0D468] border border-[#A0D468]/40 text-xs font-bold">
              Indian UPI / IMPS
            </span>
            <span className="px-2.5 py-1 rounded bg-red-900/40 text-red-300 border border-red-700/50 text-xs font-bold">
              100% Upfront (No COD)
            </span>
          </div>
          <p className="text-xs text-[#9BB07A] space-y-1">
            <span className="block font-semibold text-white">Direct Nepal Inquiries &amp; Orders:</span>
            <span className="block text-white font-mono">WhatsApp/Tel: +977 9808318864</span>
            <a href="mailto:katuwalanup@gmail.com" className="block text-white hover:underline">
              katuwalanup@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Strict Regulatory Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-[#3E481D]/40">
        <div className="bg-[#161A0A] rounded-xl p-4 border border-[#3E481D]/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-none mt-0.5" />
          <div className="text-xs text-[#8A9C68] space-y-1">
            <p className="font-semibold text-white">
              Regulatory Notice &amp; Educational Purpose:
            </p>
            <p>
              The materials and products on this website are provided strictly for scientific laboratory research, analytical reference, and educational information. Unapproved peptides (such as BPC-157, TB-500, and Retatrutide) are not licensed as finished human medicines by the Department of Drug Administration (DDA) of Nepal or the US FDA. Athletes should note that BPC-157, TB-500, CJC-1295, and Ipamorelin are prohibited by the World Anti-Doping Agency (WADA). Nothing herein constitutes medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#707E46] gap-4">
          <p>© {new Date().getFullYear()} Peptides Nepal. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => navigateTo('privacy')} className="hover:underline">
              Privacy Policy
            </button>
            <button onClick={() => navigateTo('support')} className="hover:underline">
              Support &amp; Terms
            </button>
            <button onClick={() => navigateTo('admin')} className="hover:underline text-amber-400">
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
