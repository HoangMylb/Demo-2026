import type { ProductApiResponse, ProductType } from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://hoangmydemo-api.onrender.com';

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

const accentByCategory: Record<ProductType['category'], string> = {
  Audio: 'from-sky-400 to-indigo-500',
  Wearables: 'from-fuchsia-400 to-rose-500',
  Workspace: 'from-amber-400 to-orange-500',
  Accessories: 'from-emerald-400 to-teal-500',
};

const ratingByCategory: Record<ProductType['category'], number> = {
  Audio: 4.8,
  Wearables: 4.6,
  Workspace: 4.5,
  Accessories: 4.4,
};

function parseCategory(categoryName: string): ProductType['category'] {
  if (categoryName === 'Audio' || categoryName === 'Wearables' || categoryName === 'Workspace' || categoryName === 'Accessories') {
    return categoryName;
  }

  return 'Accessories';
}

function mapProduct(product: ProductApiResponse, index: number): ProductType {
  const category = parseCategory(product.categoryName);

  return {
    id: String(product.id),
    name: product.name,
    description: product.description,
    category,
    price: product.price,
    image: product.imageUrl,
    rating: ratingByCategory[category],
    featured: index < 3,
    accent: accentByCategory[category],
  };
}

async function parseProductResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`Storefront products request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ApiEnvelope<ProductApiResponse | ProductApiResponse[]>;
  return payload.data;
}

export async function getStorefrontProducts(): Promise<ProductType[]> {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  const products = (await parseProductResponse(response)) as ProductApiResponse[];
  return products.map((product, index) => mapProduct(product, index));
}

export async function getStorefrontProductById(productId: string): Promise<ProductType> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
  const product = (await parseProductResponse(response)) as ProductApiResponse;
  return mapProduct(product, 0);
}
