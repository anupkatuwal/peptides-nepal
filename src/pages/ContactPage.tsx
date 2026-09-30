import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { sendMessage } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('98');
  const [subject, setSubject] = useState('Product / Cold-Chain Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ name, email, phone, subject, message });
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#DCE3CE] pb-6 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEBD9] text-[#3E481D] text-xs font-bold">
          <MessageSquare className="w-4 h-4" />
          <span>Nepal Sales Desk &amp; Sourcing Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#3E481D] tracking-tight">
          Sales &amp; Peptide Sourcing Desk
        </h1>
        <p className="text-base text-[#5f6b3a] max-w-3xl leading-relaxed">
          <strong>Dynamic Pricing &amp; Unlisted Compounds:</strong> Peptide and amino acid prices fluctuate frequently based on international batch synthesis and currency exchange. Not every peptide, blend, or Amino Acid (AA) is listed on this website. If you require a specific compound or custom formulation, ask us directly.
        </p>

        {/* Strict Chat Policy Warning Strip */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-amber-950">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-amber-900">
              ⚠️ Strict Policy: Direct Chats Are for Sales Enquiries Only
            </h4>
            <p className="leading-relaxed text-amber-900">
              <strong>No spam or information-only queries in the chat.</strong> Please do your own research before reaching out. We have published extensive educational breakdowns, clinical trials, and dosage calculators directly on this website, as well as on our Instagram (<a href="https://instagram.com/peptidesnepal" target="_blank" rel="noopener noreferrer" className="font-bold underline text-amber-950 hover:text-black">@peptidesnepal</a>) covering various peptides, secretagogues, and Amino Acids (AAs).
            </p>
            <p className="text-[11px] font-semibold text-amber-800">
              Our direct WhatsApp and phone lines are strictly dedicated to purchase orders, specific peptide/AA sourcing requests, and payment QR dispatch.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE3CE] shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-[#3E481D]">
            Send Us a Message
          </h2>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900">Message Received!</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you for reaching out. One of our laboratory associates will respond to your email or WhatsApp within 12 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 rounded-full bg-[#3E481D] text-white text-xs font-bold mt-2"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-[#3E481D] font-medium focus:outline-none focus:border-[#3E481D]"
                    placeholder="e.g. Suman Thapa"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-[#3E481D] font-medium focus:outline-none focus:border-[#3E481D]"
                    placeholder="suman@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Mobile / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-[#3E481D] font-mono font-medium focus:outline-none focus:border-[#3E481D]"
                    placeholder="98XXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-[#3E481D] font-medium focus:outline-none focus:border-[#3E481D]"
                  >
                    <option value="Specialty Sourcing: Anabolics, SERMs, SARMs, HCG, AIs">Specialty Sourcing: Anabolics, SERMs, SARMs, HCG, AIs</option>
                    <option value="Product / Cold-Chain Inquiry">Cold-Chain &amp; Delivery Inquiry</option>
                    <option value="Batch COA Verification">Batch HPLC Certificate Question</option>
                    <option value="Order Tracking">Order Tracking &amp; Dispatch</option>
                    <option value="Scientific Research Question">Scientific Research Question</option>
                    <option value="Wholesale & Academic Supply">Academic / Wholesale Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3E481D] mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-[#3E481D] font-medium focus:outline-none focus:border-[#3E481D]"
                  placeholder="How can we assist you?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#3E481D] text-white font-bold text-xs hover:bg-[#2A3312] shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick WhatsApp & Direct Help */}
          <div className="bg-[#3E481D] rounded-3xl p-6 text-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#A0D468]" />
                <span>Sales Orders &amp; Sourcing Desk</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">
                Sales Only
              </span>
            </div>
            <p className="text-xs text-[#C0CBA9] leading-relaxed">
              <strong>Prices change constantly</strong> and not all products are listed online. If you need any specific peptide, blend, or Amino Acid (AA), ask us directly for pricing.
            </p>
            <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-[11px] text-amber-200">
              ⚡ <strong>Chat Policy:</strong> Strictly for sales inquiries and order verification. No spam or info-only queries. Read our guides &amp; Instagram for research data.
            </div>
            <a
              href="https://wa.me/9779808318864?text=Namaste%20Peptides%20Nepal%2C%20I%20have%20a%20sales%20enquiry%20%2F%20sourcing%20request%20for%20a%20peptide."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-full bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#1EBE5D] transition-colors shadow-sm"
            >
              <span>WhatsApp Sales Desk (+977 9808318864)</span>
            </a>
          </div>

          {/* Operational Hours & Dispatch Location */}
          <div className="bg-white rounded-3xl p-6 border border-[#DCE3CE] shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#3E481D] uppercase tracking-wide">
              Kathmandu Operations &amp; Dispatch
            </h3>

            <div className="space-y-3 text-[#5f6b3a]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#707E46] flex-none mt-0.5" />
                <div>
                  <strong className="text-[#3E481D] block">Central Storage Facility:</strong>
                  <span>Lazimpat / Baluwatar Corridor, Kathmandu 44600, Nepal</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#707E46] flex-none mt-0.5" />
                <div>
                  <strong className="text-[#3E481D] block">Phone / WhatsApp Support:</strong>
                  <a href="tel:+9779808318864" className="text-[#3E481D] font-mono hover:underline">
                    +977 9808318864
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#707E46] flex-none mt-0.5" />
                <div>
                  <strong className="text-[#3E481D] block">Dispatch Hours:</strong>
                  <span>Sunday – Friday: 9:00 AM – 6:00 PM</span>
                  <span className="block text-gray-400">Closed Saturdays &amp; National Public Holidays</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#707E46] flex-none mt-0.5" />
                <div>
                  <strong className="text-[#3E481D] block">Official Inquiries &amp; Orders Email:</strong>
                  <a href="mailto:katuwalanup@gmail.com" className="text-[#3E481D] font-medium hover:underline">
                    katuwalanup@gmail.com
                  </a>
                  <span className="block text-[10px] text-gray-500 mt-0.5">Direct response from founder &amp; inventory dispatch</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Summary */}
          <div className="bg-[#EAEBD9] rounded-3xl p-6 border border-[#DCE3CE] space-y-3 text-xs">
            <h3 className="font-bold text-sm text-[#3E481D]">
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              <details className="bg-white p-3 rounded-xl border border-[#DCE3CE]">
                <summary className="font-bold text-[#3E481D] cursor-pointer">
                  How are cold-chain peptides shipped?
                </summary>
                <p className="text-[#5f6b3a] mt-1.5 leading-relaxed">
                  Lyophilized (freeze-dried) powder is stable at ambient temperature for 30–60 days, but we package every shipment in thermal insulated pouches with frozen gel refrigerant to ensure zero thermal degradation during transit across Nepal.
                </p>
              </details>

              <details className="bg-white p-3 rounded-xl border border-[#DCE3CE]">
                <summary className="font-bold text-[#3E481D] cursor-pointer">
                  Is Cash on Delivery (COD) available in Nepal?
                </summary>
                <p className="text-[#5f6b3a] mt-1.5 leading-relaxed">
                  No. Due to cross-border temperature-controlled cold-chain customs clearance directly from our Delhi partner company, all orders must be paid 100% upfront. Orders are placed strictly after full payment confirmation. We accept eSewa, Khalti, Fonepay, Direct Bank Transfer (NIC Asia, Nabil), and Indian UPI / IMPS.
                </p>
              </details>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
