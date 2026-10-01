import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Truck,
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Tag, 
  ShieldCheck, 
  Sparkles,
  Check
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    cartSubtotal, 
    cartDeliveryFee, 
    cartDiscount, 
    cartTotal,
    couponCode,
    applyCoupon,
    removeCoupon,
    navigateTo
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyCoupon(promoInput);
    setPromoFeedback(res);
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigateTo('checkout');
  };

  const freeDeliveryThresholdInr = 10000;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeDeliveryThresholdInr) * 100));
  const amountToFreeInr = Math.max(0, freeDeliveryThresholdInr - cartSubtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F4F4EA] shadow-2xl flex flex-col justify-between border-l border-[#DCE3CE] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-[#DCE3CE] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#3E481D]" />
              <h2 className="text-lg font-bold text-[#3E481D]">Your Cart (₹ INR)</h2>
              <span className="bg-[#EAEBD9] text-[#3E481D] text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-gray-500 hover:text-[#3E481D] hover:bg-[#F4F4EA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery & Partner Sourcing Strip */}
          <div className="bg-[#FAF7EE] px-5 py-3 border-b border-[#DCE3CE]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3E481D] mb-1">
              <Truck className="w-4 h-4 text-[#DC143C] shrink-0" />
              <span>Direct Delhi to Nepal Courier: Flat ₹4,500 Shipping</span>
            </div>
            <p className="text-[11px] text-[#5f6b3a] leading-relaxed">
              Dispatched with insured temperature control (10–14 days transit). <strong>Orders placed strictly after 100% upfront payment · No Cash on Delivery (COD).</strong>
            </p>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white text-[#707E46] mx-auto flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-base font-semibold text-[#3E481D]">Your cart is currently empty</h3>
                <p className="text-xs text-[#707E46] max-w-xs mx-auto">
                  Explore our verified June BPC-157 rates, oral capsules, and reconstitution supplies.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#3E481D] text-white text-xs font-bold hover:bg-[#2F3716] shadow-sm transition-colors"
                >
                  Explore Catalog →
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl p-3.5 border border-[#DCE3CE] shadow-xs flex gap-3.5 items-start"
                >
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-18 h-18 object-cover rounded-lg flex-none border border-[#F0F0E0]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-bold text-[#3E481D] truncate leading-tight">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#707E46] font-medium mt-0.5">
                      {item.product.brand && <span className="font-bold text-[#3E481D]">{item.product.brand} · </span>}
                      Option: {item.selectedVialMg}mg {item.product.category === 'supplies' ? 'Volume' : 'Powder'}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-sm font-bold text-[#3E481D] block">
                          ₹ {(item.unitPriceInr * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          ~ रू {Math.round(item.unitPriceInr * item.quantity * 1.6).toLocaleString()} NPR
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#DCE3CE] rounded-lg bg-[#F4F4EA]">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#DCE3CE] rounded-l-md text-[#3E481D] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-[#3E481D]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#DCE3CE] rounded-r-md text-[#3E481D] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Section */}
          {cart.length > 0 && (
            <div className="border-t border-[#DCE3CE] bg-white p-5 space-y-4 shadow-lg">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. NEPAL10 or DELHI500)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl focus:outline-none focus:border-[#3E481D] uppercase font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3E481D] text-white text-xs font-semibold rounded-xl hover:bg-[#2A3312] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && (
                  <p className={`text-xs ${promoFeedback.success ? 'text-emerald-700 font-medium' : 'text-red-600'}`}>
                    {promoFeedback.message}
                  </p>
                )}
                {couponCode && (
                  <div className="flex items-center justify-between text-xs bg-[#EAEBD9] px-2.5 py-1 rounded-lg text-[#3E481D]">
                    <span className="font-semibold">Code applied: {couponCode}</span>
                    <button 
                      type="button" 
                      onClick={removeCoupon} 
                      className="underline text-red-600 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#5f6b3a] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal (Fixed INR)</span>
                  <span className="text-[#3E481D] font-bold">₹ {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="block">Shipping &amp; Handling</span>
                    <span className="text-[10px] text-gray-500">Delhi to Nepal Cold Transit</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#3E481D] font-bold block">₹ {cartDeliveryFee.toLocaleString()} INR</span>
                    <span className="text-[10px] text-gray-500 block">~ रू {Math.round(cartDeliveryFee * 1.6).toLocaleString()} NPR</span>
                  </div>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>- ₹ {cartDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#3E481D] pt-2 border-t border-[#F0F0E0]">
                  <div>
                    <span>Total (INR)</span>
                    <span className="text-[10px] text-gray-500 font-normal block">
                      ~ रू {Math.round(cartTotal * 1.6).toLocaleString()} NPR
                    </span>
                  </div>
                  <span className="text-xl font-black">₹ {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 rounded-full bg-[#3E481D] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#2C3414] shadow-md transition-all active:scale-[0.98]"
              >
                <span>Proceed to Checkout (₹ {cartTotal.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#707E46]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>eSewa, Khalti, Fonepay &amp; Bank · 100% Upfront (No COD)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
