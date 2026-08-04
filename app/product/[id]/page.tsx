import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StarRating } from "../../page";
import { createClient } from "@supabase/supabase-js";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock: number;
  avg_rating: number | null;
  rating_count: number;
};

async function getProduct(id: string): Promise<Product | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return null;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, price, stock, image_url")
    .eq("id", numericId)
    .single();

  if (error || !data) return null;

  const { data: ratingsData } = await supabase
    .from("ratings")
    .select("rating")
    .eq("product_id", numericId);

  let avg_rating: number | null = null;
  let rating_count = 0;

  if (ratingsData && ratingsData.length > 0) {
    const sum = ratingsData.reduce((acc, r) => acc + Number(r.rating), 0);
    avg_rating = Number((sum / ratingsData.length).toFixed(1));
    rating_count = ratingsData.length;
  }

  return { ...data, avg_rating, rating_count };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found | Memento Curated" };
  return {
    title: `${product.name} | Memento Curated`,
    description: product.description ?? "Luxury jewelry from Memento Curated.",
    openGraph: {
      title: product.name,
      description: product.description ?? "Luxury jewelry from Memento Curated.",
      images: product.image_url ? [product.image_url] : ["/logo.png"],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <section className="py-24 border-t border-white/5 bg-zinc-950 relative">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <Link
          href="/#collections"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:text-gold-400 transition-colors mb-12"
        >
          ← Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-zinc-900 border border-white/10">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-zinc-900 text-zinc-600">
                <svg
                  className="h-12 w-12 opacity-30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs uppercase tracking-widest opacity-50 text-center px-4 leading-relaxed">
                  {product.name}
                </span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-gold-400">
              {product.category}
            </div>
            {product.stock === 0 && (
              <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white">
                Sold out
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-mono font-semibold text-gold-400">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500">|</span>
                <span className="text-xs text-zinc-400">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StarRating value={product.avg_rating} count={product.rating_count} />
            </div>

            {product.description && (
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="space-y-3 pt-4">
              <button
                disabled={product.stock === 0}
                className="w-full h-12 rounded-full bg-gold-400 text-zinc-950 text-sm font-bold uppercase tracking-wider transition-all hover:bg-gold-400/90 active:scale-[0.98] shadow-[0_8px_20px_-4px_rgba(212,175,55,0.4)] disabled:opacity-40 disabled:pointer-events-none"
              >
                {product.stock === 0 ? "Out of stock" : "Inquire to Purchase"}
              </button>
              <Link
                href="/#collections"
                className="flex items-center justify-center text-center h-12 rounded-full border border-white/10 bg-zinc-900/40 text-zinc-300 text-sm font-semibold uppercase tracking-wider transition-all hover:border-gold-400/40 hover:text-gold-400 active:scale-[0.98]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
