import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import { useCartStore } from '../../stores/cart-store';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const itemCount = useCartStore((state) => state.itemCount);
  const toggleCart = useCartStore((state) => state.toggleCart);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button type="button" onClick={() => onNavigate('/')} className="text-left">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent-600">Luma Commerce</p>
          <h1 className="text-lg font-semibold text-slate-950 dark:text-white">Interactive Storefront</h1>
        </button>

        <nav className="hidden gap-2 md:flex">
          {[
            ['/', 'Home'],
            ['/products', 'Products'],
            ['/auth', 'Account'],
            ['/admin', 'Admin'],
          ].map(([key, label]) => {
            const isActive = key === '/' ? currentPath === '/' : currentPath === key || currentPath.startsWith(`${key}/`);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => toggleCart(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white transition hover:scale-[1.03] dark:bg-white dark:text-slate-950"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <motion.span
              key={itemCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-xs font-semibold text-white"
            >
              {itemCount}
            </motion.span>
          </button>
        </div>
      </div>
    </header>
  );
}
