import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { COAModal } from '../components/COAModal';
import { BatchCOA } from '../types';
import { getBrandImage, getProductGallery, ProductGalleryItem } from '../assets/productImages';
import { 
  ArrowLeft, 
  ShieldCheck, 
  ShoppingBag, 
  Check, 
  FileText, 
  ThermometerSnowflake, 
  HelpCircle, 
  AlertTriangle,
  Award,
  Share2,
  CheckCircle2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { 
    products, 
    selectedProductSlug, 
    addToCart, 
    navigateTo, 
    getCOAByBatch,
    setIsCartOpen 
  } = useStore();

  const product = products.find(p => p.slug === selectedProductSlug) || products[0];
  const [selectedVialMg, setSelectedVialMg] = useState<number>(product.defaultVialMg);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reconstitution' | 'chemical' | 'coa'>('overview');
  const [coaModalOpen, setCoaModalOpen] = useState(false);

  // High-fidelity Multi-angle Gallery State
  const galleryItems = useMemo(() => {
    return product ? getProductGallery(product) : [];
  }, [product]);

  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activePhoto = galleryItems[activeAngleIndex] || galleryItems[0];

  const selectedOption = product.vialOptions.find(o => o.mg === selectedVialMg) || product.vialOptions[0];
  const priceInr = selectedOption ? selectedOption.priceInr : product.priceInr;
  const originalPriceInr = selectedOption?.originalPriceInr || product.originalPriceInr;
  const priceNpr = selectedOption?.priceNpr || (product.priceNpr || Math.round(priceInr * 1.6));
  const originalPriceNpr = selectedOption?.originalPriceNpr || (product.originalPriceNpr || (originalPriceInr ? Math.round(originalPriceInr * 1.6) : undefined));
  const coa = getCOAByBatch(product.batchNumber);

  const handleAddToCart = () => {
    addToCart(product, selectedVialMg, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVialMg, quantity);
    setIsCartOpen(false);
    navigateTo('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#4B635A]">
        <button
          onClick={() => navigateTo('shop')}
          className="hover:text-[#0E2A23] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Catalog</span>
        </button>
        <span>/</span>
        <span className="text-[#0E2A23]">{product.categoryLabel}</span>
        {product.brand && (
          <>
            <span>/</span>
            <span className="text-[#0E2A23] font-medium">{product.brand}</span>
          </>
        )}
        <span>/</span>
        <span className="text-[#0E2A23] font-bold">{product.name}</span>
      </div>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Gallery & Multi-Angle Visual Showcase */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Main Visual Viewport */}
          <div className="aspect-4/3 bg-white rounded-3xl border border-[#CBD5CF] overflow-hidden relative shadow-sm group">
            <img
              src={activePhoto.url}
              alt={`${product.name} - ${activePhoto.title}`}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A1F19]/90 backdrop-blur-xs text-[#E3A81B] text-xs font-black shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{product.purityPercent}% HPLC Verified</span>
              </span>
              {product.brand && (
                <span className="inline-block px-3 py-1 rounded-full bg-[#0E2A23] text-white text-xs font-bold shadow-md">
                  Brand: {product.brand}
                </span>
              )}
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#0E2A23] text-[11px] font-mono font-bold shadow-xs">
                Lot: {product.batchNumber}
              </span>
            </div>

            {/* Angle Indicator Top-Right */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#0E2A23] text-[11px] font-bold shadow-xs border border-[#CBD5CF]">
                {activePhoto.badge}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#0E2A23] flex items-center justify-center shadow-md hover:scale-105 transition-all"
                title="Expand Fullscreen Studio View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Previous / Next Arrow Controls */}
            <button
              type="button"
              onClick={() => setActiveAngleIndex((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0E2A23] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Previous Angle"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveAngleIndex((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0E2A23] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Next Angle"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Multi-Angle Thumbnail Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#4B635A] px-1">
              <span>Studio Angles &amp; Quality Inspection</span>
              <span>{activeAngleIndex + 1} of {galleryItems.length} Views</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {galleryItems.map((item, idx) => {
                const isActive = activeAngleIndex === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveAngleIndex(idx)}
                    className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all p-1 bg-white ${
                      isActive 
                        ? 'border-[#0E2A23] ring-2 ring-[#0E2A23]/30 shadow-md scale-[1.02]' 
                        : 'border-[#CBD5CF] hover:border-[#6F877C] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#F2F5F3]">
                      <img 
                        src={item.url} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="mt-1 px-1">
                      <span className={`block text-[10px] font-bold truncate ${isActive ? 'text-[#0E2A23]' : 'text-[#4B635A]'}`}>
                        {item.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Angle Description Caption */}
            <div className="p-3 bg-[#F7F9F8] rounded-2xl border border-[#CBD5CF] text-xs text-[#4B635A] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
              <div>
                <strong className="font-bold text-[#0E2A23] block">{activePhoto.title}:</strong>
                <span className="leading-relaxed">{activePhoto.caption}</span>
              </div>
            </div>
          </div>

          {/* Lightbox Modal */}
          {isLightboxOpen && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
              <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#CBD5CF]">
                {/* Modal Header */}
                <div className="p-4 px-6 border-b border-[#CBD5CF] flex items-center justify-between bg-[#F7F9F8]">
                  <div>
                    <h3 className="font-black text-[#0E2A23] text-base">{product.name}</h3>
                    <p className="text-xs text-[#4B635A]">{activePhoto.title} · {activePhoto.badge}</p>
                  </div>
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="w-9 h-9 rounded-full bg-white border border-[#CBD5CF] flex items-center justify-center text-[#0E2A23] hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Main View */}
                <div className="p-4 sm:p-8 bg-neutral-900 flex items-center justify-center relative min-h-[400px]">
                  <img
                    src={activePhoto.url}
                    alt={activePhoto.title}
                    className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                  />
                  <button
                    onClick={() => setActiveAngleIndex((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1))}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#0E2A23] flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveAngleIndex((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0))}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#0E2A23] flex items-center justify-center shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Thumbnails */}
                <div className="p-4 bg-[#F7F9F8] border-t border-[#CBD5CF] flex items-center justify-center gap-3 overflow-x-auto">
                  {galleryItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveAngleIndex(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeAngleIndex === idx ? 'border-[#0E2A23] scale-105 shadow-sm' : 'border-gray-300 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Highlights Box */}
          <div className="bg-[#F7F9F8] rounded-2xl p-5 border border-[#CBD5CF] space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E2A23] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Delhi Partner Quality Verification</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#4B635A]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                <span>Sourced from Delhi Peptides Partner Company (Nepal Exclusive Partner)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                <span>Fixed price in Indian Currency (₹ INR) · Verifiable batch testing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                <span>Delivery Timeline: Minimum 10 days, usually within 14 days anywhere in Nepal</span>
              </li>
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#4B635A] uppercase tracking-wider">
                {product.categoryLabel}
              </span>
              {product.brand && (
                <span className="text-xs font-bold text-white bg-[#3F574D] px-2 py-0.5 rounded-full">
                  {product.brand}
                </span>
              )}
              {product.format && (
                <span className="text-xs font-semibold text-[#0E2A23] bg-[#F2F5F3] border border-[#CBD5CF] px-2 py-0.5 rounded-full">
                  {product.format}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0E2A23] tracking-tight mt-1">
              {product.name}
            </h1>
            <p className="text-xs text-[#4B635A] font-medium mt-1">
              {product.scientificName}
            </p>
          </div>

          {/* Pricing in INR with NPR Conversion */}
          <div className="bg-white p-4 rounded-2xl border border-[#CBD5CF] flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[#4B635A] block font-bold">Fixed Indian Currency (INR)</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-[#0E2A23]">
                  ₹ {priceInr.toLocaleString()}
                </span>
                {originalPriceInr && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹ {originalPriceInr.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium block mt-1">
                Approx. <strong>रू {priceNpr.toLocaleString()} NPR</strong> (at Nepal official peg 1:1.60)
              </span>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Delhi Partner Sourced
              </span>
              <p className="text-[11px] font-semibold text-[#C2362B] mt-1">Nepal Delivery: 10–14 Days</p>
            </div>
          </div>

          {/* Vial / Package Selector */}
          {product.vialOptions.length > 1 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0E2A23]">
                Select Option:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {product.vialOptions.map((opt) => (
                  <button
                    key={opt.mg}
                    onClick={() => setSelectedVialMg(opt.mg)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedVialMg === opt.mg
                        ? 'border-[#0E2A23] bg-[#E4EBE7] shadow-xs'
                        : 'border-[#CBD5CF] bg-white hover:bg-[#F2F5F3]'
                    }`}
                  >
                    <span className="font-bold text-sm text-[#0E2A23] block">
                      {opt.label}
                    </span>
                    <span className="text-xs font-semibold text-[#4B635A] mt-0.5 block">
                      ₹ {opt.priceInr.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#CBD5CF] bg-white rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-[#0E2A23] hover:bg-[#F2F5F3] rounded-l-xl font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-[#0E2A23] text-center w-12">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2.5 text-[#0E2A23] hover:bg-[#F2F5F3] rounded-r-xl font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#0E2A23] text-white hover:bg-[#10241E]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart (₹ {(priceInr * quantity).toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 rounded-xl bg-[#E3A81B] hover:bg-[#E3A81B] text-[#0A1F19] font-black text-sm shadow-sm transition-colors text-center"
            >
              Express Checkout (₹ {(priceInr * quantity).toLocaleString()}) →
            </button>
          </div>

          {/* Batch COA Quick Action */}
          {coa && (
            <div className="bg-[#E4EBE7] rounded-2xl p-4 border border-[#CBD5CF] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#0E2A23]">
                  Analytical Report: {coa.batchNumber}
                </p>
                <p className="text-[11px] text-[#4B635A]">
                  {coa.purityPercent}% Purity · Verified {coa.testDate}
                </p>
              </div>
              <button
                onClick={() => setCoaModalOpen(true)}
                className="px-3 py-1.5 bg-white text-[#0E2A23] text-xs font-bold rounded-lg border border-[#9FB2A8] hover:bg-[#F2F5F3]"
              >
                View Certificate (COA)
              </button>
            </div>
          )}

          {/* Brand One-Time Verification & Unboxing Video Policy */}
          <div className="bg-[#F7F9F8] border border-[#9FB2A8] rounded-2xl p-4 space-y-2 text-xs text-[#12352C]">
            <div className="flex items-center gap-1.5 font-bold text-[#0A1F19]">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Brand-Specific One-Time Verification &amp; Unboxing Video</span>
            </div>
            <p className="text-[11px] text-[#3F574D] leading-relaxed">
              Every genuine box features a <strong>one-time scratch-off security code</strong> to verify directly on the brand's official website (e.g. <em>Enhanced Pharmaceuticals</em>). Codes can only be redeemed once.
            </p>
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[10px] text-amber-900 space-y-1">
              <p>
                📹 <strong>Unboxing Video Requirement:</strong> We strongly recommend taking an uncut video of opening your delivery package and verifying the code. While our high-end supplies are 100% accurately dosed and a defect has never occurred, this video serves as proof to claim your money back if needed.
              </p>
              <p className="text-amber-800 italic">
                *Make your informed decision before purchasing. We are not responsible for your purchase or what you do with it.
              </p>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="text-[11px] text-[#4B635A] flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-[#CBD5CF]">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-none mt-0.5" />
            <p>
              Research &amp; educational standard. Follow sterile handling, proper reconstitution with Bacteriostatic Water, and cold chain storage.
            </p>
          </div>
        </div>

      </div>

      {/* ── Tabs for Detailed Specifications ── */}
      <div className="bg-white rounded-3xl border border-[#CBD5CF] overflow-hidden shadow-xs">
        
        {/* Tab Headers */}
        <div className="flex border-b border-[#CBD5CF] bg-[#F7F9F8] overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Science' },
            { id: 'reconstitution', label: 'Reconstitution & Storage' },
            { id: 'chemical', label: 'Chemical Data & Sequence' },
            { id: 'coa', label: 'Batch Analytical Report' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0E2A23] text-[#0E2A23] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 text-sm leading-relaxed text-[#10241E]">
          
          {activeTab === 'overview' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-bold text-[#0E2A23]">
                Preclinical Background &amp; Mechanisms
              </h3>
              <p className="text-[#4B635A] leading-relaxed">
                {product.description}
              </p>

              <div className="bg-[#F2F5F3] p-4 rounded-xl border border-[#CBD5CF] space-y-2 mt-4">
                <h4 className="font-bold text-xs text-[#0E2A23] uppercase tracking-wide">
                  Clinical Dosage Context in Academic Trials
                </h4>
                <p className="text-xs text-[#4B635A]">
                  {product.dosageExample}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reconstitution' && (
            <div className="space-y-6 max-w-3xl">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#0E2A23]">
                  How to Reconstitute Lyophilized Peptides
                </h3>
                <p className="text-xs text-[#4B635A]">
                  Recommended diluent: <strong className="text-[#0E2A23]">Bacteriostatic Water (0.9% Benzyl Alcohol)</strong>.
                </p>
              </div>

              <div className="bg-[#F2F5F3] p-5 rounded-2xl border border-[#CBD5CF] space-y-3 text-xs text-[#4B635A]">
                <h4 className="font-bold text-sm text-[#0E2A23]">Step-by-Step Sterile Mixing Guide:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Disinfect rubber stoppers of both vials with 70% isopropyl alcohol prep pads.</li>
                  <li>Using a sterile syringe, draw {product.reconstitutionWaterMl || 2.0} ml of Bacteriostatic Water.</li>
                  <li>Invert the peptide vial and introduce the needle at a 45-degree angle.</li>
                  <li>Slowly trickle the water down the interior glass wall. Do not inject directly onto the lyophilized cake.</li>
                  <li>Gently swirl the vial between your palms. Do NOT shake vigorously, as mechanical agitation can denature fragile peptide bonds.</li>
                  <li>Inspect for a completely clear, residue-free solution before refrigeration.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0E2A23] flex items-center gap-2">
                  <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
                  <span>Storage &amp; Temperature Control</span>
                </h4>
                <p className="text-xs text-[#4B635A] leading-relaxed">
                  {product.storageInstructions}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'chemical' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-bold text-[#0E2A23]">
                Biochemical &amp; Structural Data
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {product.casNumber && (
                  <div className="bg-[#F2F5F3] p-3 rounded-xl border border-[#CBD5CF]">
                    <span className="text-gray-400 block font-mono text-[10px] uppercase">CAS Registry Number</span>
                    <span className="font-bold text-gray-800 font-mono text-sm">{product.casNumber}</span>
                  </div>
                )}
                {product.molecularFormula && (
                  <div className="bg-[#F2F5F3] p-3 rounded-xl border border-[#CBD5CF]">
                    <span className="text-gray-400 block font-mono text-[10px] uppercase">Molecular Formula</span>
                    <span className="font-bold text-gray-800 font-mono">{product.molecularFormula}</span>
                  </div>
                )}
                {product.molecularWeight && (
                  <div className="bg-[#F2F5F3] p-3 rounded-xl border border-[#CBD5CF]">
                    <span className="text-gray-400 block font-mono text-[10px] uppercase">Molecular Mass</span>
                    <span className="font-bold text-gray-800 font-mono">{product.molecularWeight}</span>
                  </div>
                )}
                <div className="bg-[#F2F5F3] p-3 rounded-xl border border-[#CBD5CF]">
                  <span className="text-gray-400 block font-mono text-[10px] uppercase">Current Batch</span>
                  <span className="font-bold text-gray-800 font-mono">{product.batchNumber}</span>
                </div>
              </div>

              {product.sequence && (
                <div className="bg-[#F2F5F3] p-4 rounded-xl border border-[#CBD5CF] space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Amino Acid Sequence:
                  </span>
                  <code className="text-xs text-[#0E2A23] font-mono break-all block">
                    {product.sequence}
                  </code>
                </div>
              )}
            </div>
          )}

          {activeTab === 'coa' && coa && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0E2A23]">
                    Batch Certificate of Analysis: {coa.batchNumber}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tested by {coa.testingLab} on {coa.testDate}
                  </p>
                </div>
                <button
                  onClick={() => setCoaModalOpen(true)}
                  className="px-4 py-2 bg-[#0E2A23] text-white text-xs font-bold rounded-xl"
                >
                  Inspect Full Certificate
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F2F5F3] p-4 rounded-2xl border border-[#CBD5CF]">
                <div>
                  <span className="text-gray-400 block text-[10px]">HPLC Purity</span>
                  <span className="text-emerald-700 font-black text-base">{coa.purityPercent}%</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Heavy Metals</span>
                  <span className="text-gray-800 font-bold">{coa.heavyMetals}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Endotoxins</span>
                  <span className="text-gray-800 font-bold">{coa.endotoxinLevel}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Mass Confirmed</span>
                  <span className="text-gray-800 font-bold">{coa.molecularMassFound}</span>
                </div>
              </div>

              <p className="text-xs text-[#4B635A] italic">
                Notes: {coa.notes}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Certificate Modal */}
      {coaModalOpen && coa && (
        <COAModal coa={coa} onClose={() => setCoaModalOpen(false)} />
      )}

    </div>
  );
};
