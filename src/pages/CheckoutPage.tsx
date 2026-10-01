import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { NEPAL_DISTRICTS } from '../data/initialData';
import { PaymentMethod } from '../types';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Truck, 
  QrCode, 
  Smartphone,
  Lock,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    cartSubtotal, 
    cartDeliveryFee, 
    cartDiscount, 
    cartTotal, 
    placeOrder, 
    navigateTo, 
    currentUser 
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '98');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || 'Kathmandu');
  const [district, setDistrict] = useState(currentUser?.district || 'Kathmandu');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('esewa');
  const [transactionRef, setTransactionRef] = useState('');

  // Modals

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EAEBD9] text-[#3E481D] mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 opacity-70" />
        </div>
        <h2 className="text-xl font-bold text-[#3E481D]">Your cart is empty</h2>
        <p className="text-xs text-[#707E46]">Add peptides to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 rounded-full bg-[#3E481D] text-white text-xs font-bold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // There is no live eSewa/Khalti integration on this site, so every method works the
    // same way: the order is saved as unpaid and the admin confirms the payment by hand.
    // The site never asks for a wallet MPIN, password or OTP.
    const order = placeOrder({
      customerName,
      email,
      phone,
      address,
      city,
      district,
      deliveryNotes,
      paymentMethod,
      transactionRef: transactionRef.trim() || undefined
    });

    navigateTo('order-confirmation', { order });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Breadcrumb */}
      <button
        onClick={() => navigateTo('shop')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#707E46] hover:text-[#3E481D]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </button>

      <div className="border-b border-[#DCE3CE] pb-4">
        <h1 className="text-3xl font-black text-[#3E481D] tracking-tight">
          Secure Nepal Checkout
        </h1>
        <p className="text-xs text-[#5f6b3a] mt-1">
          Same-day cold-chain dispatch for orders in Kathmandu Valley. Express insured delivery nationwide.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Customer & Shipping Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Customer Contact */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE3CE] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#3E481D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#3E481D] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#3E481D] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl focus:outline-none focus:border-[#3E481D] text-[#3E481D] font-medium"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3E481D] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl focus:outline-none focus:border-[#3E481D] text-[#3E481D] font-medium"
                  placeholder="name@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#3E481D] mb-1">Nepal Mobile Number (for Courier &amp; OTP) *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl focus:outline-none focus:border-[#3E481D] text-[#3E481D] font-mono font-bold"
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE3CE] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#3E481D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#3E481D] text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Delivery Address in Nepal</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#3E481D] mb-1">District / Region *</label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (e.target.value.includes('Kathmandu')) setCity('Kathmandu');
                    else if (e.target.value.includes('Lalitpur')) setCity('Lalitpur');
                    else if (e.target.value.includes('Bhaktapur')) setCity('Bhaktapur');
                    else if (e.target.value.includes('Pokhara')) setCity('Pokhara');
                  }}
                  className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl focus:outline-none focus:border-[#3E481D] text-[#3E481D] font-medium"
                >
                  {NEPAL_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#3E481D] mb-1">City / Municipality *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl focus:outline-none focus:border-[#3E481D] text-[#3E481D] font-medium"
                  placeholder="e.g. Kathmandu, Lalitpur, Pokhara"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#3E481D] mb-1">Street Address &amp; Nearby Landmark *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl focus:outline-none focus:border-[#3E481D] text-[#3E481D] font-medium"
                  placeholder="e.g. Baluwatar, Near Embassy, Ward 4, House #12"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#3E481D] mb-1">Courier Delivery Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl focus:outline-none focus:border-[#3E481D] text-[#3E481D]"
                  placeholder="e.g. Call before coming; leave with security guard if unavailable"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE3CE] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#3E481D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#3E481D] text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Payment Option</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* eSewa */}
              <label 
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'esewa'
                    ? 'border-[#60BB46] bg-[#60BB46]/10 shadow-xs'
                    : 'border-[#DCE3CE] bg-[#F4F4EA] hover:bg-[#EAEBD9]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="esewa"
                  checked={paymentMethod === 'esewa'}
                  onChange={() => setPaymentMethod('esewa')}
                  className="mt-1 text-[#60BB46] focus:ring-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-[#3E481D]">
                    <span className="w-4 h-4 rounded-full bg-[#60BB46] text-white flex items-center justify-center text-[10px] font-black">e</span>
                    <span>eSewa Wallet / QR</span>
                  </div>
                  <p className="text-[11px] text-[#707E46] mt-0.5">We send our eSewa QR on WhatsApp after you order</p>
                </div>
              </label>

              {/* Khalti */}
              <label 
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'khalti'
                    ? 'border-[#5C2D91] bg-[#5C2D91]/10 shadow-xs'
                    : 'border-[#DCE3CE] bg-[#F4F4EA] hover:bg-[#EAEBD9]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="khalti"
                  checked={paymentMethod === 'khalti'}
                  onChange={() => setPaymentMethod('khalti')}
                  className="mt-1 text-[#5C2D91] focus:ring-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-[#3E481D]">
                    <span className="w-4 h-4 rounded-full bg-[#5C2D91] text-white flex items-center justify-center text-[10px] font-black">K</span>
                    <span>Khalti Digital Wallet</span>
                  </div>
                  <p className="text-[11px] text-[#707E46] mt-0.5">We send our Khalti QR on WhatsApp after you order</p>
                </div>
              </label>

              {/* No COD Notice Box */}
              <div className="p-4 rounded-2xl border border-red-200 bg-red-50/80 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✕
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-red-900">
                    <span>No Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                    Due to cross-border cold-chain customs clearance from Delhi, all orders must be paid 100% upfront. Orders are placed strictly after complete payment.
                  </p>
                </div>
              </div>

              {/* Bank Transfer / Fonepay */}
              <label 
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#3E481D] bg-[#3E481D]/10 shadow-xs'
                    : 'border-[#DCE3CE] bg-[#F4F4EA] hover:bg-[#EAEBD9]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="mt-1 text-[#3E481D] focus:ring-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-[#3E481D]">
                    <QrCode className="w-4 h-4 text-[#3E481D]" />
                    <span>Bank Transfer</span>
                  </div>
                  <p className="text-[11px] text-[#707E46] mt-0.5">We send our bank account details on WhatsApp after you order</p>
                </div>
              </label>
            </div>

            {/* Ask for QR or Bank Account Info Box */}
            <div className="bg-[#F8FAF5] border border-[#B7C29E] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-2.5">
                <QrCode className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#1E230E]">
                    How payment works
                  </h4>
                  <p className="text-[11px] text-[#56652C] leading-relaxed">
                    Place your order first. We'll then send you our payment details on WhatsApp or email. Once your payment arrives, we confirm your order and send it. You can also message us now:
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={`https://wa.me/9779808318864?text=${encodeURIComponent(
                    `Namaste! I am checking out on Peptides Nepal. Total: ₹${cartTotal} INR (~ रू ${Math.round(
                      cartTotal * 1.6
                    )} NPR). Please provide your active Payment QR code or Bank Account number.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Message us on WhatsApp (+977 9808318864)</span>
                </a>
                <a
                  href="mailto:katuwalanup@gmail.com?subject=Peptides%20Nepal%20Payment%20QR%20Request"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#DCE3CE] text-[#3E481D] hover:bg-[#F4F4EA] text-xs font-bold transition-all text-center"
                >
                  <span>Email: katuwalanup@gmail.com</span>
                </a>
              </div>

              {(
                <div className="pt-2 border-t border-[#DCE3CE] space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#3E481D]">
                    Payment reference (optional — only if you've already paid)
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    maxLength={100}
                    placeholder="e.g. eSewa or bank transaction ID"
                    className="w-full p-2.5 bg-white border border-[#DCE3CE] rounded-xl text-xs text-[#3E481D] focus:outline-none focus:border-[#3E481D]"
                  />
                  <p className="text-[10px] text-gray-500">
                    After paying, send us the payment screenshot on WhatsApp so we can confirm your order quickly.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Sticky Order Summary Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE3CE] shadow-sm space-y-6 lg:sticky lg:top-24">
          <div className="border-b border-[#F0F0E0] pb-3 space-y-2">
            <h2 className="text-lg font-bold text-[#3E481D]">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h2>
            <p className="text-xs text-[#707E46]">Fixed rates in Indian Currency (₹ INR)</p>

            {/* Mandatory Policy Banner */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>100% Complete Payment Required (No COD)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Orders are shipped only after full payment is confirmed. Flat ₹4,500 INR shipping &amp; handling fee covers insured cross-border cold-chain courier directly from our Delhi partner company (min. 10–14 days delivery across Nepal).
              </p>
            </div>
          </div>

          {/* Cart items preview */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#3E481D] truncate">{item.product.name}</p>
                  <p className="text-[#707E46]">
                    {item.product.brand && <span className="font-semibold">{item.product.brand} · </span>}
                    {item.selectedVialMg}mg · Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#3E481D] whitespace-nowrap block">
                    ₹ {(item.unitPriceInr * item.quantity).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ~ रू {Math.round(item.unitPriceInr * item.quantity * 1.6).toLocaleString()} NPR
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-[#F0F0E0] pt-4 space-y-2 text-xs text-[#5f6b3a]">
            <div className="flex justify-between">
              <span>Subtotal (Fixed INR)</span>
              <span className="font-bold text-[#3E481D]">₹ {cartSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="block font-medium">Shipping &amp; Handling</span>
                <span className="text-[10px] text-gray-500">Direct Delhi to Nepal Cold-Chain (10–14 Days)</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#3E481D]">₹ {cartDeliveryFee.toLocaleString()} INR</span>
                <span className="text-[10px] text-gray-500 block">~ रू {Math.round(cartDeliveryFee * 1.6).toLocaleString()} NPR</span>
              </div>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Partner Discount Applied</span>
                <span>- ₹ {cartDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-[#F0F0E0] pt-3 flex justify-between items-baseline text-base font-bold text-[#3E481D]">
              <div>
                <span>Payable Total:</span>
                <span className="text-xs text-gray-500 font-normal block">
                  ~ रू {Math.round(cartTotal * 1.6).toLocaleString()} NPR (at 1:1.60 peg)
                </span>
              </div>
              <span className="text-2xl font-black">₹ {cartTotal.toLocaleString()} INR</span>
            </div>
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-[#3E481D] hover:bg-[#283011] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>
              {`Place Order (₹ ${cartTotal.toLocaleString()} INR)`}
            </span>
          </button>

          <div className="text-[11px] text-gray-500 text-center space-y-1">
            <p className="flex items-center justify-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Insulated Cold Pack &amp; Discreet Courier</span>
            </p>
            <p className="font-medium text-[#3E481D]">
              Direct dispatch from our Delhi partner company. Delivery in Nepal takes a minimum of 10 days (typically 10–14 days).
            </p>
          </div>
        </div>

      </form>

    </div>
  );
};
