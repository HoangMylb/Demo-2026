import { useEffect, useMemo, useState } from 'react';
import { categories, products } from '../data/products';
import type { ProductType } from '../types/product';
import { ProductFilters } from '../components/product/product-filters';
import { Pagination } from '../components/product/pagination';
import { ProductCard } from '../components/product/product-card';

const PRODUCTS_PER_PAGE = 4;

interface ProductsPageProps {
  onViewDetails: (product: ProductType) => void;
  onAddToCart: (product: ProductType) => void;
}

export function ProductsPage({ onViewDetails, onAddToCart }: ProductsPageProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Product catalog</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Browse a responsive, filterable shopping experience</h2>
      </div>

      <ProductFilters
        search={search}
        selectedCategory={selectedCategory}
        onSearchChange={setSearch}
        onCategoryChange={setSelectedCategory}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} onAddToCart={onAddToCart} />
        ))}
      </div>

      {paginatedProducts.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-semibold text-slate-950 dark:text-white">No products found</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try a broader search or switch to another category.</p>
        </div>
      ) : null}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </section>
  );
}
