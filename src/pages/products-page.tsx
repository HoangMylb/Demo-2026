import { useEffect, useMemo, useState } from 'react';
import type { ProductType } from '../types/product';
import { ProductFilters, type ProductCategoryFilter } from '../components/product/product-filters';
import { Pagination } from '../components/product/pagination';
import { ProductCard } from '../components/product/product-card';

const PRODUCTS_PER_PAGE = 4;

interface ProductsPageProps {
  products: ProductType[];
  onViewDetails: (product: ProductType) => void;
  onAddToCart: (product: ProductType) => void;
}

export function ProductsPage({ products, onViewDetails, onAddToCart }: ProductsPageProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryFilter>('All');
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
  }, [products, search, selectedCategory]);

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
        <h2 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Products
        </h2>
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
        <div
          className="mt-6 rounded-[2rem] border border-dashed p-10 text-center"
          style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
        >
          <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            No products found
          </h3>
        </div>
      ) : null}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </section>
  );
}
