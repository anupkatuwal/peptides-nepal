"use client";

/* eslint-disable @next/next/no-img-element -- previews of uploaded files */
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminHeading, useAdminApi } from "@/components/admin/AdminShell";
import { useAuth } from "@/components/Providers";
import { ApiError, uploadFile } from "@/lib/api";
import type { AdminProduct, Category, UploadedMedia } from "@/lib/types";

type Form = {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock_level: string;
  purity_percentage: string;
  image_url: string;
  coa_image_url: string;
  is_active: boolean;
};

const EMPTY: Form = {
  category_id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  stock_level: "0",
  purity_percentage: "",
  image_url: "",
  coa_image_url: "",
  is_active: true,
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);

export default function ProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const api = useAdminApi();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [loaded, setLoaded] = useState(isNew);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Category[]>("/api/categories").then(setCategories).catch(() => setCategories([]));
    if (isNew) return;
    api<AdminProduct[]>("/api/admin/products")
      .then((all) => {
        const p = all.find((x) => String(x.id) === id);
        if (!p) {
          setError("Product not found.");
          return;
        }
        setForm({
          category_id: String(p.category.id),
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: String(p.price),
          stock_level: String(p.stock_level),
          purity_percentage: p.purity_percentage === null ? "" : String(p.purity_percentage),
          image_url: p.image_url ?? "",
          coa_image_url: p.coa_image_url ?? "",
          is_active: p.is_active,
        });
        setLoaded(true);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load the product."));
  }, [api, id, isNew]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setSaved(false);
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "name" && isNew && !slugTouched ? { slug: slugify(String(value)) } : {}),
    }));
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const body: Record<string, unknown> = {
      category_id: Number(form.category_id),
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price).toFixed(2),
      stock_level: Number(form.stock_level),
      purity_percentage: form.purity_percentage === "" ? null : Number(form.purity_percentage).toFixed(2),
      image_url: form.image_url.trim() || null,
      coa_image_url: form.coa_image_url.trim() || null,
      is_active: form.is_active,
    };
    try {
      if (isNew) {
        const created = await api<AdminProduct>("/api/products", { method: "POST", body: { ...body, slug: form.slug } });
        router.replace(`/admin/products/${created.id}`);
      } else {
        await api<AdminProduct>(`/api/products/${id}`, { method: "PATCH", body });
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn’t save.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return error ? <p className="alert-error">{error}</p> : <p className="text-ink-500">Loading…</p>;

  return (
    <>
      <AdminHeading title={isNew ? "Add product" : form.name}>
        <Link href="/admin/products" className="text-sm font-medium text-ink-600 hover:text-ink-900">← All products</Link>
      </AdminHeading>

      <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card space-y-5 p-6">
          <h2 className="font-display text-xl text-ink-900">Details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">Name</label>
              <input id="name" required minLength={2} maxLength={150} className="field" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label htmlFor="category" className="field-label">Category</label>
              <select id="category" required className="field" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="" disabled>Choose…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="slug" className="field-label">Web address</label>
            <div className="flex items-center rounded-xl border border-line bg-mist pl-4 text-sm text-ink-500">
              /products/
              <input
                id="slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={160}
                disabled={!isNew}
                className="field rounded-l-none border-0 border-l disabled:bg-mist disabled:text-ink-500"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
              />
            </div>
            {!isNew && <p className="mt-1.5 text-xs text-ink-500">Fixed after creation so links keep working.</p>}
          </div>
          <div>
            <label htmlFor="description" className="field-label">Description</label>
            <textarea id="description" required minLength={10} maxLength={10000} rows={6} className="field" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="field-label">Price (NPR)</label>
              <input id="price" required type="number" min="0" step="0.01" className="field" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div>
              <label htmlFor="stock" className="field-label">Stock</label>
              <input id="stock" required type="number" min="0" step="1" className="field" value={form.stock_level} onChange={(e) => set("stock_level", e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm text-ink-800">
            <input type="checkbox" className="h-5 w-5 rounded border-line text-ink-900 focus:ring-sage-300" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            Show in the shop
          </label>
        </div>

        <div className="space-y-6">
          <div className="card space-y-5 p-6">
            <h2 className="font-display text-xl text-ink-900">Lab results — current batch</h2>
            <div>
              <label htmlFor="purity" className="field-label">HPLC purity (%)</label>
              <input
                id="purity"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="Leave empty until the report arrives"
                className="field"
                value={form.purity_percentage}
                onChange={(e) => set("purity_percentage", e.target.value)}
              />
            </div>
            <FileField label="Certificate of Analysis (image or PDF)" value={form.coa_image_url} onChange={(v) => set("coa_image_url", v)} />
          </div>
          <div className="card p-6">
            <FileField label="Product photo" value={form.image_url} onChange={(v) => set("image_url", v)} imagesOnly />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 xl:col-span-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
          </button>
          {saved && <span className="text-sm text-sage-700" role="status">Saved. The shop updates within a minute.</span>}
          {error && <p className="alert-error w-full" role="alert">{error}</p>}
        </div>
      </form>
    </>
  );
}

function FileField({
  label,
  value,
  onChange,
  imagesOnly = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  imagesOnly?: boolean;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputId = label.replace(/\W+/g, "-").toLowerCase();

  async function onFile(file: File | undefined) {
    if (!file || !token) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("File is larger than 8 MB.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const media = await uploadFile<UploadedMedia>(file, token);
      onChange(media.url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  const isPdf = value.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <p className="field-label">{label}</p>
      {value && (
        <div className="mb-3 overflow-hidden rounded-xl border border-line bg-mist">
          {isPdf ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="block p-4 text-sm text-ink-800 underline">Open PDF</a>
          ) : (
            <a href={value} target="_blank" rel="noopener noreferrer">
              <img src={value} alt="" className="max-h-48 w-full object-contain" />
            </a>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={inputId} className="btn-secondary cursor-pointer px-4 py-2 text-sm">
          {busy ? "Uploading…" : value ? "Replace file" : "Upload file"}
        </label>
        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept={imagesOnly ? "image/png,image/jpeg,image/webp" : "image/png,image/jpeg,image/webp,application/pdf"}
          disabled={busy}
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {value && (
          <button type="button" className="text-sm text-ink-500 hover:text-red-700" onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>
      <input
        aria-label={`${label} link`}
        className="field mt-3 text-xs"
        placeholder="…or paste an https:// link"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
