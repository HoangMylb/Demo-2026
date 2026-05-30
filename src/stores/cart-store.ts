import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, ProductType } from '../types/product';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  totalPrice: number;
  addItem: (product: ProductType) => void;
  removeItem: (productId: string) => void;
  toggleCart: (value?: boolean) => void;
  clearCart: () => void;
}

function calculateItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function calculateTotalPrice(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      totalPrice: 0,
      addItem: (product) => {
        const existingItem = get().items.find((item) => item.id === product.id);

        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            ),
            itemCount: calculateItemCount(
              state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            ),
            totalPrice: calculateTotalPrice(
              state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            ),
            isOpen: true,
          }));
          return;
        }

        set((state) => ({
          items: [...state.items, { ...product, quantity: 1 }],
          itemCount: calculateItemCount([...state.items, { ...product, quantity: 1 }]),
          totalPrice: calculateTotalPrice([...state.items, { ...product, quantity: 1 }]),
          isOpen: true,
        }));
      },
      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== productId);

          return {
            items,
            itemCount: calculateItemCount(items),
            totalPrice: calculateTotalPrice(items),
          };
        }),
      toggleCart: (value) =>
        set((state) => ({
          isOpen: typeof value === 'boolean' ? value : !state.isOpen,
        })),
      clearCart: () => set({ items: [], itemCount: 0, totalPrice: 0 }),
    }),
    {
      name: 'luma-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
