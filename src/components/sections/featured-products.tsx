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
          <p className="text-sm font-medium uppercase tracking-[0.28em]" style={{ color: 'var(--color-brand-600)' }}>Featured products</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Curated to feel premium at first glance</h2>
        </div>
        <p className="max-w-md text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          These cards now come from the live storefront products API so homepage inventory matches the backend.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} onAddToCart={onAddToCart} />
        ))}
      </div>
      {featuredProducts.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed p-10 text-center" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}>
          <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>No featured products yet</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Once the backend has products, featured items will appear here automatically.</p>
        </div>
      ) : null}
    </section>
  );
}
