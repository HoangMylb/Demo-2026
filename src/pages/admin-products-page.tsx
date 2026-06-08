import { useMemo, useState } from 'react';
import type { AdminCategoryOption, AdminProduct, ProductPayload } from '../types/admin';
import { AdminProductForm } from '../components/admin/admin-product-form';
import { AdminProductsTable } from '../components/admin/admin-products-table';
import { ConfirmDialog } from '../components/feedback/confirm-dialog';
import { useNotification } from '../components/feedback/notification-provider';
import { Modal } from '../components/ui/modal';

interface AdminProductsPageProps {
  products: AdminProduct[];
  categoryOptions: AdminCategoryOption[];
  isCreateOpen: boolean;
  editingProduct: AdminProduct | null;
  deletingProductId: number | null;
  onSubmitProduct: (values: ProductPayload) => Promise<{ message: string }>;
  onOpenCreate: () => void;
  onEditProduct: (product: AdminProduct) => void;
  onDeleteProduct: (productId: number) => Promise<{ message: string }>;
  onCancelEdit: () => void;
}

export function AdminProductsPage({
  products,
  categoryOptions,
  isCreateOpen,
  editingProduct,
  deletingProductId,
  onSubmitProduct,
  onOpenCreate,
  onEditProduct,
  onDeleteProduct,
  onCancelEdit,
}: AdminProductsPageProps) {
  const { notify } = useNotification();
  const [pendingDeleteProductId, setPendingDeleteProductId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query)
      );
    });
  }, [products, searchValue]);

  return (
    <>
      <AdminProductsTable
        products={filteredProducts}
        searchValue={searchValue}
        deletingProductId={deletingProductId}
        onCreate={onOpenCreate}
        onEdit={onEditProduct}
        onDelete={async (productId) => setPendingDeleteProductId(productId)}
        onSearchChange={setSearchValue}
      />

      <Modal
        open={isCreateOpen || Boolean(editingProduct)}
        title={editingProduct ? 'Edit product' : 'Add a new product'}
        description="Manage inventory with a focused popup flow so the table remains stable in the background."
        onClose={onCancelEdit}
      >
        <AdminProductForm
          editingProduct={editingProduct}
          categoryOptions={categoryOptions}
          onSubmit={async (values) => {
            try {
              const result = await onSubmitProduct(values);
              notify(result.message);
            } catch (error) {
              notify(error instanceof Error ? error.message : 'Unable to save the product right now.', 'error');
              throw error;
            }
          }}
          onCancelEdit={onCancelEdit}
          submitLabel={editingProduct ? 'Update product' : 'Create product'}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDeleteProductId !== null}
        title="Delete product"
        description="Remove this product from the inventory and storefront listing."
        confirmLabel="Delete product"
        busy={deletingProductId === pendingDeleteProductId && pendingDeleteProductId !== null}
        onConfirm={() => {
          if (pendingDeleteProductId !== null) {
            void onDeleteProduct(pendingDeleteProductId)
              .then((result) => {
                setPendingDeleteProductId(null);
                notify(result.message);
              })
              .catch((error) => {
                notify(error instanceof Error ? error.message : 'Unable to delete the product right now.', 'error');
              });
          }
        }}
        onCancel={() => setPendingDeleteProductId(null)}
      />
    </>
  );
}
