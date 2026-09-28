import type { MetadataRoute } from "next";

import { getCategories, getProducts } from "@/lib/api";
import { guides } from "@/lib/guides";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts({ pageSize: 60 })]);
  const url = (path: string) => `${site.url}${path}`;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/shop"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/lab-results"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/guides"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.4 },
    ...categories.map((c) => ({ url: url(`/shop?category=${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(products?.items ?? []).map((p) => ({ url: url(`/products/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...guides.map((g) => ({ url: url(`/guides/${g.slug}`), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
