import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { COAModal } from '../components/COAModal';
import { BatchCOA } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Search, 
  FileText, 
  Calculator, 
  HelpCircle, 
  Truck, 
  ThermometerSnowflake, 
  Lock, 
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    products, 
    guides, 
    quizQuestions, 
    coas, 
    getCOAByBatch, 
    navigateTo 
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [batchSearchInput, setBatchSearchInput] = useState('');
  const [searchedCOA, setSearchedCOA] = useState<BatchCOA | null>(null);
  const [activeCOAModal, setActiveCOAModal] = useState<BatchCOA | null>(null);
  const [searchError, setSearchError] = useState('');

  // Quick Dosage Calculator mini-widget state
  const [calcMg, setCalcMg] = useState(5);
  const [calcMl, setCalcMl] = useState(2);
  const [calcDoseMcg, setCalcDoseMcg] = useState(250);

  // Calculated syringe units
  // Concentration = (calcMg * 1000) / calcMl = mcg/ml
  // In a U-100 syringe, 100 units = 1.0 ml. So 1 unit = 0.01 ml.
  // Units = (calcDoseMcg / concentration) * 100
  const concentrationMcgPerMl = (calcMg * 1000) / (calcMl || 1);
  const syringeUnits = Math.round((calcDoseMcg / (concentrationMcgPerMl || 1)) * 100);

  // Filter products for homepage display
  const featuredProducts = products.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  }).slice(0, 6);

  const handleBatchLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchSearchInput.trim()) return;
    const found = getCOAByBatch(batchSearchInput.trim());
    if (found) {
      setSearchedCOA(found);
      setSearchError('');
      setActiveCOAModal(found);
    } else {
      setSearchError(`Batch "${batchSearchInput}" not found. Try PN-2026-BPC157 or PN-2026-SEMA02.`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* ── 1. Hero Section ── */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-[#DCE3CE]">
        {/* Decorative background blur blobs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#C0CBA9]/30 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#707E46]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCE3CE] shadow-xs text-xs font-semibold text-[#3E481D]">
                <span className="w-2 h-2 rounded-full bg-[#DC143C] animate-ping" />
                <span>Nepal Partner Business · Sourced via Delhi Peptides Company · Fixed INR (₹)</span>
              </div>

              {/* H1 Headline in distinctive display style */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#3E481D] tracking-tight leading-[1.15]">
                Know the peptide <br />
                <span className="text-[#56652C] font-normal italic font-serif">
                  before you trust the hype.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#5f6b3a] max-w-xl leading-relaxed">
                Direct Nepal partner for authentic, laboratory-verified research peptides sourced from Delhi. Fixed Indian Currency (₹) pricing, certified batch HPLC analysis, and insured 10–14 days delivery across Nepal.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => navigateTo('shop')}
                  className="px-6 py-3.5 rounded-full bg-[#3E481D] text-white font-bold text-sm hover:bg-[#2A3312] shadow-md transition-all flex items-center gap-2 active:scale-98"
                >
                  <span>Explore Peptide Rate Lists</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateTo('guides')}
                  className="px-6 py-3.5 rounded-full bg-white text-[#3E481D] border border-[#B7C29E] font-bold text-sm hover:bg-[#F0F0E0] shadow-xs transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#707E46]" />
                  <span>Read Science Guide</span>
                </button>

                <button
                  onClick={() => navigateTo('lab-results')}
                  className="px-5 py-3.5 rounded-full bg-[#C0CBA9]/30 text-[#3E481D] border border-[#B7C29E] font-bold text-sm hover:bg-[#C0CBA9]/50 transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Verify Batch COA</span>
                </button>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#5f6b3a] font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <span>≥99.0% HPLC Tested</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <span>Delhi Peptides Partner Sourced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <span>10 to 14 Days Nepal Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <span>Fixed INR (₹) Rates</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic: Decorative Peptide Chain Molecule */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white/70 backdrop-blur-xs p-6 rounded-3xl border border-[#DCE3CE] shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0F0E0] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#DC143C]"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3E481D]">
                      Peptide Chain Architecture
                    </span>
                  </div>
                  <span className="text-[11px] text-[#707E46] font-mono">15-AA Sequence</span>
                </div>

                {/* SVG Peptide chain visual */}
                <div className="py-2 flex justify-center">
                  <svg viewBox="0 0 320 200" className="w-full h-auto text-[#3E481D]" aria-hidden="true">
                    <path 
                      d="M30 160 C 60 110, 100 150, 130 90 S 190 50, 230 40 S 270 70, 290 100" 
                      fill="none" 
                      stroke="#B7C29E" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                    />
                    <g fill="#3E481D">
                      <circle cx="30" cy="160" r="10" />
                      <circle cx="70" cy="128" r="9" />
                      <circle cx="105" cy="132" r="9" />
                      <circle cx="130" cy="90" r="11" />
                      <circle cx="165" cy="65" r="9" />
                      <circle cx="200" cy="45" r="9" />
                      <circle cx="245" cy="45" r="10" />
                      <circle cx="290" cy="100" r="14" fill="#DC143C" />
                    </g>
                  </svg>
                </div>

                <div className="bg-[#F8FAF5] rounded-xl p-3.5 border border-[#DCE3CE] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Featured Assay</span>
                    <span className="text-xs font-bold text-[#3E481D]">Gold Bond Healing King Caps</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Fixed Price</span>
                    <span className="text-sm font-black text-[#3E481D]">₹ 9,800 INR</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#EAEBD9] text-[#3E481D] font-medium text-center">
                    ✈️ Delhi Partner Sourced
                  </div>
                  <div className="p-2 rounded-lg bg-[#EAEBD9] text-[#3E481D] font-medium text-center">
                    📦 10–14 Days in Nepal
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Active Offers & Customer Notice Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#2A3312] to-[#3E481D] rounded-3xl p-6 sm:p-8 text-white border border-[#56652C] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#A0D468] text-xs font-bold">
              <span>📢 Official Delhi Peptides Nepal Policy &amp; Offers</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Fixed Indian Rupee Rates &amp; Active Promotional Offers
            </h3>
            <p className="text-xs sm:text-sm text-[#C0CBA9] leading-relaxed">
              <strong>Rules &amp; Pricing:</strong> As the confidential Nepal partner for Delhi Peptides, all rates are strictly fixed in Indian Currency (₹ INR). Deliveries take a minimum of 10 days and typically arrive within 14 days. Any active discounts or offers are posted online here so customers are always kept informed.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 bg-white/15 rounded-lg text-xs font-mono font-bold text-[#A0D468]">
                Code: NEPAL10 (10% Off)
              </span>
              <span className="px-2.5 py-1 bg-white/15 rounded-lg text-xs font-mono font-bold text-[#A0D468]">
                Code: DELHI500 (₹500 Flat Off)
              </span>
            </div>
          </div>

          <div className="flex-none">
            <button
              onClick={() => navigateTo('shop')}
              className="px-6 py-3.5 bg-[#A0D468] hover:bg-[#8EC850] text-[#1E230E] font-black text-sm rounded-full shadow-md transition-all whitespace-nowrap"
            >
              Browse Verified Rate Lists →
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Stat Numbers Strip ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="At a glance">
          <li className="bg-white rounded-2xl p-5 border border-[#DCE3CE] shadow-xs">
            <strong className="text-3xl sm:text-4xl font-black text-[#3E481D] block">
              {products.length}
            </strong>
            <span className="text-xs text-[#707E46] font-medium mt-1 block">
              Verified June Rate Lists &amp; Products
            </span>
          </li>
          <li className="bg-white rounded-2xl p-5 border border-[#DCE3CE] shadow-xs">
            <strong className="text-3xl sm:text-4xl font-black text-[#3E481D] block">
              100%
            </strong>
            <span className="text-xs text-[#707E46] font-medium mt-1 block">
              Third-Party HPLC Batch Verified
            </span>
          </li>
          <li className="bg-white rounded-2xl p-5 border border-[#DCE3CE] shadow-xs">
            <strong className="text-3xl sm:text-4xl font-black text-[#3E481D] block">
              10–14d
            </strong>
            <span className="text-xs text-[#707E46] font-medium mt-1 block">
              Guaranteed Nepal Delivery Window
            </span>
          </li>
          <li className="bg-white rounded-2xl p-5 border border-[#DCE3CE] shadow-xs">
            <strong className="text-3xl sm:text-4xl font-black text-[#DC143C] block">
              ₹ INR
            </strong>
            <span className="text-xs text-[#707E46] font-medium mt-1 block">
              Fixed Indian Currency Pricing
            </span>
          </li>
        </ul>
      </section>

      {/* ── 3. Featured Catalog Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#707E46] block">
              Verified Laboratory Standards
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#3E481D] tracking-tight mt-1">
              Featured Research Peptides
            </h2>
            <p className="text-sm text-[#5f6b3a] max-w-xl mt-1">
              Every vial is vacuum-sealed with sterile nitrogen, batch-coded, and backed by accessible HPLC chromatograms.
            </p>
          </div>

          <button
            onClick={() => navigateTo('shop')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3E481D] hover:underline"
          >
            <span>View All {products.length} Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'recovery', label: 'Recovery & Tissue (BPC, TB-500)' },
            { id: 'hgh', label: 'HGH Somatropin Kits' },
            { id: 'secretagogues', label: 'CJC-1295 & Ipamorelin' },
            { id: 'metabolic', label: 'Metabolic & GLP-1' },
            { id: 'longevity', label: 'Longevity & Skin (GHK-Cu)' },
            { id: 'supplies', label: 'Bacteriostatic Water & Supplies' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#3E481D] text-white shadow-xs'
                  : 'bg-white text-[#3E481D] hover:bg-[#EAEBD9] border border-[#DCE3CE]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── 4. Batch COA Verification Bar Widget ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#3E481D] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#C0CBA9] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#A0D468]" />
              <span>Independent Purity Verification</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Got a vial? Verify your batch certificate.
            </h2>

            <p className="text-sm text-[#C0CBA9] leading-relaxed">
              Every Peptides Nepal order includes an individual lot number printed on the box and vial label. Enter it below to inspect the full analytical HPLC chromatogram, purity rating, and heavy metals screening.
            </p>

            <form onSubmit={handleBatchLookup} className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter Lot code: e.g. PN-2026-BPC157"
                  value={batchSearchInput}
                  onChange={(e) => setBatchSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white text-gray-900 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A0D468]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-[#A0D468] text-[#1E230E] font-black text-sm hover:bg-[#8EC850] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Inspect Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {searchError && (
              <p className="text-xs text-amber-300 font-medium">{searchError}</p>
            )}

            <div className="flex items-center gap-2 pt-2 text-xs text-[#C0CBA9]">
              <span>Quick tests:</span>
              <button 
                type="button" 
                onClick={() => { setBatchSearchInput('PN-2026-BPC157'); }}
                className="underline hover:text-white"
              >
                PN-2026-BPC157
              </button>
              <span>·</span>
              <button 
                type="button" 
                onClick={() => { setBatchSearchInput('PN-2026-SEMA02'); }}
                className="underline hover:text-white"
              >
                PN-2026-SEMA02
              </button>
              <span>·</span>
              <button 
                type="button" 
                onClick={() => { setBatchSearchInput('PN-2026-TIRZ01'); }}
                className="underline hover:text-white"
              >
                PN-2026-TIRZ01
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Interactive Dosage & Reconstitution Mini-Calculator ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#DCE3CE] p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEBD9] text-[#3E481D] text-xs font-semibold">
              <Calculator className="w-4 h-4" />
              <span>Scientific Utility</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-[#3E481D] tracking-tight">
              Interactive Reconstitution Calculator
            </h2>

            <p className="text-sm text-[#5f6b3a] leading-relaxed">
              Calculate the exact volume and U-100 insulin syringe tick marks for your desired dose. Never guess your dilutions again.
            </p>

            {/* Inputs */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[#3E481D] mb-1">
                  Vial Size (mg)
                </label>
                <select
                  value={calcMg}
                  onChange={(e) => setCalcMg(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-xs font-bold text-[#3E481D] focus:outline-none"
                >
                  <option value={2}>2 mg</option>
                  <option value={5}>5 mg</option>
                  <option value={10}>10 mg</option>
                  <option value={50}>50 mg</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3E481D] mb-1">
                  Bac Water (ml)
                </label>
                <select
                  value={calcMl}
                  onChange={(e) => setCalcMl(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-xs font-bold text-[#3E481D] focus:outline-none"
                >
                  <option value={1}>1.0 ml</option>
                  <option value={2}>2.0 ml</option>
                  <option value={3}>3.0 ml</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3E481D] mb-1">
                  Target Dose (mcg)
                </label>
                <input
                  type="number"
                  value={calcDoseMcg}
                  onChange={(e) => setCalcDoseMcg(Number(e.target.value))}
                  step={50}
                  min={50}
                  className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-xs font-bold text-[#3E481D] focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => navigateTo('calculator')}
              className="text-xs font-bold text-[#3E481D] hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Open Full Screen Syringe Graphic &amp; Chart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Calculator Output Display Card */}
          <div className="lg:col-span-6 bg-[#F4F4EA] rounded-2xl p-6 border border-[#DCE3CE] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE3CE] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#707E46]">
                Calculation Result (U-100 Syringe)
              </span>
              <span className="text-xs font-mono font-bold text-[#3E481D]">
                Concentration: {concentrationMcgPerMl.toLocaleString()} mcg/ml
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5f6b3a] font-medium block">
                  Draw to syringe mark:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-[#3E481D]">
                    {syringeUnits}
                  </span>
                  <span className="text-lg font-bold text-[#707E46]">Units (IU)</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#5f6b3a] font-medium block">Volume</span>
                <span className="text-lg font-bold text-[#3E481D]">
                  {(syringeUnits * 0.01).toFixed(2)} ml
                </span>
              </div>
            </div>

            {/* Visual tick line representation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
                <span>60</span>
                <span>70</span>
                <span>80</span>
                <span>90</span>
                <span>100</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#DCE3CE] p-0.5 relative">
                <div 
                  className="h-full bg-[#3E481D] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, syringeUnits))}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-[#707E46] italic">
              Example: For a 5mg vial diluted in 2ml water, drawing 10 units yields exactly 250 mcg.
            </p>
          </div>

        </div>
      </section>

      {/* ── 6. Plain-Language Research Guide Snapshot ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#707E46] block">
              Education Only · PubMed Sourced
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#3E481D] tracking-tight mt-1">
              The Peptide Evidence Guide
            </h2>
            <p className="text-sm text-[#5f6b3a] max-w-xl mt-1">
              Know where each compound stands under Nepal DDA regulations, FDA approvals, and World Anti-Doping Agency restrictions.
            </p>
          </div>

          <button
            onClick={() => navigateTo('guides')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3E481D] hover:underline"
          >
            <span>Read All Guide Cards</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Guide Previews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.slice(0, 3).map((guide) => (
            <article 
              key={guide.id}
              onClick={() => navigateTo('guides')}
              className="bg-white rounded-2xl p-6 border border-[#DCE3CE] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-[#3E481D]">{guide.name}</h3>
                    <p className="text-xs text-[#707E46]">{guide.aka}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    guide.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : guide.status === 'In trials'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {guide.badge}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#5f6b3a] pt-2 border-t border-[#F0F0E0]">
                  {guide.facts.slice(0, 2).map((f, i) => (
                    <div key={i}>
                      <span className="font-bold text-[#3E481D] block">{f.label}:</span>
                      <p className="line-clamp-2 mt-0.5">{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0F0E0] flex items-center justify-between text-xs font-semibold text-[#3E481D]">
                <span>Sources &amp; Trial Data →</span>
                <span className="text-[11px] text-[#707E46]">PubMed Verified</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 7. Myth vs Fact Quiz Teaser ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EAEBD9] rounded-3xl p-6 sm:p-10 border border-[#DCE3CE] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#3E481D] text-xs font-bold shadow-xs">
              <HelpCircle className="w-4 h-4 text-[#707E46]" />
              <span>Interactive Knowledge Check</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#3E481D] tracking-tight">
              Myth or Fact? Test your peptide knowledge.
            </h2>
            <p className="text-sm text-[#5f6b3a] leading-relaxed">
              "Peptides are natural so they're safe" — true or false? Take our 8-question scientific myth buster backed by FDA warning letters and published trial data.
            </p>
          </div>

          <button
            onClick={() => navigateTo('quiz')}
            className="px-8 py-4 rounded-full bg-[#3E481D] text-white font-bold text-sm hover:bg-[#2A3312] shadow-md transition-all flex items-center gap-2 whitespace-nowrap active:scale-98"
          >
            <span>Take the Myth Quiz (8 Questions)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* COA Inspection Modal */}
      {activeCOAModal && (
        <COAModal 
          coa={activeCOAModal} 
          onClose={() => setActiveCOAModal(null)} 
        />
      )}

    </div>
  );
};
