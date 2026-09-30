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
      <div className="flex items-center gap-2 text-xs font-semibold text-[#707E46]">
        <button
          onClick={() => navigateTo('shop')}
          className="hover:text-[#3E481D] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Catalog</span>
        </button>
        <span>/</span>
        <span className="text-[#3E481D]">{product.categoryLabel}</span>
        {product.brand && (
          <>
            <span>/</span>
            <span className="text-[#3E481D] font-medium">{product.brand}</span>
          </>
        )}
        <span>/</span>
        <span className="text-[#3E481D] font-bold">{product.name}</span>
      </div>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Gallery & Multi-Angle Visual Showcase */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Main Visual Viewport */}
          <div className="aspect-4/3 bg-white rounded-3xl border border-[#DCE3CE] overflow-hidden relative shadow-sm group">
            <img
              src={activePhoto.url}
              alt={`${product.name} - ${activePhoto.title}`}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E230E]/90 backdrop-blur-xs text-[#A0D468] text-xs font-black shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{product.purityPercent}% HPLC Verified</span>
              </span>
              {product.brand && (
                <span className="inline-block px-3 py-1 rounded-full bg-[#3E481D] text-white text-xs font-bold shadow-md">
                  Brand: {product.brand}
                </span>
              )}
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#3E481D] text-[11px] font-mono font-bold shadow-xs">
                Lot: {product.batchNumber}
              </span>
            </div>

            {/* Angle Indicator Top-Right */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#3E481D] text-[11px] font-bold shadow-xs border border-[#DCE3CE]">
                {activePhoto.badge}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#3E481D] flex items-center justify-center shadow-md hover:scale-105 transition-all"
                title="Expand Fullscreen Studio View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Previous / Next Arrow Controls */}
            <button
              type="button"
              onClick={() => setActiveAngleIndex((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#3E481D] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Previous Angle"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveAngleIndex((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#3E481D] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Next Angle"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Multi-Angle Thumbnail Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#707E46] px-1">
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
                        ? 'border-[#3E481D] ring-2 ring-[#3E481D]/30 shadow-md scale-[1.02]' 
                        : 'border-[#DCE3CE] hover:border-[#8E9B66] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#F4F4EA]">
                      <img 
                        src={item.url} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="mt-1 px-1">
                      <span className={`block text-[10px] font-bold truncate ${isActive ? 'text-[#3E481D]' : 'text-[#707E46]'}`}>
                        {item.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Angle Description Caption */}
            <div className="p-3 bg-[#F4F6EE] rounded-2xl border border-[#DCE3CE] text-xs text-[#5f6b3a] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
              <div>
                <strong className="font-bold text-[#3E481D] block">{activePhoto.title}:</strong>
                <span className="leading-relaxed">{activePhoto.caption}</span>
              </div>
            </div>
          </div>

          {/* Lightbox Modal */}
          {isLightboxOpen && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
              <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#DCE3CE]">
                {/* Modal Header */}
                <div className="p-4 px-6 border-b border-[#DCE3CE] flex items-center justify-between bg-[#F8FAF5]">
                  <div>
                    <h3 className="font-black text-[#3E481D] text-base">{product.name}</h3>
                    <p className="text-xs text-[#707E46]">{activePhoto.title} · {activePhoto.badge}</p>
                  </div>
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="w-9 h-9 rounded-full bg-white border border-[#DCE3CE] flex items-center justify-center text-[#3E481D] hover:bg-gray-100"
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
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#3E481D] flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveAngleIndex((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0))}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#3E481D] flex items-center justify-center shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Thumbnails */}
                <div className="p-4 bg-[#F8FAF5] border-t border-[#DCE3CE] flex items-center justify-center gap-3 overflow-x-auto">
                  {galleryItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveAngleIndex(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeAngleIndex === idx ? 'border-[#3E481D] scale-105 shadow-sm' : 'border-gray-300 opacity-60 hover:opacity-100'
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
          <div className="bg-[#F8FAF5] rounded-2xl p-5 border border-[#DCE3CE] space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E481D] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Delhi Partner Quality Verification</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#5f6b3a]">
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
              <span className="text-xs font-bold text-[#707E46] uppercase tracking-wider">
                {product.categoryLabel}
              </span>
              {product.brand && (
                <span className="text-xs font-bold text-white bg-[#56652C] px-2 py-0.5 rounded-full">
                  {product.brand}
                </span>
              )}
              {product.format && (
                <span className="text-xs font-semibold text-[#3E481D] bg-[#F4F4EA] border border-[#DCE3CE] px-2 py-0.5 rounded-full">
                  {product.format}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#3E481D] tracking-tight mt-1">
              {product.name}
            </h1>
            <p className="text-xs text-[#707E46] font-medium mt-1">
              {product.scientificName}
            </p>
          </div>

          {/* Pricing in INR with NPR Conversion */}
          <div className="bg-white p-4 rounded-2xl border border-[#DCE3CE] flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[#707E46] block font-bold">Fixed Indian Currency (INR)</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-[#3E481D]">
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
              <p className="text-[11px] font-semibold text-[#DC143C] mt-1">Nepal Delivery: 10–14 Days</p>
            </div>
          </div>

          {/* Vial / Package Selector */}
          {product.vialOptions.length > 1 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#3E481D]">
                Select Option:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {product.vialOptions.map((opt) => (
                  <button
                    key={opt.mg}
                    onClick={() => setSelectedVialMg(opt.mg)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedVialMg === opt.mg
                        ? 'border-[#3E481D] bg-[#EAEBD9] shadow-xs'
                        : 'border-[#DCE3CE] bg-white hover:bg-[#F4F4EA]'
                    }`}
                  >
                    <span className="font-bold text-sm text-[#3E481D] block">
                      {opt.label}
                    </span>
                    <span className="text-xs font-semibold text-[#707E46] mt-0.5 block">
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
              <div className="flex items-center border border-[#DCE3CE] bg-white rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-[#3E481D] hover:bg-[#F4F4EA] rounded-l-xl font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-[#3E481D] text-center w-12">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2.5 text-[#3E481D] hover:bg-[#F4F4EA] rounded-r-xl font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#3E481D] text-white hover:bg-[#2A3312]'
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
              className="w-full py-3.5 rounded-xl bg-[#A0D468] hover:bg-[#8EC850] text-[#1E230E] font-black text-sm shadow-sm transition-colors text-center"
            >
              Express Checkout (₹ {(priceInr * quantity).toLocaleString()}) →
            </button>
          </div>

          {/* Batch COA Quick Action */}
          {coa && (
            <div className="bg-[#EAEBD9] rounded-2xl p-4 border border-[#DCE3CE] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#3E481D]">
                  Analytical Report: {coa.batchNumber}
                </p>
                <p className="text-[11px] text-[#707E46]">
                  {coa.purityPercent}% Purity · Verified {coa.testDate}
                </p>
              </div>
              <button
                onClick={() => setCoaModalOpen(true)}
                className="px-3 py-1.5 bg-white text-[#3E481D] text-xs font-bold rounded-lg border border-[#B7C29E] hover:bg-[#F4F4EA]"
              >
                View Certificate (COA)
              </button>
            </div>
          )}

          {/* Brand One-Time Verification & Unboxing Video Policy */}
          <div className="bg-[#FAF7EE] border border-[#B7C29E] rounded-2xl p-4 space-y-2 text-xs text-[#2B3314]">
            <div className="flex items-center gap-1.5 font-bold text-[#1E230E]">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Brand-Specific One-Time Verification &amp; Unboxing Video</span>
            </div>
            <p className="text-[11px] text-[#56652C] leading-relaxed">
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
          <div className="text-[11px] text-[#707E46] flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-[#DCE3CE]">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-none mt-0.5" />
            <p>
              Research &amp; educational standard. Follow sterile handling, proper reconstitution with Bacteriostatic Water, and cold chain storage.
            </p>
          </div>
        </div>

      </div>

      {/* ── Tabs for Detailed Specifications ── */}
      <div className="bg-white rounded-3xl border border-[#DCE3CE] overflow-hidden shadow-xs">
        
        {/* Tab Headers */}
        <div className="flex border-b border-[#DCE3CE] bg-[#F8FAF5] overflow-x-auto">
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
                  ? 'border-[#3E481D] text-[#3E481D] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 text-sm leading-relaxed text-[#2A3312]">
          
          {activeTab === 'overview' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-bold text-[#3E481D]">
                Preclinical Background &amp; Mechanisms
              </h3>
              <p className="text-[#5f6b3a] leading-relaxed">
                {product.description}
              </p>

              <div className="bg-[#F4F4EA] p-4 rounded-xl border border-[#DCE3CE] space-y-2 mt-4">
                <h4 className="font-bold text-xs text-[#3E481D] uppercase tracking-wide">
                  Clinical Dosage Context in Academic Trials
                </h4>
                <p className="text-xs text-[#5f6b3a]">
                  {product.dosageExample}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reconstitution' && (
            <div className="space-y-6 max-w-3xl">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#3E481D]">
                  How to Reconstitute Lyophilized Peptides
                </h3>
                <p className="text-xs text-[#5f6b3a]">
                  Recommended diluent: <strong className="text-[#3E481D]">Bacteriostatic Water (0.9% Benzyl Alcohol)</strong>.
                </p>
              </div>

              <div className="bg-[#F4F4EA] p-5 rounded-2xl border border-[#DCE3CE] space-y-3 text-xs text-[#5f6b3a]">
                <h4 className="font-bold text-sm text-[#3E481D]">Step-by-Step Sterile Mixing Guide:</h4>
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
                <h4 className="font-bold text-sm text-[#3E481D] flex items-center gap-2">
                  <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
                  <span>Storage &amp; Temperature Control</span>
                </h4>
                <p className="text-xs text-[#5f6b3a] leading-relaxed">
                  {product.storageInstructions}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'chemical' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-bold text-[#3E481D]">
                Biochemical &amp; Structural Data
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {product.casNumber && (
                  <div className="bg-[#F4F4EA] p-3 rounded-xl border border-[#DCE3CE]">
                    <span className="text-gray-400 block font-mono text-[10px] uppercase">CAS Registry Number</span>
                    <span className="font-bold text-gray-800 font-mono text-sm">{product.casNumber}</span>
                  </div>
                )}
                {product.molecularFormula && (
                  <div className="bg-[#F4F4EA] p-3 rounded-xl border border-[#DCE3CE]">
                    <span className="text-gray-400 block font-mono text-[10px] uppercase">Molecular Formula</span>
                    <span className="font-bold text-gray-800 font-mono">{product.molecularFormula}</span>
                  </div>
                )}
                {product.molecularWeight && (
                  <div className="bg-[#F4F4EA] p-3 rounded-xl border border-[#DCE3CE]">
                    <span className="text-gray-400 block font-mono text-[10px] uppercase">Molecular Mass</span>
                    <span className="font-bold text-gray-800 font-mono">{product.molecularWeight}</span>
                  </div>
                )}
                <div className="bg-[#F4F4EA] p-3 rounded-xl border border-[#DCE3CE]">
                  <span className="text-gray-400 block font-mono text-[10px] uppercase">Current Batch</span>
                  <span className="font-bold text-gray-800 font-mono">{product.batchNumber}</span>
                </div>
              </div>

              {product.sequence && (
                <div className="bg-[#F4F4EA] p-4 rounded-xl border border-[#DCE3CE] space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Amino Acid Sequence:
                  </span>
                  <code className="text-xs text-[#3E481D] font-mono break-all block">
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
                  <h3 className="text-lg font-bold text-[#3E481D]">
                    Batch Certificate of Analysis: {coa.batchNumber}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tested by {coa.testingLab} on {coa.testDate}
                  </p>
                </div>
                <button
                  onClick={() => setCoaModalOpen(true)}
                  className="px-4 py-2 bg-[#3E481D] text-white text-xs font-bold rounded-xl"
                >
                  Inspect Full Certificate
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F4F4EA] p-4 rounded-2xl border border-[#DCE3CE]">
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

              <p className="text-xs text-[#5f6b3a] italic">
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
