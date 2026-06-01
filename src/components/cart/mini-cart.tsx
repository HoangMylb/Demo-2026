import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { useCartStore } from '../../stores/cart-store';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/button';

interface MiniCartProps {
  visible: boolean;
}

export function MiniCart({ visible }: MiniCartProps) {
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  if (!visible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCart(false)}
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm"
            aria-label="Close cart overlay"
          />

          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600">Your cart</p>
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Ready to check out</h2>
              </div>
              <Button
                type="button"
                onClick={() => toggleCart(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center dark:border-slate-800 dark:bg-slate-900/70">
                  <ShoppingCart className="mb-4 h-10 w-10 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your cart is empty</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Add a product and the drawer will update instantly via Zustand.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Qty {item.quantity}</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-auto text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
                <span className="text-xl font-semibold text-slate-950 dark:text-white">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={clearCart}>
                  Clear
                </Button>
                <Button variant="secondary" className="flex-1">
                  Checkout
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
