import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import type { AdminCategoryOption, AdminProduct, ProductPayload } from '../../types/admin';

type ImageInputMode = 'url' | 'upload';

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Unable to read the selected image file.'));
    };

    reader.onerror = () => reject(new Error('Unable to read the selected image file.'));
    reader.readAsDataURL(file);
  });
}

interface AdminProductFormProps {
  editingProduct: AdminProduct | null;
  categoryOptions: AdminCategoryOption[];
  onSubmit: (values: ProductPayload) => Promise<void>;
  onCancelEdit: () => void;
  submitLabel?: string;
}

export function AdminProductForm({ editingProduct, categoryOptions, onSubmit, onCancelEdit, submitLabel }: AdminProductFormProps) {
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>('url');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileError, setSelectedFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
    const initialImageUrl = editingProduct?.imageUrl ?? '';
    const initialMode: ImageInputMode = initialImageUrl.startsWith('data:image/') ? 'upload' : 'url';

    setImageInputMode(initialMode);
    setSelectedFileName('');
    setSelectedFileError(null);

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

  const imageUrlValue = watch('imageUrl');

  const previewImageUrl = useMemo(() => imageUrlValue?.trim() ?? '', [imageUrlValue]);

  const handleImageModeChange = (mode: ImageInputMode) => {
    setImageInputMode(mode);
    setSelectedFileError(null);

    if (mode === 'url' && imageUrlValue?.startsWith('data:image/')) {
      setValue('imageUrl', '');
      setSelectedFileName('');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName('');
      setSelectedFileError(null);
      if (imageInputMode === 'upload') {
        setValue('imageUrl', '');
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedFileName('');
      setSelectedFileError('Please choose a valid image file.');
      setValue('imageUrl', '');
      return;
    }

    setSelectedFileName(file.name);
    setSelectedFileError(null);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setValue('imageUrl', dataUrl, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      setSelectedFileError(error instanceof Error ? error.message : 'Unable to read the selected image file.');
      setValue('imageUrl', '');
    }
  };

  return (
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" {...register('imageUrl', { required: true })} />

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

        <div className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Product image</span>

          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Input type</span>
              <select
                value={imageInputMode}
                onChange={(event) => handleImageModeChange(event.target.value as ImageInputMode)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="url">Image URL</option>
                <option value="upload">Upload from device</option>
              </select>
            </label>

            {imageInputMode === 'url' ? (
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Image URL</span>
                <input
                  value={imageUrlValue}
                  onChange={(event) => setValue('imageUrl', event.target.value, { shouldValidate: true, shouldDirty: true })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="https://images.unsplash.com/..."
                />
              </label>
            ) : (
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Choose image file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    void handleFileChange(event);
                  }}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-[0.8rem] text-sm text-slate-600 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:file:bg-white dark:file:text-slate-950"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {selectedFileName ? `Selected file: ${selectedFileName}` : 'The selected image will be converted and stored as the product image URL payload.'}
                </p>
                {selectedFileError ? <p className="mt-2 text-xs text-rose-500">{selectedFileError}</p> : null}
              </label>
            )}
          </div>

          {previewImageUrl ? (
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Preview</p>
              <img src={previewImageUrl} alt="Product preview" className="h-48 w-full rounded-2xl object-cover" />
            </div>
          ) : null}
        </div>

        <div className="flex gap-3 md:col-span-2">
          <Button type="submit" variant="secondary" disabled={isSubmitting || categoryOptions.length === 0}>
            {isSubmitting ? 'Saving...' : submitLabel ?? (editingProduct ? 'Update product' : 'Create product')}
          </Button>

          {editingProduct || submitLabel ? (
            <Button type="button" variant="ghost" onClick={onCancelEdit}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
  );
}
