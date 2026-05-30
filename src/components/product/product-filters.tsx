import { Search } from 'lucide-react';
import { categories } from '../../data/products';

interface ProductFiltersProps {
  search: string;
  selectedCategory: (typeof categories)[number];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: (typeof categories)[number]) => void;
}

export function ProductFilters({ search, selectedCategory, onSearchChange, onCategoryChange }: ProductFiltersProps) {
  return (
    <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search products, materials, or categories"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-accent-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:focus:border-accent-500"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`rounded-full px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
