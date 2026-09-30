import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getBrandImage } from '../assets/productImages';
import { ShoppingBag, ShieldCheck, Check, Sparkles, Truck, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, navigateTo } = useStore();
  const [selectedVialMg, setSelectedVialMg] = useState<number>(product.defaultVialMg);
  const [isAdded, setIsAdded] = useState(false);

  const brandImage = (product.image && !product.image.includes('unsplash'))
    ? product.image
    : getBrandImage(product.brand, product.name, product.category);

  const selectedOption = product.vialOptions.find(o => o.mg === selectedVialMg) || product.vialOptions[0];
  const priceInr = selectedOption ? selectedOption.priceInr : product.priceInr;
  const originalPriceInr = selectedOption?.originalPriceInr || product.originalPriceInr;
  const priceNpr = selectedOption?.priceNpr || (product.priceNpr || Math.round(priceInr * 1.6));
  const originalPriceNpr = selectedOption?.originalPriceNpr || (product.originalPriceNpr || (originalPriceInr ? Math.round(originalPriceInr * 1.6) : undefined));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedVialMg, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleCardClick = () => {
    navigateTo('product-detail', { slug: product.slug });
  };

  return (
    <article 
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-[#DCE3CE] overflow-hidden hover:shadow-xl hover:border-[#B7C29E] transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Media & Badges */}
      <div className="relative aspect-4/3 bg-[#F0F0E0] overflow-hidden">
        <img 
          src={brandImage} 
          alt={`${product.brand || 'Peptides Nepal'} - ${product.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getBrandImage(product.brand, product.name, product.category);
          }}
        />

        {/* Purity & Category Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E230E]/85 backdrop-blur-xs text-[#A0D468] text-[11px] font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            {product.purityPercent}% HPLC
          </span>
          {product.brand && (
            <span className="px-2 py-0.5 rounded-full bg-[#3E481D] text-white text-[10px] font-bold tracking-wide shadow-xs">
              {product.brand}
            </span>
          )}
          {product.activeOffer && (
            <span className="px-2 py-0.5 rounded-full bg-[#DC143C] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              {product.activeOffer}
            </span>
          )}
        </div>

        {/* Delivery Timeline Tag (Delhi Partner Sourced) */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#3E481D] shadow-xs border border-[#DCE3CE]">
            <Truck className="w-3.5 h-3.5 text-[#DC143C]" />
            Min. 10–14 Days Shipping
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-[#707E46] mb-1 font-medium">
            <span>{product.categoryLabel}</span>
            <span className="font-mono text-[10px] text-gray-500">{product.batchNumber}</span>
          </div>

          <h3 className="font-bold text-base sm:text-lg text-[#3E481D] group-hover:text-[#262D11] transition-colors leading-snug">
            {product.name}
          </h3>

          {product.format && (
            <span className="inline-block mt-1 text-[11px] font-semibold text-[#56652C] bg-[#F4F4EA] px-2 py-0.5 rounded-md">
              {product.format}
            </span>
          )}

          <p className="text-xs text-[#5f6b3a] line-clamp-2 mt-1 leading-relaxed">
            {product.shortDesc}
          </p>
        </div>

        {/* Vial Size Selector */}
        {product.vialOptions.length > 1 && (
          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] font-semibold text-[#707E46] mb-1.5">Select Option:</p>
            <div className="flex gap-1.5 flex-wrap">
              {product.vialOptions.map((opt) => (
                <button
                  key={opt.mg}
                  onClick={() => setSelectedVialMg(opt.mg)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedVialMg === opt.mg
                      ? 'bg-[#3E481D] text-white font-bold shadow-xs'
                      : 'bg-[#F4F4EA] text-[#3E481D] hover:bg-[#EAEBD9] border border-[#DCE3CE]'
                  }`}
                >
                  {opt.label.split(' ')[0]} ({opt.mg}mg)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Price in Indian Currency & Add to Cart */}
        <div className="pt-3 border-t border-[#F0F0E0] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3E481D] bg-[#EAEBD9] px-1.5 py-0.5 rounded">
                Fixed Price (INR)
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg sm:text-xl font-black text-[#3E481D]">
                ₹ {priceInr.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#56652C]">INR</span>
              {originalPriceInr && (
                <span className="text-xs text-gray-400 line-through">
                  ₹ {originalPriceInr.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-600 font-medium block">
              ~ रू {priceNpr.toLocaleString()} NPR
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-3.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#3E481D] text-white hover:bg-[#283011] active:scale-95'
            }`}
            title="Add to Cart"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

        {/* Shipping note for Nepal delivery */}
        <div className="pt-2 border-t border-dashed border-[#EAEBD9] flex items-center justify-between text-[11px] text-[#56652C]">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
            <Truck className="w-3.5 h-3.5 text-[#DC143C] shrink-0" />
            <span>Min. 10–14 days shipping</span>
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Delhi Cold Transit</span>
        </div>
      </div>
    </article>
  );
};
