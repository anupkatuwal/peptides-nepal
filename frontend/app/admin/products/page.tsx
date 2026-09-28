"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminHeading, useAdminApi } from "@/components/admin/AdminShell";
import PurityBadge from "@/components/PurityBadge";
import { ApiError } from "@/lib/api";
import { cn, formatPrice } from "@/lib/format";
import type { AdminProduct } from "@/lib/types";

export default function AdminProductsPage() {
  const api = useAdminApi();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<AdminProduct[]>("/api/admin/products")
      .then(setProducts)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load products."));
  }, [api]);

  return (
    <>
      <AdminHeading title="Products & lab results">
        <Link href="/admin/products/new" className="btn-primary">
          Add product
        </Link>
      </AdminHeading>

      {error && <p className="alert-error mb-4">{error}</p>}
      {products === null && !error && <p className="text-ink-500">Loading…</p>}

      {products && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-[0.12em] text-ink-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Product</th>
                <th scope="col" className="px-5 py-3 font-semibold">Price</th>
                <th scope="col" className="px-5 py-3 font-semibold">Stock</th>
                <th scope="col" className="px-5 py-3 font-semibold">Lab result</th>
                <th scope="col" className="px-5 py-3 font-semibold">COA</th>
                <th scope="col" className="px-5 py-3 font-semibold"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id} className={cn("hover:bg-mist/40", !p.is_active && "opacity-60")}>
                  <td className="px-5 py-4">
                    <span className="font-medium text-ink-900">{p.name}</span>
                    <span className="block text-xs text-ink-500">
                      {p.category.name}
                      {!p.is_active && " · Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4 tabular-nums">{formatPrice(p.price)}</td>
                  <td className={cn("px-5 py-4 tabular-nums", p.stock_level === 0 ? "text-red-700" : p.stock_level <= 5 && "text-amber-700")}>
                    {p.stock_level}
                  </td>
                  <td className="px-5 py-4"><PurityBadge purity={p.purity_percentage} /></td>
                  <td className="px-5 py-4">
                    {p.coa_image_url ? (
                      <a href={p.coa_image_url} target="_blank" rel="noopener noreferrer" className="text-sage-700 underline">View</a>
                    ) : (
                      <span className="text-ink-400">Missing</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-ink-800 hover:text-ink-950">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
