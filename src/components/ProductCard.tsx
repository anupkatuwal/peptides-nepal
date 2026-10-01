import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getBrandImage } from '../assets/productImages';
import { ShoppingBag, Check } from 'lucide-react';

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
      className="group bg-white rounded-xl border border-[#CBD5CF] overflow-hidden hover:border-[#0E2A23] transition-colors flex flex-col cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-[#F7F9F8] border-b border-[#E4EBE7] overflow-hidden">
        <img
          src={brandImage}
          alt={`${product.brand ? product.brand + ' ' : ''}${product.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getBrandImage(product.brand, product.name, product.category);
          }}
        />
        {product.activeOffer && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-[#C2362B] text-white text-xs font-semibold">
            {product.activeOffer}
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[13px] text-[#4B635A]">
          {product.brand ? `${product.brand}, ` : ''}{product.categoryLabel.toLowerCase()}
        </p>
        <h3 className="mt-1 font-bold text-lg text-[#0E2A23] leading-snug group-hover:underline underline-offset-4">
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-[#3F574D] line-clamp-2">{product.shortDesc}</p>

        <p className="mt-3 text-[13px] text-[#3F574D]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#1F8A5B] mr-1.5 align-middle" />
          {product.purityPercent}% purity (HPLC), batch {product.batchNumber}
        </p>

        {product.vialOptions.length > 1 && (
          <div className="mt-4 flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()} role="group" aria-label="Choose a size">
            {product.vialOptions.map((opt) => (
              <button
                key={opt.mg}
                onClick={() => setSelectedVialMg(opt.mg)}
                aria-pressed={selectedVialMg === opt.mg}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  selectedVialMg === opt.mg
                    ? 'bg-[#0E2A23] text-white border-[#0E2A23] font-semibold'
                    : 'bg-white text-[#0E2A23] border-[#CBD5CF] hover:border-[#0E2A23]'
                }`}
              >
                {opt.mg} mg
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-5 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-[#0E2A23]">₹{priceInr.toLocaleString()}</span>
              {originalPriceInr && (
                <span className="text-sm text-[#6F877C] line-through">₹{originalPriceInr.toLocaleString()}</span>
              )}
            </div>
            <span className="text-[13px] text-[#4B635A]">about रू{priceNpr.toLocaleString()}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              isAdded ? 'bg-[#1F8A5B] text-white' : 'bg-[#0E2A23] text-white hover:bg-[#12352C]'
            }`}
          >
            {isAdded ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingBag className="w-4 h-4" /> Add to cart</>}
          </button>
        </div>
      </div>
    </article>
  );
};
