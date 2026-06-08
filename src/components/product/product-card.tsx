import { Button } from 'antd';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import type { ProductType } from '../../types/product';
import { formatCurrency } from '../../utils/format';

interface ProductCardProps {
  product: ProductType;
  onViewDetails?: (product: ProductType) => void;
  onAddToCart: (product: ProductType) => void;
}

export function ProductCard({ product, onViewDetails, onAddToCart }: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="group overflow-hidden rounded-[1.75rem] border shadow-sm transition"
      style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className={`absolute inset-x-4 top-4 rounded-full bg-gradient-to-r ${product.accent} px-3 py-1 text-xs font-semibold text-white`}>
          {product.category}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{product.name}</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>{product.description}</p>
          </div>
          <div
            className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
            style={{ background: 'var(--color-bg-surface-soft)', color: 'var(--color-text-secondary)' }}
          >
            <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
            {product.rating}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Starting from</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(product.price)}</p>
          </div>

          <div className="flex gap-2">
            {onViewDetails ? (
              <Button onClick={() => onViewDetails(product)}>
                Details
              </Button>
            ) : null}
            <Button type="primary" onClick={() => onAddToCart(product)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
