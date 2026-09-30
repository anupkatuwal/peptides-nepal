import React, { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, HelpCircle, AlertTriangle, Check } from 'lucide-react';

export const DosageCalculatorPage: React.FC = () => {
  const [vialMg, setVialMg] = useState<number>(5);
  const [waterMl, setWaterMl] = useState<number>(2);
  const [desiredDoseMcg, setDesiredDoseMcg] = useState<number>(250);
  const [syringeType, setSyringeType] = useState<100 | 50 | 30>(100);

  // Calculations
  const totalVialMcg = vialMg * 1000;
  const concentrationMcgPerMl = waterMl > 0 ? totalVialMcg / waterMl : 0;
  
  // Volume to draw in ml:
  const volumeToDrawMl = concentrationMcgPerMl > 0 ? desiredDoseMcg / concentrationMcgPerMl : 0;
  
  // In a U-100 syringe: 1.0 ml = 100 units (1 unit = 0.01 ml).
  // In a U-50 syringe: 0.5 ml = 50 units (1 unit = 0.01 ml).
  // In a U-30 syringe: 0.3 ml = 30 units (1 unit = 0.01 ml).
  // So units on any U-100 scale syringe = volume in ml * 100.
  const unitsToDraw = Math.round(volumeToDrawMl * 100 * 10) / 10;
  const totalDosesInVial = desiredDoseMcg > 0 ? Math.floor(totalVialMcg / desiredDoseMcg) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#DCE3CE] pb-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEBD9] text-[#3E481D] text-xs font-bold">
          <Calculator className="w-4 h-4" />
          <span>Precision Laboratory Dilution Tool</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#3E481D] tracking-tight">
          Peptide Reconstitution &amp; Dosage Calculator
        </h1>
        <p className="text-base text-[#5f6b3a] max-w-2xl leading-relaxed">
          Accurately calculate your reconstitution concentration and visual insulin syringe units (IU). Never make volumetric dilution errors with research peptides.
        </p>
      </div>

      {/* Main Interactive Tool Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE3CE] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#3E481D] border-b border-[#F0F0E0] pb-3">
            1. Enter Vial Parameters
          </h2>

          {/* Step 1: Vial Mass */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#3E481D]">
              <span>Peptide Vial Mass (Milligrams - mg)</span>
              <span className="text-[#707E46] font-mono">{vialMg} mg ({vialMg * 1000} mcg)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setVialMg(val)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    vialMg === val
                      ? 'bg-[#3E481D] text-white border-[#3E481D] shadow-xs'
                      : 'bg-[#F4F4EA] text-[#3E481D] border-[#DCE3CE] hover:bg-[#EAEBD9]'
                  }`}
                >
                  {val} mg
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Added Water */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#3E481D]">
              <span>Bacteriostatic Water Added (Milliliters - ml)</span>
              <span className="text-[#707E46] font-mono">{waterMl} ml</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 2.5, 3].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setWaterMl(val)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    waterMl === val
                      ? 'bg-[#3E481D] text-white border-[#3E481D] shadow-xs'
                      : 'bg-[#F4F4EA] text-[#3E481D] border-[#DCE3CE] hover:bg-[#EAEBD9]'
                  }`}
                >
                  {val} ml
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Desired Dose */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#3E481D]">
              <span>Target Dose (Micrograms - mcg)</span>
              <span className="text-[#707E46] font-mono">{desiredDoseMcg} mcg ({(desiredDoseMcg / 1000).toFixed(2)} mg)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[100, 250, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDesiredDoseMcg(val)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    desiredDoseMcg === val
                      ? 'bg-[#3E481D] text-white border-[#3E481D] shadow-xs'
                      : 'bg-[#F4F4EA] text-[#3E481D] border-[#DCE3CE] hover:bg-[#EAEBD9]'
                  }`}
                >
                  {val} mcg
                </button>
              ))}
            </div>
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                Or type custom target dose (mcg):
              </label>
              <input
                type="number"
                value={desiredDoseMcg}
                onChange={(e) => setDesiredDoseMcg(Math.max(10, Number(e.target.value)))}
                step={25}
                className="w-full px-3 py-2 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-xs font-bold text-[#3E481D] focus:outline-none"
              />
            </div>
          </div>

          {/* Step 4: Syringe Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#3E481D]">
              Insulin Syringe Specification:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 100, label: '1.0 ml (100 Unit)' },
                { type: 50, label: '0.5 ml (50 Unit)' },
                { type: 30, label: '0.3 ml (30 Unit)' }
              ].map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => setSyringeType(s.type as any)}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                    syringeType === s.type
                      ? 'bg-[#3E481D] text-white border-[#3E481D]'
                      : 'bg-[#F4F4EA] text-[#3E481D] border-[#DCE3CE]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Output & Interactive Syringe Visualizer */}
        <div className="lg:col-span-6 bg-[#F4F4EA] rounded-3xl p-6 sm:p-8 border border-[#DCE3CE] shadow-sm space-y-6">
          <div className="border-b border-[#DCE3CE] pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#3E481D]">
              2. Calculated Result
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Safe Dilution
            </span>
          </div>

          {/* Big Number Display */}
          <div className="bg-white rounded-2xl p-6 border border-[#DCE3CE] space-y-2 text-center shadow-xs">
            <span className="text-xs font-bold text-[#707E46] uppercase tracking-wider block">
              Draw Insulin Syringe To Mark:
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-black text-[#3E481D]">
                {unitsToDraw}
              </span>
              <span className="text-xl font-bold text-[#707E46]">Units (IU)</span>
            </div>
            <p className="text-xs font-medium text-gray-500 pt-1">
              Equivalent liquid volume: <strong className="text-gray-800">{volumeToDrawMl.toFixed(3)} ml</strong>
            </p>
          </div>

          {/* Syringe Graphical Illustration */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE3CE] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#3E481D]">
              <span>U-{syringeType} Syringe Barrel Visualizer</span>
              <span className="font-mono text-emerald-700">Target: {unitsToDraw} Units</span>
            </div>

            {/* Syringe Barrel Graphic */}
            <div className="relative pt-6 pb-2">
              {/* Syringe Needle & Tip */}
              <div className="w-1.5 h-10 bg-gray-400 mx-auto -mb-2 rounded-t-xs" />
              <div className="w-6 h-3 bg-gray-300 mx-auto rounded-t-xs" />

              {/* Barrel */}
              <div className="w-full max-w-sm mx-auto h-16 bg-gray-50 border-2 border-gray-400 rounded-xl relative overflow-hidden flex items-center shadow-inner">
                {/* Fluid fill line */}
                <div 
                  className="h-full bg-emerald-600/70 border-r-4 border-emerald-800 transition-all duration-500 flex items-center justify-end pr-2 text-white font-mono text-[11px] font-bold"
                  style={{ width: `${Math.min(100, Math.max(0, (unitsToDraw / syringeType) * 100))}%` }}
                >
                  {unitsToDraw > 15 ? `${unitsToDraw}u` : ''}
                </div>

                {/* Major tick markings */}
                <div className="absolute inset-0 flex justify-between px-3 items-end pb-1 pointer-events-none text-[9px] font-mono text-gray-600 font-bold">
                  <span>0</span>
                  <span>{syringeType * 0.25}</span>
                  <span>{syringeType * 0.5}</span>
                  <span>{syringeType * 0.75}</span>
                  <span>{syringeType}</span>
                </div>
              </div>

              {/* Plunger base */}
              <div className="w-20 h-4 bg-gray-300 mx-auto mt-1 rounded-b-md" />
            </div>

            <p className="text-[11px] text-center text-gray-500">
              Align the top rubber ring of the black plunger exactly with the <strong>{unitsToDraw}</strong> unit tick mark.
            </p>
          </div>

          {/* Summary Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-[#DCE3CE]">
              <span className="text-gray-400 block text-[10px]">Reconstituted Concentration</span>
              <span className="font-bold text-[#3E481D]">{concentrationMcgPerMl.toLocaleString()} mcg/ml</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#DCE3CE]">
              <span className="text-gray-400 block text-[10px]">Total Doses in Vial</span>
              <span className="font-bold text-[#3E481D]">{totalDosesInVial} doses</span>
            </div>
          </div>

          {/* Safety Reminder */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-none mt-0.5" />
            <p>
              Always use a new, sterile 31G insulin syringe for each extraction. Never reuse needles, and refrigerate reconstituted solutions at 2°C–8°C.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
