import { products } from '../../data/products';
import type { ProductType } from '../../types/product';
import { ProductCard } from '../product/product-card';

interface FeaturedProductsProps {
  onViewDetails: (product: ProductType) => void;
  onAddToCart: (product: ProductType) => void;
}

export function FeaturedProducts({ onViewDetails, onAddToCart }: FeaturedProductsProps) {
  const featuredProducts = products.filter((product) => product.featured).slice(0, 3);

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Featured products</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Curated to feel premium at first glance</h2>
        </div>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          Mock inventory is intentionally varied so filtering, detail views, and cart flows all feel realistic.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}
