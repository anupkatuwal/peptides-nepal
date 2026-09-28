import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { guides } from "@/lib/guides";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Protocols & guides",
  description: "Plain-language guides: reading a Certificate of Analysis, how signalling peptides work, and what lyophilised means.",
};

export default function GuidesPage() {
  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-mist to-paper">
        <div className="container py-14 md:py-20">
          <p className="eyebrow">Protocols & guides</p>
          <h1 className="mt-4 max-w-3xl font-display text-display-lg text-ink-950">Short guides. Plain English. Sources at the end.</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-600">
            How lab testing works, how peptides act in the body, and why peptides ship as a dry powder.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g, i) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="card group flex flex-col p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-ink-400">0{i + 1}</span>
                <span className="rounded-full bg-mist px-3 py-1 font-medium text-ink-600">{g.tag}</span>
              </div>
              <h2 className="mt-8 font-display text-2xl leading-snug text-ink-900">{g.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-ink-600">{g.summary}</p>
              <div className="mt-8 flex items-center justify-between text-sm">
                <span className="text-ink-400">{g.readingMinutes} min read</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-sage-700">
                  Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <a
          href={site.educationSite}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-10 flex flex-col justify-between gap-4 rounded-2xl border border-sage-200 bg-sage-50/60 p-8 transition hover:bg-sage-50 sm:flex-row sm:items-center"
        >
          <div>
            <p className="eyebrow">Research guide</p>
            <p className="mt-2 font-display text-xl text-ink-900">Peptide-by-peptide evidence, with a source for every claim</p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-medium text-sage-800">
            Open the guide ↗
          </span>
        </a>
      </section>
    </>
  );
}
