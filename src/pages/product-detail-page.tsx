import { Button } from 'antd';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { ProductType } from '../types/product';
import { formatCurrency } from '../utils/format';

interface ProductDetailPageProps {
  product: ProductType | null;
  onAddToCart: (product: ProductType) => void;
}

export function ProductDetailPage({ product, onAddToCart }: ProductDetailPageProps) {
  if (!product) {
    return (
      <section
        className="rounded-[2rem] border border-dashed p-10 text-center"
        style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
      >
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Product not found
        </h2>
        <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          The requested product could not be loaded from the storefront API.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        className="overflow-hidden rounded-[2rem] border shadow-soft"
        style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
      >
        <img src={product.image} alt={product.name} className="h-full min-h-[420px] w-full object-cover" />
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
        <div className={`inline-flex rounded-full bg-gradient-to-r ${product.accent} px-4 py-2 text-sm font-semibold text-white`}>
          {product.category}
        </div>
        <h2 className="mt-6 text-4xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {product.name}
        </h2>

        <div className="mt-4 flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1" style={{ background: 'var(--color-bg-surface-soft)' }}>
            <Star className="h-4 w-4 fill-current text-amber-400" />
            {product.rating} / 5 rating
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1" style={{ background: 'var(--color-bg-surface-soft)' }}>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            2-year support
          </span>
        </div>

        <p className="mt-6 text-lg leading-8" style={{ color: 'var(--color-text-secondary)' }}>
          {product.description}
        </p>

        <div
          className="mt-8 rounded-[1.75rem] border p-6"
          style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface-soft)' }}
        >
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Price</p>
              <p className="mt-2 text-4xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {formatCurrency(product.price)}
              </p>
            </div>
            <Button type="primary" size="large" onClick={() => onAddToCart(product)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Add to cart
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Fast delivery', 'Arrives in 2-4 days'],
            ['Returns', '30-day easy returns'],
            ['Support', 'Live chat included'],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-[1.5rem] border p-4"
              style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
            >
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
