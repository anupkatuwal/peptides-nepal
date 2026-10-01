import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { 
  BRAND_IMAGES, 
  createBpc157PackshotSvg, 
  createSemaglutidePackshotSvg 
} from '../assets/productImages';
import { 
  Search, 
  SlidersHorizontal, 
  ShieldCheck, 
  Sparkles, 
  Filter, 
  Truck, 
  Tag, 
  AlertTriangle, 
  MessageSquare, 
  Phone, 
  X,
  Eye,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { products, navigateTo } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'purity'>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showVisualGallery, setShowVisualGallery] = useState(true);
  const [galleryModalImage, setGalleryModalImage] = useState<{ url: string; title: string; desc: string; badge: string } | null>(null);

  // Showcase Gallery Cards
  const showcaseCards = [
    {
      id: 'showcase-bpc',
      title: 'BPC-157 Healing Series',
      brand: 'Gold Bond Rado & Denik Pharma',
      image: createBpc157PackshotSvg('Gold Bond Rado'),
      badge: '≥99.7% HPLC Pure',
      tag: 'Cellular Repair',
      desc: 'Authentic sealed borosilicate vials with verified chromatographic test certificates and lot authentication.',
      categoryFilter: 'recovery',
      searchFilter: 'BPC'
    },
    {
      id: 'showcase-sema',
      title: 'Semaglutide & GLP-1 Series',
      brand: 'Sun Pharma & Metabolic Labs',
      image: createSemaglutidePackshotSvg('Sun Pharma'),
      badge: '2°C–8°C Cold Chain',
      tag: 'Metabolic & Retatrutide',
      desc: 'Pharmaceutical peptide formulation shipped in insulated thermal carriers directly from Delhi to Nepal.',
      categoryFilter: 'metabolic',
      searchFilter: 'Semaglutide'
    },
    {
      id: 'showcase-ghrp',
      title: 'Somatropin & GHRP Complete Kits',
      brand: 'Enhanced Pharma & Anabolic Monster',
      image: BRAND_IMAGES.ghrpKit,
      badge: '10-Vial Clinical Tray',
      tag: 'Growth Factor & HGH',
      desc: 'Complete 10-vial boxed sets with matching diluent ampoules, tamper-evident seals, and scratch-off QR verification.',
      categoryFilter: 'secretagogues',
      searchFilter: 'GHRP'
    },
    {
      id: 'showcase-supplies',
      title: 'Sterile Diluent & Essentials',
      brand: 'USP Grade Medical Tier',
      image: BRAND_IMAGES.supplies,
      badge: 'USP 0.9% Bac Water',
      tag: 'Preparation Kit',
      desc: '30ml sterile Bacteriostatic Water multi-dose vials, 31G U-100 precision syringes, and 70% IPA prep pads.',
      categoryFilter: 'supplies',
      searchFilter: 'Water'
    }
  ];

  // Extract unique brands
  const brands = ['all', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[]];

  // Filter products
  const filteredProducts = products.filter(product => {
    // Category
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    // Brand
    if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
      return false;
    }
    // In-stock
    if (inStockOnly && !product.inStock) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand?.toLowerCase().includes(q);
      const matchSci = product.scientificName?.toLowerCase().includes(q);
      const matchBatch = product.batchNumber.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchSci && !matchBatch && !matchDesc) {
        return false;
      }
    }
    return true;
  });

  // Sort products by INR price
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceInr - b.priceInr;
    if (sortBy === 'price-desc') return b.priceInr - a.priceInr;
    if (sortBy === 'purity') return b.purityPercent - a.purityPercent;
    // default: popular
    return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-[#DCE3CE] pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEBD9] text-[#3E481D] text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Official Nepal Partner · Delhi Peptides Sourced · Fixed INR (₹)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#3E481D] tracking-tight">
          Official Peptide Catalog &amp; June Rate Lists
        </h1>
        <p className="text-sm text-[#5f6b3a] max-w-3xl leading-relaxed">
          Sourced directly from our Delhi partner company with fixed prices in Indian Currency (₹). All orders delivered across Nepal take a minimum of 10 days and typically arrive within 14 days. Active discounts and promotional codes are posted online here.
        </p>
      </div>

      {/* Flagship Peptide Photography Showcase & Visual Gallery */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DCE3CE] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEBD9] text-[#3E481D] text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Verified Studio Photography Gallery</span>
              </span>
              <span className="text-xs text-[#707E46] font-medium hidden sm:inline">
                · Consistent Laboratory Packshots
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#3E481D] tracking-tight mt-1">
              Featured Flagship Product Photography
            </h2>
            <p className="text-xs text-[#5f6b3a]">
              Inspect high-resolution packshots, lyophilized vial details, and cold-chain packaging for BPC-157, Semaglutide, and complete kits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowVisualGallery(!showVisualGallery)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-[#DCE3CE] bg-[#F4F4EA] hover:bg-[#EAEBD9] text-xs font-bold text-[#3E481D] flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showVisualGallery ? 'Collapse Gallery' : 'Expand Visual Gallery'}</span>
          </button>
        </div>

        {showVisualGallery && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {showcaseCards.map((card) => (
              <div
                key={card.id}
                className="group relative bg-[#F8FAF5] rounded-2xl border border-[#DCE3CE] overflow-hidden hover:border-[#3E481D] hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image Container with Hover Inspect */}
                <div className="relative aspect-4/3 overflow-hidden bg-white">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1E230E]/85 backdrop-blur-xs text-[#A0D468] text-[10px] font-black">
                      {card.badge}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryModalImage({
                        url: card.image,
                        title: card.title,
                        desc: card.desc,
                        badge: card.badge
                      });
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#3E481D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Inspect High-Res Packshot"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Details & Quick Filter Link */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#707E46]">
                      {card.brand}
                    </span>
                    <h3 className="font-black text-[#3E481D] text-sm group-hover:text-emerald-800 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-[#5f6b3a] line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(card.categoryFilter);
                      setSearchQuery(card.searchFilter);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-white border border-[#DCE3CE] group-hover:bg-[#3E481D] group-hover:text-white group-hover:border-[#3E481D] text-xs font-bold text-[#3E481D] flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span>Filter &amp; View Items</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Showcase Modal Lightbox */}
      {galleryModalImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#DCE3CE]">
            <div className="p-4 px-6 border-b border-[#DCE3CE] flex items-center justify-between bg-[#F8FAF5]">
              <div>
                <h3 className="font-black text-[#3E481D] text-base">{galleryModalImage.title}</h3>
                <p className="text-xs text-[#707E46]">{galleryModalImage.badge}</p>
              </div>
              <button
                onClick={() => setGalleryModalImage(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#DCE3CE] flex items-center justify-center text-[#3E481D] hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 bg-neutral-900 flex items-center justify-center">
              <img
                src={galleryModalImage.url}
                alt={galleryModalImage.title}
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="p-4 px-6 bg-[#F8FAF5] text-xs text-[#5f6b3a] border-t border-[#DCE3CE]">
              {galleryModalImage.desc}
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Categories, Brands, Search & Sort */}
      <div className="space-y-4">
        {/* Category Pills with live item counts */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Items (${products.length})` },
            { id: 'secretagogues', label: `GHRP & CJC/Ipam (${products.filter(p => p.category === 'secretagogues').length})` },
            { id: 'recovery', label: `BPC-157 & Recovery (${products.filter(p => p.category === 'recovery').length})` },
            { id: 'hgh', label: `HGH Somatropin (${products.filter(p => p.category === 'hgh').length})` },
            { id: 'metabolic', label: `Metabolic & Retatrutide (${products.filter(p => p.category === 'metabolic').length})` },
            { id: 'longevity', label: `Longevity & Skin (${products.filter(p => p.category === 'longevity').length})` },
            { id: 'supplies', label: `Supplies (${products.filter(p => p.category === 'supplies').length})` }
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

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="font-bold text-[#707E46] whitespace-nowrap flex items-center gap-1 pl-1">
            <Tag className="w-3.5 h-3.5" /> Brands:
          </span>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedBrand === b
                  ? 'bg-[#56652C] text-white font-bold'
                  : 'bg-[#F4F4EA] text-[#3E481D] hover:bg-[#EAEBD9] border border-[#DCE3CE]'
              }`}
            >
              {b === 'all' ? 'All Brands' : b}
            </button>
          ))}
        </div>

        {/* Search, Sort & Toggle Row */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE3CE] shadow-xs space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            {/* Search Bar Component */}
            <div className="flex-1 w-full">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search peptides by name (e.g. BPC-157, Retatrutide, HGH, GHRP-6, Ipamorelin, Semaglutide)..."
                totalResults={sortedProducts.length}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end lg:self-start pt-1">
              {/* In-Stock Only checkbox */}
              <label className="flex items-center gap-2 text-xs font-semibold text-[#3E481D] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3E481D] focus:ring-0 accent-[#3E481D]"
                />
                <span>In-Stock Only</span>
              </label>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-[#707E46]">
                <span className="font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-xs font-bold text-[#3E481D] focus:outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price (INR): Low to High</option>
                  <option value="price-desc">Price (INR): High to Low</option>
                  <option value="purity">HPLC Purity (Highest)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Active Search Filter Banner */}
        {searchQuery.trim() && (
          <div className="bg-[#EAEBD9] border border-[#DCE3CE] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-[#3E481D]">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-800" />
              <span>
                Filtering by peptide name: <strong className="text-[#1E230E]">"{searchQuery}"</strong> ({sortedProducts.length} {sortedProducts.length === 1 ? 'result' : 'results'} found)
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3E481D] hover:text-[#1E230E] bg-white px-2 py-0.5 rounded-md border border-[#DCE3CE] transition-colors"
            >
              <X className="w-3 h-3" /> Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Prominent Shipping Notice, Upfront Payment Policy & GHRP Update Banner */}
      <div className="bg-[#FAF7EE] border-2 border-[#DCE3CE] rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EAEBD9] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="font-black text-[#1E230E] block text-sm sm:text-base">
                Delhi Partner Sourced · 100% Upfront Payment Required (Strictly NO COD)
              </span>
              <span className="text-xs text-[#5f6b3a]">
                Orders are placed only after complete payment. Shipping &amp; Handling is flat <strong>₹4,500 INR (~ रू 7,200 NPR)</strong> extra per order for temperature-controlled cold-chain transit across Nepal (minimum 10 to 14 days).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#3E481D] text-white font-bold text-xs tracking-wide">
              ₹4,500 Flat Shipping
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-red-100 text-red-800 font-bold text-xs">
              No COD
            </span>
          </div>
        </div>

        {/* Dynamic Pricing, Unlisted Items & Chat Policy Strip */}
        <div className="bg-[#EAEBD9] rounded-xl p-4 border border-[#B7C29E] space-y-2 text-xs text-[#2A3312]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#3E481D] text-white text-[10px] font-bold uppercase tracking-wider">
                  Live Sourcing Notice
                </span>
                <span className="font-black text-sm text-[#1E230E]">
                  Prices Fluctuate Constantly · Ask for Anything Specific (Peptides &amp; AAs)
                </span>
              </div>
              <p className="text-[11px] text-[#475424] leading-relaxed">
                Because laboratory synthesis batches and currency exchange shift regularly, product prices change constantly and <strong>not all peptides, blends, or Amino Acids (AAs) are listed on this website</strong>. If you need a specific peptide or compound, ask us directly for live availability and quote.
              </p>
            </div>
            <a
              href="https://wa.me/9779808318864?text=Namaste!%20I%20have%20a%20specific%20sales%20enquiry%20%2F%20unlisted%20peptide%20sourcing%20request."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs whitespace-nowrap self-start lg:self-center transition-all shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <span>Ask for Unlisted Peptides (+977 9808318864)</span>
            </a>
          </div>

          <div className="pt-2 border-t border-[#DCE3CE] flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/80">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Strict Chat Policy:</strong> Direct WhatsApp and phone chats are <strong>strictly for sales enquiries, order placement, and payment QR</strong>. No spam or general information-only queries. Do your own research — read the extensive evidence guides, dosage calculators, and research summaries on this website and on our Instagram (<a href="https://instagram.com/peptidesnepal" target="_blank" rel="noopener noreferrer" className="font-bold underline text-amber-950">@peptidesnepal</a>) for information on various peptides and Amino Acids (AAs).
            </div>
          </div>
        </div>

        {/* Specialized sourcing note: Anabolics, SERMs, SARMs, HCG, AIs */}
        <div className="bg-white rounded-xl p-3 border border-[#DCE3CE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#3E481D]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Specialty Direct Sourcing:</strong> Anabolics, SERMs, SARMs, HCG, and Aromatase Inhibitors (AIs) all available directly through our Delhi partner. If interested, contact our team directly for complete private rate lists.
            </span>
          </div>
          <button
            onClick={() => navigateTo('contact')}
            className="px-4 py-1.5 rounded-lg bg-[#3E481D] hover:bg-[#283011] text-white font-bold text-xs whitespace-nowrap self-start sm:self-center transition-all shadow-xs"
          >
            Inquire with Partner →
          </button>
        </div>
      </div>

      {/* Results Count Strip */}
      <div className="flex items-center justify-between text-xs text-[#707E46]">
        <span>Showing <strong>{sortedProducts.length}</strong> verified products</span>
        <span className="flex items-center gap-1.5 font-semibold text-[#3E481D]">
          <Truck className="w-3.5 h-3.5 text-[#DC143C]" />
          Delhi Transit to Nepal: 10–14 Days Guaranteed
        </span>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#DCE3CE] space-y-3">
          <p className="text-base font-bold text-[#3E481D]">No products found matching your criteria</p>
          <p className="text-xs text-[#707E46]">Try clearing your search terms or changing brand/category filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className="px-4 py-2 rounded-full bg-[#3E481D] text-white text-xs font-bold mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Nepal Delivery & Delhi Partner Sourcing Notice */}
      <div className="bg-[#EAEBD9] rounded-2xl p-6 border border-[#DCE3CE] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#3E481D]">
        <div className="space-y-1">
          <strong className="block font-bold">Delhi Partner Sourcing:</strong>
          <p className="text-[#5f6b3a]">
            All peptide products are directly sourced through our exclusive Nepal partnership with premier Delhi peptides suppliers.
          </p>
        </div>
        <div className="space-y-1">
          <strong className="block font-bold">10 to 14 Days Nepal Transit:</strong>
          <p className="text-[#5f6b3a]">
            Orders take a minimum of 10 days and typically arrive within 14 days with verified cold-chain and insured delivery.
          </p>
        </div>
        <div className="space-y-1">
          <strong className="block font-bold">Fixed Indian Rupee Pricing:</strong>
          <p className="text-[#5f6b3a]">
            All prices are fixed in INR (₹). Active offers and discount codes are posted online here to ensure complete transparency.
          </p>
        </div>
      </div>

    </div>
  );
};
