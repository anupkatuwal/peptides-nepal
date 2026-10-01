import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ExternalLink } from 'lucide-react';
import { StatusChip } from '../components/design';

export const GuidesPage: React.FC = () => {
  const { guides, selectedGuideId } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'In trials' | 'Not approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Opened from the home page list: jump to that guide.
  useEffect(() => {
    if (!selectedGuideId) return;
    const t = setTimeout(() => document.getElementById(selectedGuideId)?.scrollIntoView({ block: 'start' }), 60);
    return () => clearTimeout(t);
  }, [selectedGuideId]);

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

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'Approved', label: 'Approved' },
    { id: 'In trials', label: 'In trials' },
    { id: 'Not approved', label: 'Not approved' },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-20">
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-black text-[#0E2A23] leading-[1.02]">The peptide evidence guide</h1>
        <p className="prose-serif mt-5 text-lg text-[#3F574D]">
          Plain-language summaries of the peptides people in Nepal ask about most: what they are, what the research shows,
          their status with Nepal's DDA and the World Anti-Doping Agency, and the studies you can read yourself.
        </p>
      </header>

      <dl className="mt-8 grid sm:grid-cols-3 gap-x-8 gap-y-3 text-[15px] border-y border-[#CBD5CF] py-5">
        <div className="flex gap-3 items-start"><dt><StatusChip status="Approved" /></dt><dd className="text-[#3F574D] pt-1">A licensed medicine, prescribed by a doctor.</dd></div>
        <div className="flex gap-3 items-start"><dt><StatusChip status="In trials" /></dt><dd className="text-[#3F574D] pt-1">Being tested in people. Not approved anywhere yet.</dd></div>
        <div className="flex gap-3 items-start"><dt><StatusChip status="Not approved" /></dt><dd className="text-[#3F574D] pt-1">Mostly animal or lab studies.</dd></div>
      </dl>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter by status">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              aria-pressed={statusFilter === item.id}
              className={`px-4 py-2 rounded-md text-sm font-semibold border whitespace-nowrap transition-colors ${
                statusFilter === item.id ? 'bg-[#0E2A23] text-white border-[#0E2A23]' : 'bg-transparent text-[#0E2A23] border-[#CBD5CF] hover:border-[#0E2A23]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Search the guides</span>
          <Search className="w-4 h-4 text-[#4B635A] absolute left-3.5 top-3.5" />
          <input
            type="search"
            placeholder="Search: WADA, weight, healing"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#CBD5CF] rounded-lg text-[15px] text-[#0E2A23] focus:outline-none focus:border-[#0E2A23]"
          />
        </label>
      </div>

      {filteredGuides.length === 0 && (
        <p className="mt-12 text-[#3F574D]">No guide matches that. Try another word, or choose All.</p>
      )}

      <div className="mt-6">
        {filteredGuides.map((guide) => (
          <article key={guide.id} id={guide.id} className="scroll-mt-24 py-10 border-b border-[#CBD5CF]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E2A23]">{guide.name}</h2>
                <p className="mt-1 text-[15px] text-[#4B635A]">Also known as {guide.aka}</p>
              </div>
              <StatusChip status={guide.status} label={guide.badge} />
            </div>

            <div className="mt-8 grid lg:grid-cols-[2fr_1fr] gap-10">
              <dl className="space-y-5">
                {guide.facts.map((fact, index) => (
                  <div key={index}>
                    <dt className="font-bold text-[#0E2A23]">{fact.label}</dt>
                    <dd className="prose-serif mt-1 text-[17px] text-[#10241E] max-w-[65ch]">{fact.text}</dd>
                  </div>
                ))}
              </dl>

              <aside className="space-y-5 text-[15px]">
                {guide.nepalRegulatoryStatus && (
                  <div className="border-l-4 border-[#2152B8] pl-4">
                    <p className="font-bold text-[#0E2A23]">In Nepal (DDA)</p>
                    <p className="mt-1 text-[#3F574D]">{guide.nepalRegulatoryStatus}</p>
                  </div>
                )}
                {guide.dopingStatus && (
                  <div className="border-l-4 border-[#C2362B] pl-4">
                    <p className="font-bold text-[#0E2A23]">In sport (WADA)</p>
                    <p className="mt-1 text-[#3F574D]">{guide.dopingStatus}</p>
                  </div>
                )}
              </aside>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold text-[#0E2A23]">Sources</h3>
              <ul className="mt-2 space-y-1.5">
                {guide.sources.map((s, idx) => (
                  <li key={idx}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-[15px] text-[#2152B8] hover:underline underline-offset-4">
                      <span>{s.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 mt-1 shrink-0" aria-hidden="true" />
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
