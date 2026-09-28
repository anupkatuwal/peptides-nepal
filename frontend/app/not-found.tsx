import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container flex flex-col items-center py-28 text-center">
      <p className="font-mono text-sm text-sage-600">404</p>
      <h1 className="mt-3 font-display text-display-lg text-ink-950">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-600">The page you’re looking for has moved or never existed.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/shop" className="btn-secondary">Visit the shop</Link>
      </div>
    </section>
  );
}
