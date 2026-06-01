import { useEffect, useMemo, useState } from 'react';
import { AdminStateCard } from '../components/admin/admin-state-card';
import { Button } from '../components/ui/button';
import { createAdminProduct, deleteAdminProduct, getAdminProducts, updateAdminProduct } from '../lib/admin-api';
import { AdminProductsPage } from './admin-products-page';
import type { AdminCategoryOption, AdminProduct, ProductPayload } from '../types/admin';

export function AdminProductsRoute() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo<AdminCategoryOption[]>(() => {
    const categoryMap = new Map<number, AdminCategoryOption>();

    products.forEach((product) => {
      if (!categoryMap.has(product.categoryId)) {
        categoryMap.set(product.categoryId, {
          id: product.categoryId,
          name: product.categoryName,
        });
      }
    });

    return Array.from(categoryMap.values()).sort((left, right) => left.name.localeCompare(right.name));
  }, [products]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const productItems = await getAdminProducts();
      setProducts(productItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const refreshProducts = async () => {
    await loadProducts();
  };

  const handleSubmitProduct = async (values: ProductPayload): Promise<{ message: string }> => {
    let result;

    if (editingProduct) {
      result = await updateAdminProduct(editingProduct.id, values);
    } else {
      result = await createAdminProduct(values);
    }

    await refreshProducts();
    setEditingProduct(null);
    setIsCreateOpen(false);
    return { message: result.message };
  };

  const handleDeleteProduct = async (productId: number): Promise<{ message: string }> => {
    setDeletingProductId(productId);

    try {
      const result = await deleteAdminProduct(productId);
      await refreshProducts();
      if (editingProduct?.id === productId) {
        setEditingProduct(null);
      }
      return result;
    } finally {
      setDeletingProductId(null);
    }
  };

  if (loading && products.length === 0) {
    return <AdminStateCard title="Loading products" description="Fetching inventory data for the product management workspace." />;
  }

  if (error && products.length === 0) {
    return (
      <AdminStateCard
        title="Unable to load products"
        description={error}
        action={
          <Button type="button" variant="secondary" onClick={() => void loadProducts()}>
            Retry product load
          </Button>
        }
      />
    );
  }

  return (
    <AdminProductsPage
      products={products}
      categoryOptions={categoryOptions}
      isCreateOpen={isCreateOpen}
      editingProduct={editingProduct}
      deletingProductId={deletingProductId}
      onSubmitProduct={handleSubmitProduct}
      onOpenCreate={() => {
        setEditingProduct(null);
        setIsCreateOpen(true);
      }}
      onEditProduct={(product) => {
        setIsCreateOpen(false);
        setEditingProduct(product);
      }}
      onDeleteProduct={handleDeleteProduct}
      onCancelEdit={() => {
        setEditingProduct(null);
        setIsCreateOpen(false);
      }}
    />
  );
}
