import type { Metadata } from "next";
import Link from "next/link";

import { DocumentIcon } from "@/components/icons";
import PurityBadge from "@/components/PurityBadge";
import { getProducts } from "@/lib/api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lab results & Certificates of Analysis",
  description: "HPLC purity and the Certificate of Analysis for every product we sell, in one table.",
};

export default async function LabResultsPage() {
  const result = await getProducts({ sort: "name", pageSize: 60 });
  const products = result?.items ?? [];
  const published = products.filter((p) => p.purity_percentage !== null).length;

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-mist to-paper">
        <div className="container grid gap-10 py-14 md:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Lab results / COA</p>
            <h1 className="mt-4 font-display text-display-lg text-ink-950">Every batch. Every report.</h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-600">
              The table below lists the purity result and the Certificate of Analysis for the batch of each product we are
              selling now. Match the batch number on the report with the label on your vial.
            </p>
          </div>
          {products.length > 0 && (
            <dl className="grid grid-cols-2 gap-4">
              <div className="card p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Products</dt>
                <dd className="mt-2 font-mono text-3xl text-ink-950">{products.length}</dd>
              </div>
              <div className="card p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Reports published</dt>
                <dd className="mt-2 font-mono text-3xl text-ink-950">
                  {published}
                  <span className="text-lg text-ink-400">/{products.length}</span>
                </dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <section className="container py-12">
        {result === null ? (
          <p className="alert-error">We couldn’t load lab results right now. Please refresh in a moment.</p>
        ) : products.length === 0 ? (
          <p className="text-ink-600">No products listed yet.</p>
        ) : (
          <div className="card overflow-hidden">
            {/* Desktop table */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-[0.14em] text-ink-500">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Product</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Category</th>
                  <th scope="col" className="px-6 py-4 font-semibold">HPLC purity</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-mist/40">
                    <td className="px-6 py-5">
                      <Link href={`/products/${p.slug}`} className="font-medium text-ink-900 hover:text-sage-700">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-ink-600">{p.category.name}</td>
                    <td className="px-6 py-5">
                      <PurityBadge purity={p.purity_percentage} />
                    </td>
                    <td className="px-6 py-5">
                      <CoaLink url={p.coa_image_url} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="divide-y divide-line md:hidden">
              {products.map((p) => (
                <li key={p.id} className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/products/${p.slug}`} className="font-medium text-ink-900">
                      {p.name}
                    </Link>
                    <span className="shrink-0 text-xs text-ink-500">{p.category.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <PurityBadge purity={p.purity_percentage} />
                    <CoaLink url={p.coa_image_url} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["HPLC purity", "Share of the main peak out of all peaks the detector sees. It measures how much of the sample is one compound."],
            ["Mass spectrometry", "Measures the molecule’s mass and compares it with the expected mass. It confirms which compound it is."],
            ["Batch number", "Links a report to one production run. It should match the number on your vial."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg text-ink-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-500">
          More detail in{" "}
          <Link href="/guides/how-to-read-a-coa" className="font-medium text-sage-700 underline-offset-4 hover:underline">
            How to read a Certificate of Analysis
          </Link>
          .
        </p>
      </section>
    </>
  );
}

function CoaLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-sm text-ink-400">Pending</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-800 transition hover:border-sage-300 hover:bg-sage-50"
    >
      <DocumentIcon className="h-4 w-4" /> View COA
    </a>
  );
}
