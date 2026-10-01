import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Package, Truck, ShieldCheck, Printer, ArrowRight, Clock, MessageSquare } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { lastOrder, navigateTo } = useStore();

  if (!lastOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0E2A23]">No recent order found</h2>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 rounded-full bg-[#0E2A23] text-white text-xs font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      
      {/* Success Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border-2 border-emerald-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Order Successfully Confirmed
          </span>
          <h1 className="text-3xl font-black text-[#0E2A23] tracking-tight">
            Thank you, {lastOrder.customerName}!
          </h1>
          <p className="text-xs text-[#4B635A]">
            Your order number is <strong className="text-gray-900 font-mono">{lastOrder.orderNumber}</strong>. A confirmation has been registered for Nepal dispatch.
          </p>
        </div>

        {/* Live Delivery Status Timeline */}
        <div className="pt-6 border-t border-gray-100 max-w-lg mx-auto">
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="space-y-1.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="font-bold text-[#0E2A23] block">Confirmed</span>
            </div>
            <div className="space-y-1.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold animate-pulse">
                2
              </div>
              <span className="font-bold text-[#0E2A23] block">Delhi Partner</span>
            </div>
            <div className="space-y-1.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-gray-400 block">Nepal Transit</span>
            </div>
            <div className="space-y-1.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                4
              </div>
              <span className="text-gray-400 block">Delivered</span>
            </div>
          </div>
          <p className="text-[11px] text-[#4B635A] mt-3 font-medium">
            Standard delivery timeline: 10 to 14 days directly to your destination in Nepal.
          </p>
        </div>
      </div>

      {/* Order & Shipping Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5CF] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E4EBE7] pb-4">
          <div>
            <span className="text-xs text-gray-400 uppercase font-bold block">Tracking Code</span>
            <span className="text-base font-black font-mono text-[#0E2A23]">{lastOrder.trackingNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 uppercase font-bold block">Payment Status</span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
              lastOrder.paymentStatus === 'verified'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {lastOrder.paymentStatus === 'verified' ? 'Verified (Paid)' : 'Pending (Payment Verification)'}
            </span>
          </div>
        </div>

        {/* Shipping address info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#F7F9F8] p-4 rounded-xl border border-[#CBD5CF]">
            <span className="font-bold text-[#0E2A23] block uppercase text-[10px] mb-1">
              Destination Address:
            </span>
            <p className="font-medium text-gray-800">{lastOrder.customerName}</p>
            <p className="text-gray-600">{lastOrder.address}</p>
            <p className="text-gray-600">{lastOrder.city}, {lastOrder.district}</p>
            <p className="text-gray-600 font-mono mt-1">Tel: {lastOrder.phone}</p>
          </div>

          <div className="bg-[#F7F9F8] p-4 rounded-xl border border-[#CBD5CF]">
            <span className="font-bold text-[#0E2A23] block uppercase text-[10px] mb-1">
              Payment &amp; Logistics:
            </span>
            <p className="text-gray-700">
              Method: <strong className="uppercase text-[#0E2A23]">{lastOrder.paymentMethod}</strong>
            </p>
            {lastOrder.transactionRef && (
              <p className="text-gray-600 font-mono text-[11px] mt-0.5">
                Ref: {lastOrder.transactionRef}
              </p>
            )}
            <p className="text-gray-600 mt-2">
              Sourced via: <span className="font-medium text-gray-800">Delhi Peptides Partner Company</span>
            </p>
            <p className="text-emerald-700 font-semibold text-[11px] mt-0.5">
              Estimated delivery: 10 to 14 days
            </p>
          </div>
        </div>

        {/* Unboxing Video & One-Time Code Verification Tip */}
        <div className="bg-[#F7F9F8] border border-[#9FB2A8] rounded-2xl p-4 space-y-2 text-xs text-[#10241E]">
          <div className="flex items-center gap-2 font-bold text-[#0A1F19]">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Delivery Unboxing Tip &amp; Brand Authentication</span>
          </div>
          <p className="text-[11px] text-[#3F574D] leading-relaxed">
            All authentic products (e.g. <em>Enhanced Pharmaceuticals</em>) feature a <strong>one-time scratch-off security code</strong> on the box to verify on the manufacturer's legitimate website. Codes can only be redeemed once.
          </p>
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[10px] text-amber-900 leading-relaxed">
            📹 <strong>Record an Unboxing Video:</strong> Please record an unbroken video while opening your delivery parcel and verifying the code. While our products are strictly authentic, accurately dosed, and a defect has never occurred, this video serves as your valid evidence for a money-back claim or immediate replacement.
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B635A]">
            Items Ordered
          </h3>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {lastOrder.items.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-gray-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#0E2A23]">{item.productName}</p>
                  <p className="text-gray-500">{item.vialMg}mg · Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-800 block">
                    ₹ {item.totalInr ? item.totalInr.toLocaleString() : Math.round((item.totalNpr || 0) / 1.6).toLocaleString()} INR
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ~ रू {item.totalNpr ? item.totalNpr.toLocaleString() : ''} NPR
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing totals */}
          <div className="bg-[#F7F9F8] p-4 rounded-2xl border border-[#CBD5CF] space-y-1.5 text-xs text-[#4B635A]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹ {(lastOrder.subtotalInr || Math.round(lastOrder.subtotalNpr / 1.6)).toLocaleString()} INR</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping &amp; Handling (Delhi Cold-Chain):</span>
              <span>₹ {(lastOrder.deliveryFeeInr ?? 4500).toLocaleString()} INR</span>
            </div>
            {(lastOrder.discountInr ?? 0) > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount Applied:</span>
                <span>- ₹ {lastOrder.discountInr.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-[#CBD5CF] pt-2 flex justify-between font-bold text-sm text-[#0E2A23]">
              <div>
                <span>Total Amount:</span>
                <span className="text-xs text-gray-500 font-normal block">
                  ~ रू {lastOrder.totalNpr.toLocaleString()} NPR
                </span>
              </div>
              <span className="text-lg font-black">
                ₹ {(lastOrder.totalInr || Math.round(lastOrder.totalNpr / 1.6)).toLocaleString()} INR
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-4 border-t border-[#E4EBE7]">
          {/* Feature 3: Automated WhatsApp Order Dispatch Button */}
          <div className="bg-[#EBF7EE] p-4 rounded-2xl border border-[#25D366]/40 space-y-2.5 text-center">
            <span className="text-[11px] font-bold text-emerald-900 block">
              ⚡ Instant 1-Click WhatsApp Verification &amp; QR Dispatch:
            </span>
            <a
              href={`https://wa.me/9779808318864?text=${encodeURIComponent(
                `Namaste Peptides Nepal! 🔬\n\nI have just placed Order #${lastOrder.orderNumber} on the website.\n\n*Customer Details:*\n• Name: ${lastOrder.customerName}\n• Phone: ${lastOrder.phone}\n• Address: ${lastOrder.address}, ${lastOrder.city}, ${lastOrder.district}\n\n*Ordered Items:*\n${lastOrder.items.map(i => `• ${i.productName} (Qty: ${i.quantity})`).join('\n')}\n\n*Total Amount:* रू ${lastOrder.totalNpr.toLocaleString()} NPR (₹ ${lastOrder.totalInr} INR)\n*Payment Method:* ${lastOrder.paymentMethod.toUpperCase()}${lastOrder.transactionRef ? ` (Ref: ${lastOrder.transactionRef})` : ''}\n*Tracking Code:* ${lastOrder.trackingNumber}\n\nPlease confirm order receipt and send payment QR / transit dispatch verification.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-black flex items-center justify-center gap-2.5 shadow-md transition-all text-center tracking-wide"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Send Order Details to WhatsApp (+977 9808318864)</span>
            </a>
            <p className="text-[10px] text-emerald-800">
              Opens WhatsApp with your complete order breakdown pre-filled. We reply immediately to verify your order and dispatch payment QR.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 rounded-full border border-[#CBD5CF] text-xs font-bold text-[#0E2A23] hover:bg-[#F2F5F3] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </button>

            <button
              onClick={() => navigateTo('account')}
              className="flex-1 py-3 rounded-full bg-[#0E2A23] text-white text-xs font-bold hover:bg-[#10241E] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View All Orders in Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
