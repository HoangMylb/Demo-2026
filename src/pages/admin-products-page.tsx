import type { AdminCategoryOption, AdminProduct, ProductPayload } from '../types/admin';
import { AdminProductForm } from '../components/admin/admin-product-form';
import { AdminProductsTable } from '../components/admin/admin-products-table';

interface AdminProductsPageProps {
  products: AdminProduct[];
  categoryOptions: AdminCategoryOption[];
  editingProduct: AdminProduct | null;
  onSubmitProduct: (values: ProductPayload) => Promise<void>;
  onEditProduct: (product: AdminProduct) => void;
  onDeleteProduct: (productId: number) => Promise<void>;
  onCancelEdit: () => void;
}

export function AdminProductsPage({
  products,
  categoryOptions,
  editingProduct,
  onSubmitProduct,
  onEditProduct,
  onDeleteProduct,
  onCancelEdit,
}: AdminProductsPageProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <AdminProductForm
        editingProduct={editingProduct}
        categoryOptions={categoryOptions}
        onSubmit={onSubmitProduct}
        onCancelEdit={onCancelEdit}
      />
      <AdminProductsTable products={products} onEdit={onEditProduct} onDelete={onDeleteProduct} />
    </div>
  );
}
