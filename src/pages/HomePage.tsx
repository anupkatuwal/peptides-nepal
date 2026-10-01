import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { COAModal } from '../components/COAModal';
import { BatchCOA } from '../types';
import { SequenceSpeller, KindKey, StatusChip } from '../components/design';

type IgPost = { id: string; url: string; date: string; caption: string; images: string[] };

const INSTAGRAM = 'https://www.instagram.com/peptidesnepal/';

function firstLine(caption: string) {
  return caption.split('\n')[0].replace(/\s*[\p{Extended_Pictographic}‍️]+\s*$/u, '').trim();
}

function shortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export const HomePage: React.FC = () => {
  const { products, guides, quizQuestions, getCOAByBatch, navigateTo } = useStore();

  // Latest Instagram posts, from the same file the mobile app reads.
  const [posts, setPosts] = useState<IgPost[]>([]);
  useEffect(() => {
    let alive = true;
    fetch('/data/posts.json')
      .then(r => (r.ok ? r.json() : []))
      .then((list: IgPost[]) => {
        if (!alive || !Array.isArray(list)) return;
        setPosts([...list].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3));
      })
      .catch(() => undefined);
    return () => { alive = false; };
  }, []);

  // One quiz question, answered right here.
  const q = quizQuestions[0];
  const [guess, setGuess] = useState<'myth' | 'fact' | null>(null);

  // Lab result lookup.
  const [batch, setBatch] = useState('');
  const [batchError, setBatchError] = useState('');
  const [openCOA, setOpenCOA] = useState<BatchCOA | null>(null);
  const lookUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch.trim()) return;
    const found = getCOAByBatch(batch.trim());
    if (found) {
      setBatchError('');
      setOpenCOA(found);
    } else {
      setBatchError(`No lab result for "${batch.trim()}". Check the code printed on the box, for example PN-2026-BPC157.`);
    }
  };

  const featured = products.filter(p => p.inStock !== false).slice(0, 3);

  return (
    <div className="pb-8">
      {/* Hero: a real peptide, spelled out */}
      <section className="border-b border-[#CBD5CF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-14 sm:pb-20">
          <h1 className="text-[40px] leading-[1.02] sm:text-6xl lg:text-[78px] font-black text-[#0E2A23] max-w-[14ch]">
            A peptide is a sentence written in 20 letters.
          </h1>
          <p className="prose-serif mt-6 text-lg sm:text-xl text-[#3F574D] max-w-[56ch]">
            Each letter is an amino acid. Learn to read the sentence, and you can read the claims made about it.
            Plain-language guides, with sources, for people in Nepal.
          </p>

          <div className="mt-10 sm:mt-12">
            <SequenceSpeller />
            <KindKey className="mt-4" />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => navigateTo('guides')}
              className="px-6 py-3.5 rounded-lg bg-[#0E2A23] text-white font-semibold text-[15px] hover:bg-[#12352C]"
            >
              Read the guides
            </button>
            <button
              onClick={() => navigateTo('quiz')}
              className="px-6 py-3.5 rounded-lg border-2 border-[#0E2A23] text-[#0E2A23] font-semibold text-[15px] hover:bg-white"
            >
              Take the myth quiz
            </button>
          </div>
        </div>
      </section>

      {/* Evidence board */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E2A23] leading-tight">Where each peptide stands</h2>
            <p className="prose-serif mt-4 text-[17px] text-[#3F574D]">
              One question decides most of what you should believe: has it been approved for people, is it still being tested,
              or has it only been studied in labs and animals?
            </p>
            <dl className="mt-6 space-y-3 text-[15px]">
              <div className="flex gap-3 items-start"><dt><StatusChip status="Approved" /></dt><dd className="text-[#3F574D] pt-1">A licensed medicine, prescribed by a doctor.</dd></div>
              <div className="flex gap-3 items-start"><dt><StatusChip status="In trials" /></dt><dd className="text-[#3F574D] pt-1">Being tested in people. Not approved yet.</dd></div>
              <div className="flex gap-3 items-start"><dt><StatusChip status="Not approved" /></dt><dd className="text-[#3F574D] pt-1">Lab and animal studies only.</dd></div>
            </dl>
          </div>

          <ul className="border-t-2 border-[#0E2A23] min-w-0">
            {guides.map(g => (
              <li key={g.id} className="border-b border-[#CBD5CF]">
                <button
                  onClick={() => navigateTo('guides', { id: g.id })}
                  className="w-full text-left py-4 sm:py-5 flex items-center gap-4 group"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-lg sm:text-xl font-bold text-[#0E2A23] group-hover:underline underline-offset-4">{g.name}</span>
                    <span className="block text-sm text-[#4B635A] truncate">{g.aka}</span>
                  </span>
                  <StatusChip status={g.status} label={g.badge} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Instagram */}
      {posts.length > 0 && (
        <section className="bg-[#0E2A23] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">New on Instagram</h2>
                <p className="mt-2 text-[#B9C7BF] max-w-[52ch]">A new science post every other day, with the sources in the first comment.</p>
              </div>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-lg bg-white text-[#0E2A23] font-semibold text-[15px] hover:bg-[#E4EBE7]"
              >
                Follow @peptidesnepal
              </a>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-3">
              {posts.map(p => (
                <li key={p.id}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="aspect-[4/5] overflow-hidden rounded-lg bg-[#12352C]">
                      {p.images?.[0] && (
                        <img
                          src={p.images[0]}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <p className="mt-3 text-[13px] text-[#8FA79B]">{shortDate(p.date)}</p>
                    <p className="mt-1 font-semibold leading-snug group-hover:underline underline-offset-4">{firstLine(p.caption)}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Try it: a quiz question and a lab result lookup */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid lg:grid-cols-2 gap-6">
        {q && (
          <div className="rounded-xl bg-white border border-[#CBD5CF] p-6 sm:p-8 flex flex-col">
            <h2 className="text-2xl font-extrabold text-[#0E2A23]">Myth or fact?</h2>
            <p className="prose-serif mt-4 text-xl text-[#0E2A23]">“{q.statement}”</p>
            <div className="mt-6 flex gap-3">
              {(['myth', 'fact'] as const).map(choice => (
                <button
                  key={choice}
                  onClick={() => setGuess(choice)}
                  aria-pressed={guess === choice}
                  className={`flex-1 py-3 rounded-lg border-2 font-semibold capitalize transition-colors ${
                    guess === choice ? 'bg-[#0E2A23] text-white border-[#0E2A23]' : 'border-[#0E2A23] text-[#0E2A23] hover:bg-[#F2F5F3]'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
            {guess && (
              <div className="mt-5 text-[15px]" aria-live="polite">
                <p className={`font-bold ${guess === q.answer ? 'text-[#1F8A5B]' : 'text-[#C2362B]'}`}>
                  {guess === q.answer ? 'Correct.' : 'Not quite.'} It’s a {q.answer}.
                </p>
                <p className="mt-1 text-[#3F574D]">{q.explanation}</p>
              </div>
            )}
            <button onClick={() => navigateTo('quiz')} className="mt-auto pt-6 self-start font-semibold text-[#0E2A23] underline underline-offset-4">
              Try all {quizQuestions.length} questions
            </button>
          </div>
        )}

        <div className="rounded-xl bg-white border border-[#CBD5CF] p-6 sm:p-8 flex flex-col">
          <h2 className="text-2xl font-extrabold text-[#0E2A23]">Check a lab result</h2>
          <p className="mt-3 text-[15px] text-[#3F574D] max-w-[46ch]">
            Every box carries a batch code. Enter it to see that batch’s purity test and certificate.
          </p>
          <form onSubmit={lookUp} className="mt-6 flex flex-col sm:flex-row gap-3">
            <label className="sr-only" htmlFor="batch-code">Batch code</label>
            <input
              id="batch-code"
              value={batch}
              onChange={e => setBatch(e.target.value)}
              placeholder="e.g. PN-2026-BPC157"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-[#CBD5CF] bg-[#F7F9F8] text-[#0E2A23] focus:outline-none focus:border-[#0E2A23]"
            />
            <button type="submit" className="px-6 py-3 rounded-lg bg-[#0E2A23] text-white font-semibold hover:bg-[#12352C]">
              Show result
            </button>
          </form>
          {batchError && <p className="mt-3 text-sm text-[#C2362B]" role="alert">{batchError}</p>}
          <button onClick={() => navigateTo('lab-results')} className="mt-auto pt-6 self-start font-semibold text-[#0E2A23] underline underline-offset-4">
            See all lab results
          </button>
        </div>
      </section>

      {/* Shop, after the learning */}
      {featured.length > 0 && (
        <section className="border-t border-[#CBD5CF]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E2A23] leading-tight">Lab-tested supply</h2>
                <p className="mt-2 text-[#3F574D] max-w-[56ch]">Every batch has a purity test you can look up. Prices in Indian rupees, delivered in 10–14 days.</p>
              </div>
              <button onClick={() => navigateTo('shop')} className="px-5 py-3 rounded-lg border-2 border-[#0E2A23] text-[#0E2A23] font-semibold hover:bg-white">
                See all {products.length} products
              </button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {openCOA && <COAModal coa={openCOA} onClose={() => setOpenCOA(null)} />}
    </div>
  );
};
