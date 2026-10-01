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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 space-y-8">
      
      {/* Page Header */}
      <header className="pb-6 border-b border-[#CBD5CF]">
        <h1 className="text-4xl sm:text-5xl font-black text-[#0E2A23] leading-[1.05]">Shop</h1>
        <p className="mt-3 text-[17px] text-[#3F574D] max-w-[62ch]">
          Every batch has a purity test you can look up. Prices are fixed in Indian rupees, and delivery across Nepal takes 10 to 14 days.
        </p>
      </header>

      {/* Showcase Modal Lightbox */}
      {galleryModalImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#CBD5CF]">
            <div className="p-4 px-6 border-b border-[#CBD5CF] flex items-center justify-between bg-[#F7F9F8]">
              <div>
                <h3 className="font-black text-[#0E2A23] text-base">{galleryModalImage.title}</h3>
                <p className="text-xs text-[#4B635A]">{galleryModalImage.badge}</p>
              </div>
              <button
                onClick={() => setGalleryModalImage(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#CBD5CF] flex items-center justify-center text-[#0E2A23] hover:bg-gray-100"
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
            <div className="p-4 px-6 bg-[#F7F9F8] text-xs text-[#4B635A] border-t border-[#CBD5CF]">
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
                  ? 'bg-[#0E2A23] text-white shadow-xs'
                  : 'bg-white text-[#0E2A23] hover:bg-[#E4EBE7] border border-[#CBD5CF]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="font-bold text-[#4B635A] whitespace-nowrap flex items-center gap-1 pl-1">
            <Tag className="w-3.5 h-3.5" /> Brands:
          </span>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedBrand === b
                  ? 'bg-[#3F574D] text-white font-bold'
                  : 'bg-[#F2F5F3] text-[#0E2A23] hover:bg-[#E4EBE7] border border-[#CBD5CF]'
              }`}
            >
              {b === 'all' ? 'All Brands' : b}
            </button>
          ))}
        </div>

        {/* Search, Sort & Toggle Row */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBD5CF] shadow-xs space-y-3.5">
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
              <label className="flex items-center gap-2 text-xs font-semibold text-[#0E2A23] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0E2A23] focus:ring-0 accent-[#0E2A23]"
                />
                <span>In-Stock Only</span>
              </label>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-[#4B635A]">
                <span className="font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-[#F2F5F3] border border-[#CBD5CF] rounded-xl text-xs font-bold text-[#0E2A23] focus:outline-none"
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
          <div className="bg-[#E4EBE7] border border-[#CBD5CF] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-[#0E2A23]">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-800" />
              <span>
                Filtering by peptide name: <strong className="text-[#0A1F19]">"{searchQuery}"</strong> ({sortedProducts.length} {sortedProducts.length === 1 ? 'result' : 'results'} found)
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E2A23] hover:text-[#0A1F19] bg-white px-2 py-0.5 rounded-md border border-[#CBD5CF] transition-colors"
            >
              <X className="w-3 h-3" /> Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Prominent Shipping Notice, Upfront Payment Policy & GHRP Update Banner */}
      <div className="bg-[#F7F9F8] border-2 border-[#CBD5CF] rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E4EBE7] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="font-black text-[#0A1F19] block text-sm sm:text-base">
                Delhi Partner Sourced · 100% Upfront Payment Required (Strictly NO COD)
              </span>
              <span className="text-xs text-[#4B635A]">
                Orders are placed only after complete payment. Shipping &amp; Handling is flat <strong>₹4,500 INR (~ रू 7,200 NPR)</strong> extra per order for temperature-controlled cold-chain transit across Nepal (minimum 10 to 14 days).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#0E2A23] text-white font-bold text-xs tracking-wide">
              ₹4,500 Flat Shipping
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-red-100 text-red-800 font-bold text-xs">
              No COD
            </span>
          </div>
        </div>

        {/* Dynamic Pricing, Unlisted Items & Chat Policy Strip */}
        <div className="bg-[#E4EBE7] rounded-xl p-4 border border-[#9FB2A8] space-y-2 text-xs text-[#10241E]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#0E2A23] text-white text-[10px] font-bold uppercase tracking-wider">
                  Live Sourcing Notice
                </span>
                <span className="font-black text-sm text-[#0A1F19]">
                  Prices Fluctuate Constantly · Ask for Anything Specific (Peptides &amp; AAs)
                </span>
              </div>
              <p className="text-[11px] text-[#1B4A3C] leading-relaxed">
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

          <div className="pt-2 border-t border-[#CBD5CF] flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/80">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Strict Chat Policy:</strong> Direct WhatsApp and phone chats are <strong>strictly for sales enquiries, order placement, and payment QR</strong>. No spam or general information-only queries. Do your own research — read the extensive evidence guides, dosage calculators, and research summaries on this website and on our Instagram (<a href="https://instagram.com/peptidesnepal" target="_blank" rel="noopener noreferrer" className="font-bold underline text-amber-950">@peptidesnepal</a>) for information on various peptides and Amino Acids (AAs).
            </div>
          </div>
        </div>

        {/* Specialized sourcing note: Anabolics, SERMs, SARMs, HCG, AIs */}
        <div className="bg-white rounded-xl p-3 border border-[#CBD5CF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0E2A23]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Specialty Direct Sourcing:</strong> Anabolics, SERMs, SARMs, HCG, and Aromatase Inhibitors (AIs) all available directly through our Delhi partner. If interested, contact our team directly for complete private rate lists.
            </span>
          </div>
          <button
            onClick={() => navigateTo('contact')}
            className="px-4 py-1.5 rounded-lg bg-[#0E2A23] hover:bg-[#0A1F19] text-white font-bold text-xs whitespace-nowrap self-start sm:self-center transition-all shadow-xs"
          >
            Inquire with Partner →
          </button>
        </div>
      </div>

      {/* Results Count Strip */}
      <div className="flex items-center justify-between text-xs text-[#4B635A]">
        <span>Showing <strong>{sortedProducts.length}</strong> verified products</span>
        <span className="flex items-center gap-1.5 font-semibold text-[#0E2A23]">
          <Truck className="w-3.5 h-3.5 text-[#C2362B]" />
          Delhi Transit to Nepal: 10–14 Days Guaranteed
        </span>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#CBD5CF] space-y-3">
          <p className="text-base font-bold text-[#0E2A23]">No products found matching your criteria</p>
          <p className="text-xs text-[#4B635A]">Try clearing your search terms or changing brand/category filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className="px-4 py-2 rounded-full bg-[#0E2A23] text-white text-xs font-bold mt-2"
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
      <div className="bg-[#E4EBE7] rounded-2xl p-6 border border-[#CBD5CF] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#0E2A23]">
        <div className="space-y-1">
          <strong className="block font-bold">Delhi Partner Sourcing:</strong>
          <p className="text-[#4B635A]">
            All peptide products are directly sourced through our exclusive Nepal partnership with premier Delhi peptides suppliers.
          </p>
        </div>
        <div className="space-y-1">
          <strong className="block font-bold">10 to 14 Days Nepal Transit:</strong>
          <p className="text-[#4B635A]">
            Orders take a minimum of 10 days and typically arrive within 14 days with verified cold-chain and insured delivery.
          </p>
        </div>
        <div className="space-y-1">
          <strong className="block font-bold">Fixed Indian Rupee Pricing:</strong>
          <p className="text-[#4B635A]">
            All prices are fixed in INR (₹). Active offers and discount codes are posted online here to ensure complete transparency.
          </p>
        </div>
      </div>

    </div>
  );
};
