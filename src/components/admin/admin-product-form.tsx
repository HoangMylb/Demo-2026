import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import type { AdminCategoryOption, AdminProduct, ProductPayload } from '../../types/admin';

interface AdminProductFormProps {
  editingProduct: AdminProduct | null;
  categoryOptions: AdminCategoryOption[];
  onSubmit: (values: ProductPayload) => Promise<void>;
  onCancelEdit: () => void;
}

export function AdminProductForm({ editingProduct, categoryOptions, onSubmit, onCancelEdit }: AdminProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProductPayload>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      categoryId: 0,
    },
  });

  useEffect(() => {
    const initialCategoryId = categoryOptions[0]?.id ?? editingProduct?.categoryId ?? 0;

    if (!editingProduct) {
      reset({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        categoryId: initialCategoryId,
      });
      return;
    }

    reset({
      name: editingProduct.name,
      description: editingProduct.description,
      price: editingProduct.price,
      imageUrl: editingProduct.imageUrl,
      categoryId: editingProduct.categoryId,
    });
  }, [categoryOptions, editingProduct, reset]);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Product form</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {editingProduct ? 'Edit product' : 'Add a new product'}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Product name</span>
          <input
            {...register('name', { required: true })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Luma Air Headphones"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Category</span>
          {categoryOptions.length > 0 ? (
            <select
              {...register('categoryId', { valueAsNumber: true })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
              No category options are available yet because the backend has not returned any products with category data.
            </div>
          )}
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
          <textarea
            {...register('description', { required: true })}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Adaptive noise canceling headphones with spatial audio tuning."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Price</span>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('price', { valueAsNumber: true })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
            placeholder="249"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Image URL</span>
          <input
            {...register('imageUrl', { required: true })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
            placeholder="https://images.unsplash.com/..."
          />
        </label>

        <div className="flex gap-3 md:col-span-2">
          <Button type="submit" variant="secondary" disabled={isSubmitting || categoryOptions.length === 0}>
            {isSubmitting ? 'Saving...' : editingProduct ? 'Update product' : 'Create product'}
          </Button>

          {editingProduct ? (
            <Button type="button" variant="ghost" onClick={onCancelEdit}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
