import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { ProductType } from '../types/product';
import { formatCurrency } from '../utils/format';
import { Button } from '../components/ui/button';

interface ProductDetailPageProps {
  product: ProductType;
  onAddToCart: (product: ProductType) => void;
}

export function ProductDetailPage({ product, onAddToCart }: ProductDetailPageProps) {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900"
      >
        <img src={product.image} alt={product.name} className="h-full min-h-[420px] w-full object-cover" />
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
        <div className={`inline-flex rounded-full bg-gradient-to-r ${product.accent} px-4 py-2 text-sm font-semibold text-white`}>
          {product.category}
        </div>
        <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{product.name}</h2>

        <div className="mt-4 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
            <Star className="h-4 w-4 fill-current text-amber-400" />
            {product.rating} / 5 rating
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            2-year support
          </span>
        </div>

        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">{product.description}</p>

        <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
              <p className="mt-2 text-4xl font-semibold text-slate-950 dark:text-white">{formatCurrency(product.price)}</p>
            </div>
            <Button variant="secondary" className="px-7" onClick={() => onAddToCart(product)}>
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
            <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
