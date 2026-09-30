import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { COAModal } from '../components/COAModal';
import { BatchCOA } from '../types';
import { Search, ShieldCheck, Award, CheckCircle2, FileText, ExternalLink, HelpCircle } from 'lucide-react';

export const LabResultsPage: React.FC = () => {
  const { coas, selectedBatch, getCOAByBatch } = useStore();
  const [searchTerm, setSearchTerm] = useState(selectedBatch || '');
  const [activeCOA, setActiveCOA] = useState<BatchCOA | null>(() => {
    if (selectedBatch) {
      return getCOAByBatch(selectedBatch) || null;
    }
    return null;
  });

  const filteredCOAs = coas.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.batchNumber.toLowerCase().includes(q) ||
      c.productName.toLowerCase().includes(q) ||
      c.testingLab.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-[#DCE3CE] pb-6 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEBD9] text-[#3E481D] text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Analytical Transparency &amp; Brand Authentication</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#3E481D] tracking-tight">
          Purity Verification &amp; Brand Authentication
        </h1>
        <p className="text-base text-[#5f6b3a] max-w-3xl leading-relaxed">
          Every product imported via our Delhi partner company is verified through two separate layers: independent laboratory HPLC / Mass Spectrometry assay reports, plus official one-time brand manufacturer authentication codes.
        </p>
      </div>

      {/* Brand-Specific Security Code & Unboxing Video Guarantee Banner */}
      <div className="bg-[#FAF7EE] border-2 border-[#DCE3CE] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3E481D] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-6 h-6 text-[#A0D468]" />
          </div>
          <div className="space-y-1.5 flex-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
              Authenticity &amp; Money-Back Guarantee
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E230E] tracking-tight">
              Brand-Specific Verification Codes &amp; Unboxing Video Policy
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6b3a] leading-relaxed">
              To verify any product, they come with a <strong>one-time security code</strong> on the purchased box or packaging (for example, <em>Enhanced Pharmaceuticals</em> products and verified anabolics). This code must be entered directly on the brand's legitimate manufacturer website. Each code can <strong>only be used once</strong> for verification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          {/* Box 1 */}
          <div className="bg-white p-4 rounded-2xl border border-[#DCE3CE] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#3E481D]">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>1. One-Time Brand Code</span>
            </div>
            <p className="text-[11px] text-[#5f6b3a] leading-relaxed">
              Scratch off the silver seal on your box to reveal the unique code. Visit the official manufacturer website to confirm genuine batch registration. Codes cannot be reused.
            </p>
          </div>

          {/* Box 2 */}
          <div className="bg-white p-4 rounded-2xl border border-amber-300 bg-amber-50/40 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>2. Record Unboxing Video</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              <strong>We highly recommend recording an uncut video</strong> of opening your parcel and verifying the code on the box. In the rare event of seal damage or an invalid code, this video is your valid proof to claim a full refund or replacement.
            </p>
          </div>

          {/* Box 3 */}
          <div className="bg-white p-4 rounded-2xl border border-[#DCE3CE] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#3E481D]">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>3. Never Compromised</span>
            </div>
            <p className="text-[11px] text-[#5f6b3a] leading-relaxed">
              <em>FYI: A counterfeit or code failure has never happened with our orders.</em> Our high-end products are never compromised, underdosed, or fake. Whatever is listed on the box is accurately inside the vial.
            </p>
          </div>
        </div>

        {/* Disclaimer strip */}
        <div className="bg-amber-100/70 border border-amber-300/80 rounded-2xl p-4 text-[11px] text-amber-950 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Informed Decision &amp; Liability Notice:</strong> Please make your own informed decision and conduct thorough research before purchasing or utilizing these compounds. We are strictly not responsible for your purchase or what you choose to do with it.
          </p>
        </div>
      </div>

      {/* Search Bar & Quick Buttons */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE3CE] shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="search"
            placeholder="Search by lot number (e.g. PN-2026-BPC157) or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F4F4EA] border border-[#DCE3CE] rounded-2xl text-sm font-semibold text-[#3E481D] focus:outline-none focus:border-[#3E481D]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#707E46]">
          <span className="font-semibold">Quick Batch Lookup:</span>
          {coas.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchTerm(c.batchNumber);
                setActiveCOA(c);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F4F4EA] hover:bg-[#EAEBD9] text-[#3E481D] font-mono text-[11px] font-bold border border-[#DCE3CE]"
            >
              {c.batchNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates List / Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#3E481D]">
          Active Batch Reports ({filteredCOAs.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCOAs.map((coa) => (
            <div
              key={coa.id}
              className="bg-white rounded-3xl p-6 border border-[#DCE3CE] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#B7C29E] transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-[#F0F0E0] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">
                      Batch #{coa.batchNumber}
                    </span>
                    <h3 className="text-lg font-bold text-[#3E481D]">{coa.productName}</h3>
                    <p className="text-xs text-[#707E46]">Vial Size: {coa.vialSize}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                    {coa.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="bg-[#F8FAF5] p-3 rounded-xl border border-[#DCE3CE]">
                    <span className="text-gray-400 block text-[10px] uppercase">HPLC Purity</span>
                    <span className="text-xl font-black text-emerald-700">{coa.purityPercent}%</span>
                  </div>
                  <div className="bg-[#F8FAF5] p-3 rounded-xl border border-[#DCE3CE]">
                    <span className="text-gray-400 block text-[10px] uppercase">Test Date</span>
                    <span className="text-xs font-bold text-gray-800 mt-1 block">{coa.testDate}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-[#5f6b3a]">
                  <p><strong>Testing Lab:</strong> {coa.testingLab}</p>
                  <p><strong>Method:</strong> {coa.testMethod}</p>
                  <p><strong>Mass Conformance:</strong> {coa.molecularMassFound} (Expected: {coa.expectedMass})</p>
                </div>
              </div>

              <button
                onClick={() => setActiveCOA(coa)}
                className="w-full py-2.5 rounded-xl bg-[#3E481D] text-white font-bold text-xs hover:bg-[#2A3312] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Inspect Full Analytical Certificate (PDF)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Guide on Reading a COA */}
      <div className="bg-[#EAEBD9] rounded-3xl p-6 sm:p-10 border border-[#DCE3CE] space-y-6">
        <div className="flex items-center gap-2 text-[#3E481D]">
          <Award className="w-6 h-6 text-emerald-800" />
          <h2 className="text-xl sm:text-2xl font-black">
            How to verify a real Certificate of Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#3E481D]">
          <div className="bg-white p-5 rounded-2xl border border-[#DCE3CE] space-y-2">
            <h3 className="font-bold text-sm text-[#3E481D]">1. Independent Lab Accreditation</h3>
            <p className="text-[#5f6b3a] leading-relaxed">
              Anyone can print a fake certificate with Photoshop. A real COA must name an independent ISO/IEC 17025 accredited third-party testing facility with contact information for test verification.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE3CE] space-y-2">
            <h3 className="font-bold text-sm text-[#3E481D]">2. HPLC Chromatogram Trace</h3>
            <p className="text-[#5f6b3a] leading-relaxed">
              High-Performance Liquid Chromatography separates every chemical component by retention time. High purity (≥98%) is indicated by a single dominant peak with minimal baseline noise.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE3CE] space-y-2">
            <h3 className="font-bold text-sm text-[#3E481D]">3. Mass Spectrometry (MS) Identity</h3>
            <p className="text-[#5f6b3a] leading-relaxed">
              HPLC tells you purity, but Mass Spectrometry tells you if the peptide has the exact expected molecular weight (Daltons). Both tests are mandatory to confirm that the vial actually contains the advertised peptide.
            </p>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {activeCOA && (
        <COAModal coa={activeCOA} onClose={() => setActiveCOA(null)} />
      )}

    </div>
  );
};
