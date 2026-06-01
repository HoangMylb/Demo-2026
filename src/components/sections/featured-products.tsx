import type { ProductType } from '../../types/product';
import { ProductCard } from '../product/product-card';

interface FeaturedProductsProps {
  products: ProductType[];
  onViewDetails: (product: ProductType) => void;
  onAddToCart: (product: ProductType) => void;
}

export function FeaturedProducts({ products, onViewDetails, onAddToCart }: FeaturedProductsProps) {
  const featuredProducts = products.filter((product) => product.featured).slice(0, 3);

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Featured products</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Curated to feel premium at first glance</h2>
        </div>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          These cards now come from the live storefront products API so homepage inventory matches the backend.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} onAddToCart={onAddToCart} />
        ))}
      </div>
      {featuredProducts.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-semibold text-slate-950 dark:text-white">No featured products yet</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Once the backend has products, featured items will appear here automatically.</p>
        </div>
      ) : null}
    </section>
  );
}
