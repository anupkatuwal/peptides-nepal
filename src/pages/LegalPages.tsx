import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, HelpCircle, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { navigateTo } = useStore();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-xs text-[#5f6b3a] leading-relaxed">
      <button
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-1 font-bold text-[#3E481D] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <h1 className="text-3xl font-black text-[#3E481D]">Privacy Policy</h1>
      <p className="text-gray-400">Last updated: September 2026</p>

      <div className="bg-white p-6 rounded-2xl border border-[#DCE3CE] space-y-4">
        <h2 className="text-sm font-bold text-[#3E481D]">1. Information We Collect</h2>
        <p>
          Peptides Nepal collects only the necessary information to fulfill your courier dispatch (Name, delivery address within Nepal, mobile phone number for logistics, and email for dispatch tracking). We never sell or share user data with third-party advertising brokers.
        </p>

        <h2 className="text-sm font-bold text-[#3E481D]">2. Payment Data</h2>
        <p>
          Payments made through eSewa, Khalti, or Fonepay are processed directly via secure digital tokens. We never store or view your MPIN, bank account credentials, or wallet passwords.
        </p>

        <h2 className="text-sm font-bold text-[#3E481D]">3. Cookies and Local Storage</h2>
        <p>
          We use local storage on your device solely to maintain your shopping cart, preferred theme, and session login.
        </p>
      </div>
    </div>
  );
};

export const SupportTermsPage: React.FC = () => {
  const { navigateTo } = useStore();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-xs text-[#5f6b3a] leading-relaxed">
      <button
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-1 font-bold text-[#3E481D] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <h1 className="text-3xl font-black text-[#3E481D]">Terms of Service &amp; Support</h1>
      <p className="text-gray-400">Effective: September 2026</p>

      <div className="bg-white p-6 rounded-2xl border border-[#DCE3CE] space-y-4">
        <h2 className="text-sm font-bold text-[#3E481D]">1. Laboratory &amp; Analytical Purpose</h2>
        <p>
          All items listed under research categories are sold strictly for in-vitro laboratory research, chemical characterization, and analytical reference standards. They are not intended for unprescribed human consumption or self-administration.
        </p>

        <h2 className="text-sm font-bold text-[#3E481D]">2. Cold-Chain Delivery Guarantee &amp; Shipping Fee</h2>
        <p>
          All research supplies are dispatched directly from our verified Delhi partner company with insured temperature-controlled packaging (insulated cold pouches and frozen gel refrigerant). Delivery anywhere in Nepal takes a minimum of 10 days and typically arrives within 14 days. A flat shipping and handling fee of ₹4,500 INR (~ रू 7,200 NPR) is applied to all orders to cover cross-border customs handling and expedited cold-chain logistics.
        </p>

        <h2 className="text-sm font-bold text-[#3E481D]">3. 100% Upfront Payment (No COD)</h2>
        <p>
          Because all shipments originate cross-border directly from Delhi partner stock with dedicated temperature control, Cash on Delivery (COD) is strictly unavailable. Orders are confirmed and dispatched only upon 100% complete upfront payment verification via eSewa, Khalti, Fonepay, Direct Bank Transfer, or Indian UPI / IMPS.
        </p>

        <h2 className="text-sm font-bold text-[#3E481D]">4. Brand-Specific One-Time Codes &amp; Unboxing Video Policy</h2>
        <p>
          Products imported through our partner (including <em>Enhanced Pharmaceuticals</em> items and specialized compounds) come with authentic manufacturer scratch-off security codes on the box. These codes can only be redeemed once on the manufacturer's legitimate official website to verify authenticity.
        </p>
        <p>
          <strong>Unboxing Video Requirement for Money-Back Claims:</strong> We highly recommend and require recording an unbroken, continuous video while opening the outer parcel and scratching/entering the verification code. In the unforeseen event that a package is compromised or a code is flagged, this video provides immediate proof for a full replacement or refund. <em>FYI: This has never happened with our shipments. Our high-end products are never compromised with underdosed or counterfeit substances; whatever is listed on the box is accurately inside the vial.</em>
        </p>

        <h2 className="text-sm font-bold text-[#3E481D]">5. Purchaser Responsibility &amp; Non-Liability Disclaimer</h2>
        <p>
          All purchasers must make their own informed decision and conduct appropriate scientific literature reviews before purchasing. Peptides Nepal is strictly not responsible for your purchase, handling, administration, or what you choose to do with any products or materials.
        </p>

        <h2 className="text-sm font-bold text-[#3E481D]">6. Contacting Support &amp; Sales</h2>
        <p>
          Direct inquiries to <a href="mailto:katuwalanup@gmail.com" className="font-bold underline text-[#3E481D]">katuwalanup@gmail.com</a> or directly through WhatsApp at <a href="https://wa.me/9779808318864" className="font-bold underline text-[#3E481D]">+977 9808318864</a>. Direct chat is strictly reserved for sales inquiries and order verification.
        </p>
      </div>
    </div>
  );
};
