import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Amino-acid tiles. Colour = chemical property, in prayer-flag colours:
//   yellow  hydrophobic (avoids water)
//   blue    positive charge
//   red     negative charge
//   green   polar (likes water)
//   white   special shape (glycine, proline)
// ---------------------------------------------------------------------------

type Kind = 'hydrophobic' | 'positive' | 'negative' | 'polar' | 'special';

const AMINO: Record<string, { name: string; kind: Kind }> = {
  A: { name: 'Alanine', kind: 'hydrophobic' },
  V: { name: 'Valine', kind: 'hydrophobic' },
  L: { name: 'Leucine', kind: 'hydrophobic' },
  I: { name: 'Isoleucine', kind: 'hydrophobic' },
  M: { name: 'Methionine', kind: 'hydrophobic' },
  F: { name: 'Phenylalanine', kind: 'hydrophobic' },
  W: { name: 'Tryptophan', kind: 'hydrophobic' },
  K: { name: 'Lysine', kind: 'positive' },
  R: { name: 'Arginine', kind: 'positive' },
  H: { name: 'Histidine', kind: 'positive' },
  D: { name: 'Aspartic acid', kind: 'negative' },
  E: { name: 'Glutamic acid', kind: 'negative' },
  S: { name: 'Serine', kind: 'polar' },
  T: { name: 'Threonine', kind: 'polar' },
  N: { name: 'Asparagine', kind: 'polar' },
  Q: { name: 'Glutamine', kind: 'polar' },
  C: { name: 'Cysteine', kind: 'polar' },
  Y: { name: 'Tyrosine', kind: 'polar' },
  G: { name: 'Glycine', kind: 'special' },
  P: { name: 'Proline', kind: 'special' },
};

const KIND_STYLE: Record<Kind, string> = {
  hydrophobic: 'bg-[#E3A81B] text-[#0E2A23] border-[#E3A81B]',
  positive: 'bg-[#2152B8] text-white border-[#2152B8]',
  negative: 'bg-[#C2362B] text-white border-[#C2362B]',
  polar: 'bg-[#1F8A5B] text-white border-[#1F8A5B]',
  special: 'bg-white text-[#0E2A23] border-[#0E2A23]',
};

export const KIND_LABEL: { kind: Kind; label: string }[] = [
  { kind: 'hydrophobic', label: 'Avoids water' },
  { kind: 'positive', label: 'Positive charge' },
  { kind: 'negative', label: 'Negative charge' },
  { kind: 'polar', label: 'Likes water' },
  { kind: 'special', label: 'Special shape' },
];

export const SEQUENCES = [
  { id: 'bpc', name: 'BPC-157', seq: 'GEPPPGKPADDAGLV', note: '15 amino acids, first described from a protein in stomach juice.' },
  { id: 'oxt', name: 'Oxytocin', seq: 'CYIQNCPLG', note: '9 amino acids, made in your brain. Drives labour and milk release.' },
  { id: 'ghk', name: 'GHK', seq: 'GHK', note: '3 amino acids. Binds copper in blood plasma as GHK-Cu.' },
];

export const AminoTile: React.FC<{ letter: string; size?: 'lg' | 'sm'; index?: number; animate?: boolean }> = ({
  letter, size = 'lg', index = 0, animate = false,
}) => {
  const a = AMINO[letter];
  const dims = size === 'lg'
    ? 'w-[13vw] h-[17vw] max-w-[64px] max-h-[84px] sm:w-[56px] sm:h-[74px] lg:w-[64px] lg:h-[84px] text-[7vw] sm:text-[32px] lg:text-[38px] rounded-lg border-2'
    : 'w-7 h-9 text-base rounded border';
  return (
    <span
      className={`group relative inline-flex items-center justify-center font-display font-black select-none ${dims} ${KIND_STYLE[a.kind]} ${animate ? 'tile-in' : ''}`}
      style={animate ? { animationDelay: `${index * 45}ms` } : undefined}
      title={`${letter}: ${a.name}`}
    >
      <span aria-hidden="true">{letter}</span>
      <span className="sr-only">{a.name}</span>
    </span>
  );
};

export const KindKey: React.FC<{ className?: string }> = ({ className = '' }) => (
  <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#3F574D] ${className}`}>
    {KIND_LABEL.map(k => (
      <li key={k.kind} className="flex items-center gap-2">
        <span className={`inline-block w-3.5 h-3.5 rounded-[3px] border-2 ${KIND_STYLE[k.kind]}`} />
        {k.label}
      </li>
    ))}
  </ul>
);

// A peptide spelled out in tiles, with a switcher between real peptides.
export const SequenceSpeller: React.FC = () => {
  const [current, setCurrent] = useState(SEQUENCES[0]);
  const [picked, setPicked] = useState<number | null>(null);
  const letters = current.seq.split('');

  return (
    <div>
      <div role="tablist" aria-label="Choose a peptide" className="flex flex-wrap gap-2 mb-5">
        {SEQUENCES.map(s => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === current.id}
            onClick={() => { setCurrent(s); setPicked(null); }}
            className={`px-3.5 py-1.5 rounded-md text-sm font-semibold border transition-colors ${
              s.id === current.id
                ? 'bg-[#0E2A23] text-white border-[#0E2A23]'
                : 'bg-transparent text-[#0E2A23] border-[#CBD5CF] hover:border-[#0E2A23]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div key={current.id} className="flex flex-wrap gap-[6px]" aria-label={`${current.name} sequence: ${letters.map(l => AMINO[l].name).join(', ')}`}>
        {letters.map((l, i) => (
          <button
            key={i}
            onClick={() => setPicked(i)}
            className={`rounded-lg transition-transform ${picked === i ? '-translate-y-1.5' : 'hover:-translate-y-1'}`}
            aria-label={`Position ${i + 1}: ${AMINO[l].name}`}
          >
            <AminoTile letter={l} index={i} animate />
          </button>
        ))}
      </div>

      <p className="mt-5 text-[15px] text-[#3F574D] min-h-[1.5em]" aria-live="polite">
        {picked !== null
          ? <>Position {picked + 1}: <strong className="text-[#0E2A23]">{AMINO[letters[picked]].name}</strong> ({letters[picked]}), {KIND_LABEL.find(k => k.kind === AMINO[letters[picked]].kind)!.label.toLowerCase()}.</>
          : <><strong className="text-[#0E2A23]">{current.name}:</strong> {current.note} Tap a letter.</>}
      </p>
    </div>
  );
};

// Evidence status, same colours everywhere on the site.
export const StatusChip: React.FC<{ status: string; label?: string }> = ({ status, label }) => {
  const style =
    status === 'Approved' ? 'bg-[#1F8A5B] text-white'
      : status === 'In trials' ? 'bg-[#E3A81B] text-[#0E2A23]'
        : 'bg-[#C2362B] text-white';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-semibold whitespace-nowrap ${style}`}>
      {label || status}
    </span>
  );
};
