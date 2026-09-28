import Link from "next/link";

import Chromatogram from "@/components/Chromatogram";
import { ArrowRight, DocumentIcon, FlaskIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";
import { guides } from "@/lib/guides";
import { whatsappLink } from "@/lib/site";

export const revalidate = 60;

const categoryAccents: Record<string, { from: string; dot: string }> = {
  "anti-aging": { from: "from-sage-50", dot: "bg-sage-300" },
  fitness: { from: "from-ink-50", dot: "bg-ink-400" },
  recovery: { from: "from-sage-100/70", dot: "bg-sage-500" },
};

export default async function HomePage() {
  const [categories, latest] = await Promise.all([getCategories(), getProducts({ sort: "newest", pageSize: 4 })]);
  const wa = whatsappLink("Hi Peptides Nepal, I have a question before ordering.");

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]" />
        <div aria-hidden className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-sage-200/40 blur-3xl" />
        <div className="container relative grid items-center gap-14 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.08fr_1fr] lg:pb-28">
          <div className="motion-safe:animate-fade-up">
            <p className="eyebrow">Lab-verified research peptides</p>
            <h1 className="mt-5 text-balance font-display text-display-xl font-normal text-ink-950">
              Know what’s in the vial <em className="font-light italic text-sage-600">before</em> you order.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
              Every product page shows the batch’s HPLC purity and its Certificate of Analysis. Read the lab report
              first, then decide.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">
                Shop peptides <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/lab-results" className="btn-secondary">
                See lab results
              </Link>
            </div>
            <ul className="mt-10 grid max-w-xl gap-4 text-sm text-ink-600 sm:grid-cols-3">
              {[
                { icon: FlaskIcon, text: "HPLC purity shown per batch" },
                { icon: DocumentIcon, text: "COA on every product page" },
                { icon: ShieldIcon, text: "eSewa, Khalti or COD" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage-100 text-sage-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* COA preview card */}
          <div className="relative mx-auto w-full max-w-md motion-safe:animate-fade-up [animation-delay:150ms] lg:max-w-none">
            <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-sage-100 via-white to-ink-100 opacity-80" />
            <div className="card overflow-hidden shadow-lift">
              <div className="flex items-center justify-between border-b border-line bg-mist/70 px-6 py-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink-400">Certificate of Analysis</p>
                  <p className="mt-0.5 font-display text-lg text-ink-900">HPLC chromatogram</p>
                </div>
                <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-800">Per batch</span>
              </div>
              <div className="px-6 pb-2 pt-6">
                <Chromatogram className="h-auto w-full" />
                <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-ink-300">
                  <span>0 min</span>
                  <span>Retention time</span>
                  <span>30 min</span>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-px border-t border-line bg-line text-sm">
                {[
                  ["Purity", "Main peak ÷ all peaks"],
                  ["Identity", "Measured vs expected mass"],
                  ["Batch", "Matches the vial label"],
                  ["Report", "Linked on the product page"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white px-6 py-4">
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-400">{k}</dt>
                    <dd className="mt-1 text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      {categories.length > 0 && (
        <section className="container py-16 md:py-20">
          <SectionHeading eyebrow="Shop by category" title="Find the research area you need" href="/shop" cta="All products" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {categories.map((c, i) => {
              const accent = categoryAccents[c.slug] ?? { from: "from-mist", dot: "bg-ink-300" };
              return (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className={`group relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-2xl border border-line bg-gradient-to-br ${accent.from} to-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-ink-400">0{i + 1}</span>
                    <span className="flex gap-1.5" aria-hidden>
                      <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                      <span className={`h-2.5 w-2.5 rounded-full ${accent.dot} opacity-60`} />
                      <span className={`h-2.5 w-2.5 rounded-full ${accent.dot} opacity-30`} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-display-md text-ink-900">{c.name}</h3>
                    {c.description && <p className="mt-2 text-sm leading-relaxed text-ink-600">{c.description}</p>}
                    <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-800">
                      {c.product_count} {c.product_count === 1 ? "product" : "products"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------- Latest products ---------------- */}
      {latest && latest.items.length > 0 && (
        <section className="container py-16 md:py-20">
          <SectionHeading eyebrow="In stock now" title="Newest in the catalogue" href="/shop" cta="Browse the shop" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latest.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- How verification works ---------------- */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="overflow-hidden rounded-[2rem] bg-ink-900 px-6 py-14 text-white sm:px-12 md:py-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-sage-300">How it works</p>
                <h2 className="mt-4 font-display text-display-lg">Proof first. Checkout second.</h2>
                <p className="mt-5 max-w-md leading-relaxed text-ink-200">
                  A purity number means little without the report behind it. So the report sits next to the price.
                </p>
                <Link href="/guides/how-to-read-a-coa" className="btn mt-8 bg-white text-ink-900 hover:bg-sage-50">
                  Learn to read a COA
                </Link>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: FlaskIcon, title: "Each batch is tested", text: "HPLC measures purity. Mass spectrometry confirms identity." },
                  { icon: DocumentIcon, title: "The report goes live", text: "The COA and purity figure are added to the product page." },
                  { icon: ShieldIcon, title: "You check it first", text: "Match the batch number and the result before you pay." },
                  { icon: TruckIcon, title: "We pack and ship", text: "Pay by eSewa, Khalti or cash on delivery." },
                ].map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.07]">
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-sage-400/15 text-sage-300">
                        <Icon />
                      </span>
                      <span className="font-mono text-xs text-ink-300">Step {i + 1}</span>
                    </div>
                    <h3 className="mt-5 font-display text-xl">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-200">{text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Guides ---------------- */}
      <section className="container py-16 md:py-20">
        <SectionHeading eyebrow="Protocols & guides" title="Plain-language guides" href="/guides" cta="All guides" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {guides.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="card group flex flex-col p-7 transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-mist px-3 py-1 font-medium text-ink-600">{g.tag}</span>
                <span className="text-ink-400">{g.readingMinutes} min read</span>
              </div>
              <h3 className="mt-6 font-display text-xl leading-snug text-ink-900">{g.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">{g.summary}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sage-700">
                Read guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Contact band ---------------- */}
      <section className="container pb-8 pt-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-sage-200 bg-gradient-to-br from-sage-50 via-white to-ink-50 px-6 py-12 sm:px-12">
          <FlaskIcon aria-hidden className="absolute -right-6 -top-6 h-40 w-40 text-sage-200/60" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-display-md text-ink-900">Questions before you order?</h2>
              <p className="mt-2 max-w-lg text-ink-600">Ask about a batch, a lab report or delivery. A person reads every message.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-accent">
                  Chat on WhatsApp
                </a>
              )}
              <Link href="/contact" className="btn-secondary">
                Send a message
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 font-display text-display-lg text-ink-950">{title}</h2>
      </div>
      <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-950">
        {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
