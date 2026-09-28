import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuide, guides } from "@/lib/guides";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  return guide ? { title: guide.title, description: guide.summary } : { title: "Guide not found" };
}

export default async function GuidePage({ params }: { params: Params }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const others = guides.filter((g) => g.slug !== guide.slug);

  return (
    <article>
      <header className="border-b border-line bg-gradient-to-b from-mist to-paper">
        <div className="container max-w-3xl py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
            <Link href="/guides" className="hover:text-ink-900">
              Protocols & guides
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink-800">{guide.tag}</span>
          </nav>
          <h1 className="mt-5 font-display text-display-lg text-ink-950">{guide.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-600">{guide.summary}</p>
          <p className="mt-6 text-sm text-ink-400">{guide.readingMinutes} min read</p>
        </div>
      </header>

      <div className="container max-w-3xl py-12">
        <div className="space-y-12">
          {guide.sections.map((s, i) => (
            <section key={s.heading} className="prose-clinical">
              <h2 className="mb-4 flex items-baseline gap-3 font-display text-2xl text-ink-900">
                <span className="font-mono text-sm text-sage-600">{String(i + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <aside className="mt-14 rounded-2xl border border-line bg-mist/60 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Sources</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
            {guide.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink-700 underline decoration-ink-200 underline-offset-4 hover:text-ink-950 hover:decoration-ink-500">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        {others.length > 0 && (
          <nav aria-label="More guides" className="mt-14 border-t border-line pt-10">
            <p className="eyebrow">Keep reading</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                    <span className="font-display text-lg text-ink-900">{g.title}</span>
                    <span className="mt-1 block text-sm text-ink-500">{g.readingMinutes} min read</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </article>
  );
}
