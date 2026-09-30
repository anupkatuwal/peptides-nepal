import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ExternalLink, ShieldCheck, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';

export const GuidesPage: React.FC = () => {
  const { guides } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'In trials' | 'Not approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = guides.filter((g) => {
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchAka = g.aka.toLowerCase().includes(q);
      const matchFacts = g.facts.some(f => f.text.toLowerCase().includes(q) || f.label.toLowerCase().includes(q));
      if (!matchName && !matchAka && !matchFacts) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="border-b border-[#DCE3CE] pb-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEBD9] text-[#3E481D] text-xs font-bold">
          <BookOpen className="w-4 h-4" />
          <span>Evidence-Based Research Database</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#3E481D] tracking-tight">
          The Peptide Evidence Guide
        </h1>
        <p className="text-base text-[#5f6b3a] max-w-2xl leading-relaxed">
          Plain-language summaries for nine peptides people ask about most in Nepal: where they stand under Nepal DDA regulations, FDA clinical approvals, WADA anti-doping status, and the published human trials you can check yourself.
        </p>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 flex items-start gap-3">
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex-none">
            Approved
          </span>
          <p className="text-xs text-gray-600">
            Licensed as a finished human medicine for specific clinical indications. Requires doctor prescription.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 flex items-start gap-3">
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex-none">
            In trials
          </span>
          <p className="text-xs text-gray-600">
            Being actively evaluated in human clinical trials (Phase 2/3). Not yet commercially approved anywhere.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-red-200 flex items-start gap-3">
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs flex-none">
            Not approved
          </span>
          <p className="text-xs text-gray-600">
            No licensed human drug approval. Evidence is primarily from rodent models or in vitro cellular research.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DCE3CE] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Peptides' },
            { id: 'Approved', label: 'Approved' },
            { id: 'In trials', label: 'In Trials' },
            { id: 'Not approved', label: 'Not Approved' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === item.id
                  ? 'bg-[#3E481D] text-white'
                  : 'bg-[#F4F4EA] text-[#3E481D] hover:bg-[#EAEBD9]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          <input
            type="search"
            placeholder="Search: WADA, weight, healing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-xs font-medium text-[#3E481D] focus:outline-none focus:border-[#3E481D]"
          />
        </div>
      </div>

      {/* Guide Cards */}
      <div className="space-y-6">
        {filteredGuides.map((guide) => (
          <article
            key={guide.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE3CE] shadow-xs space-y-6 hover:border-[#B7C29E] transition-all"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0E0] pb-4">
              <div>
                <h2 className="text-2xl font-black text-[#3E481D] tracking-tight">
                  {guide.name}
                </h2>
                <p className="text-xs text-[#707E46] font-medium mt-0.5">
                  Also known as: {guide.aka}
                </p>
              </div>

              <span className={`self-start sm:self-auto px-3.5 py-1 rounded-full text-xs font-black tracking-wide ${
                guide.status === 'Approved'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : guide.status === 'In trials'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {guide.badge}
              </span>
            </div>

            {/* Facts Grid */}
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-[#2A3312]">
              {guide.facts.map((fact, index) => (
                <div key={index} className="space-y-1 bg-[#F8FAF5] p-4 rounded-xl border border-[#DCE3CE]">
                  <dt className="font-bold text-[#3E481D] text-xs uppercase tracking-wide">
                    {fact.label}
                  </dt>
                  <dd className="text-[#5f6b3a] leading-relaxed">
                    {fact.text}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Nepal & WADA Regulatory Box */}
            <div className="bg-[#F4F4EA] p-4 rounded-xl border border-[#DCE3CE] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5f6b3a]">
              {guide.nepalRegulatoryStatus && (
                <div>
                  <strong className="block text-[#3E481D] font-bold mb-1">
                    Nepal Regulatory Status (DDA):
                  </strong>
                  <p>{guide.nepalRegulatoryStatus}</p>
                </div>
              )}
              {guide.dopingStatus && (
                <div>
                  <strong className="block text-[#3E481D] font-bold mb-1">
                    Sport &amp; Anti-Doping (WADA):
                  </strong>
                  <p>{guide.dopingStatus}</p>
                </div>
              )}
            </div>

            {/* Published Sources & Citations */}
            <div className="pt-2 border-t border-[#F0F0E0]">
              <h4 className="text-xs font-bold text-[#707E46] uppercase tracking-wider mb-2">
                Primary Sources &amp; Literature:
              </h4>
              <ul className="flex flex-wrap gap-2">
                {guide.sources.map((s, idx) => (
                  <li key={idx}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAEBD9] hover:bg-[#DCE3CE] text-xs font-semibold text-[#3E481D] transition-colors"
                    >
                      <span>{s.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#707E46]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
};
