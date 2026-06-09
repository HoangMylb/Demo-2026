import type { CreateProductReviewPayload, ProductApiResponse, ProductDetail, ProductDetailApiResponse, ProductReview, ProductReviewHelpfulResponse, ProductType, UpdateProductReviewPayload } from '../types/product';
import { getApiBaseUrl } from './api-base-url';

const API_BASE_URL = getApiBaseUrl();

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
    rating: product.averageRating > 0 ? product.averageRating : ratingByCategory[category],
    reviewCount: product.reviewCount,
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

export async function getStorefrontProductById(productId: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
  const product = (await parseProductResponse(response)) as ProductDetailApiResponse;

  return {
    ...mapProduct(product, 0),
    reviews: product.reviews,
    relatedProducts: product.relatedProducts.map((relatedProduct, index) => mapProduct(relatedProduct, index + 3)),
  };
}

export async function createStorefrontProductReview(productId: string, payload: CreateProductReviewPayload): Promise<ProductReview> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiEnvelope<ProductReview> | { message?: string };

  if (response.status === 401) {
    throw new Error(body.message ?? 'Please sign in before submitting a review.');
  }

  if (response.status === 403) {
    throw new Error(body.message ?? 'Your account cannot submit reviews right now.');
  }

  if (!response.ok) {
    throw new Error(body.message ?? `Review submission failed with status ${response.status}.`);
  }

  return (body as ApiEnvelope<ProductReview>).data;
}

export async function updateStorefrontProductReview(productId: string, reviewId: number, payload: UpdateProductReviewPayload): Promise<ProductReview> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews/${reviewId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiEnvelope<ProductReview> | { message?: string };

  if (response.status === 401) {
    throw new Error(body.message ?? 'Please sign in before editing a review.');
  }

  if (response.status === 403) {
    throw new Error(body.message ?? 'You can only edit your own review.');
  }

  if (!response.ok) {
    throw new Error(body.message ?? `Review update failed with status ${response.status}.`);
  }

  return (body as ApiEnvelope<ProductReview>).data;
}

export async function deleteStorefrontProductReview(productId: string, reviewId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const body = response.status === 204 ? null : ((await response.json()) as { message?: string });

  if (response.status === 401) {
    throw new Error(body?.message ?? 'Please sign in before deleting a review.');
  }

  if (response.status === 403) {
    throw new Error(body?.message ?? 'You can only delete your own review.');
  }

  if (!response.ok) {
    throw new Error(body?.message ?? `Review delete failed with status ${response.status}.`);
  }
}

export async function toggleStorefrontReviewHelpful(productId: string, reviewId: number): Promise<ProductReviewHelpfulResponse> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews/${reviewId}/helpful`, {
    method: 'POST',
    credentials: 'include',
  });

  const body = (await response.json()) as ApiEnvelope<ProductReviewHelpfulResponse> | { message?: string };

  if (response.status === 401) {
    throw new Error(body.message ?? 'Please sign in before marking a review helpful.');
  }

  if (response.status === 403 || response.status === 400) {
    throw new Error(body.message ?? 'Unable to update helpful vote right now.');
  }

  if (!response.ok) {
    throw new Error(body.message ?? `Helpful vote failed with status ${response.status}.`);
  }

  return (body as ApiEnvelope<ProductReviewHelpfulResponse>).data;
}
