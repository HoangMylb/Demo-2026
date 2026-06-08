import { Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import type { AdminProduct } from '../../types/admin';
import { formatCurrency } from '../../utils/format';

interface AdminProductsTableProps {
  products: AdminProduct[];
  searchValue: string;
  deletingProductId: number | null;
  onCreate: () => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (productId: number) => Promise<void>;
  onSearchChange: (value: string) => void;
}

export function AdminProductsTable({ products, searchValue, deletingProductId, onCreate, onEdit, onDelete, onSearchChange }: AdminProductsTableProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Product management</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Inventory table</h3>
        </div>
        <Button type="button" variant="secondary" onClick={onCreate}>
          Add product
        </Button>
      </div>

      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Filter by product name, description, or category"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-accent-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:focus:border-accent-500"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Updated</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.imageUrl} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{product.name}</p>
                      <p className="mt-1 max-w-md text-slate-500 dark:text-slate-400">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{product.categoryName}</td>
                <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(product.updatedAtUtc).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2" onClick={() => onEdit(product)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2" onClick={() => void onDelete(product.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  No products match the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
