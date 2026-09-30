import React from 'react';
import { BatchCOA } from '../types';
import { X, ShieldCheck, Download, Award, CheckCircle2, FileText, Printer } from 'lucide-react';

interface COAModalProps {
  coa: BatchCOA | null;
  onClose: () => void;
}

export const COAModal: React.FC<COAModalProps> = ({ coa, onClose }) => {
  if (!coa) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 my-8">
        
        {/* Top Action Bar */}
        <div className="bg-[#3E481D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-[#A0D468]" />
            <span className="font-bold text-sm tracking-wide uppercase">
              Independent Analytical Certificate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none">
          
          {/* Lab Header */}
          <div className="border-b-2 border-[#3E481D] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#3E481D] tracking-tight">
                CERTIFICATE OF ANALYSIS (COA)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Analytical Testing Laboratory Standard: <span className="font-semibold text-gray-700">ISO/IEC 17025 Accredited</span>
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide border border-emerald-300">
                STATUS: {coa.status.toUpperCase()}
              </span>
              <p className="text-[11px] text-gray-400 mt-1 font-mono">Lot: {coa.batchNumber}</p>
            </div>
          </div>

          {/* Sample Meta Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAF5] p-4 rounded-xl border border-[#DCE3CE] text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Product</span>
              <span className="font-bold text-[#3E481D]">{coa.productName}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Vial Spec</span>
              <span className="font-bold text-gray-800">{coa.vialSize}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Test Date</span>
              <span className="font-bold text-gray-800">{coa.testDate}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Assay Method</span>
              <span className="font-bold text-gray-800">RP-HPLC / MS</span>
            </div>
          </div>

          {/* Primary HPLC Result Card */}
          <div className="border-2 border-emerald-500/40 rounded-2xl p-5 bg-emerald-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Chromatographic Purity (HPLC)
                </span>
                <span className="text-3xl font-black text-[#2E7D32]">
                  {coa.purityPercent}%
                </span>
                <span className="text-xs text-emerald-700 ml-2 font-medium">
                  (Specification: ≥ 98.0%)
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>

            {/* Visual Simulated HPLC Chromatogram Curve */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 mb-1 flex justify-between">
                <span>HPLC Chromatogram Trace (UV 214nm)</span>
                <span className="font-mono text-[10px]">Retention Time: 14.2 min</span>
              </p>
              <div className="w-full h-24 bg-white border border-gray-200 rounded-xl p-2 relative overflow-hidden flex items-end">
                {/* Horizontal baseline */}
                <div className="absolute inset-x-2 bottom-3 h-[1px] bg-gray-300" />
                
                {/* Simulated peak SVG */}
                <svg viewBox="0 0 400 80" className="w-full h-full text-emerald-600 fill-emerald-100/40 stroke-emerald-600 stroke-2">
                  <path d="M 0,70 L 150,70 Q 180,70 195,15 Q 200,2 205,15 Q 220,70 250,70 L 400,70" />
                </svg>
                
                <span className="absolute left-[50%] top-2 -translate-x-1/2 text-[10px] font-bold text-emerald-800 bg-white/90 px-1.5 py-0.5 rounded border border-emerald-200 shadow-xs">
                  Peak: {coa.purityPercent}% Area
                </span>
              </div>
            </div>
          </div>

          {/* Mass Spectrometry & Chemical Analysis */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Identity &amp; Safety Parameters
            </h4>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2 font-semibold">Test Parameter</th>
                  <th className="py-2 font-semibold">Specification</th>
                  <th className="py-2 font-semibold">Observed Value</th>
                  <th className="py-2 font-semibold text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                <tr>
                  <td className="py-2.5 font-medium">Molecular Mass (MS)</td>
                  <td className="py-2.5 text-gray-500">{coa.expectedMass}</td>
                  <td className="py-2.5 font-mono">{coa.molecularMassFound}</td>
                  <td className="py-2.5 text-right font-bold text-emerald-700">Conforms</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium">Heavy Metals (Pb, As, Cd, Hg)</td>
                  <td className="py-2.5 text-gray-500">&lt; 10 ppm</td>
                  <td className="py-2.5">&lt; 0.5 ppm</td>
                  <td className="py-2.5 text-right font-bold text-emerald-700">Pass</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium">Bacterial Endotoxin</td>
                  <td className="py-2.5 text-gray-500">&lt; 0.05 EU/mg</td>
                  <td className="py-2.5 font-mono">{coa.endotoxinLevel}</td>
                  <td className="py-2.5 text-right font-bold text-emerald-700">Pass</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium">Sterility Assay (USP &lt;71&gt;)</td>
                  <td className="py-2.5 text-gray-500">No Growth (14 days)</td>
                  <td className="py-2.5">Clear / Sterile</td>
                  <td className="py-2.5 text-right font-bold text-emerald-700">Pass</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Analyst & Signatory Stamp */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="text-gray-400">Testing Laboratory:</p>
              <p className="font-semibold text-gray-800">{coa.testingLab}</p>
              <p className="text-gray-500">Lead Analyst: {coa.analyst}</p>
            </div>

            {/* Official seal badge */}
            <div className="border-2 border-dashed border-[#3E481D]/40 rounded-xl p-3 bg-[#F4F4EA] flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#3E481D]" />
              <div>
                <p className="font-bold text-[#3E481D] text-[11px] leading-tight">INDEPENDENT VERIFICATION</p>
                <p className="text-[10px] text-[#707E46]">Peptides Nepal Quality Assurance</p>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <p className="text-[10px] text-gray-400 italic text-center">
            Note: This certificate reflects laboratory analysis of the retained representative sample from the stated batch lot.
          </p>
        </div>

      </div>
    </div>
  );
};
