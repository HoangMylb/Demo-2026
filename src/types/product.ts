export interface ProductType {
  id: string;
  name: string;
  description: string;
  category: 'Audio' | 'Wearables' | 'Workspace' | 'Accessories';
  price: number;
  image: string;
  rating: number;
  reviewCount?: number;
  featured?: boolean;
  accent: string;
}

export interface CartItem extends ProductType {
  quantity: number;
}

export interface ProductApiResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ProductReview {
  id: number;
  userId: number;
  customerName: string;
  rating: number;
  comment: string;
  productName: string;
  categoryName: string;
  variantType: string;
  color: string;
  size: string;
  helpfulCount: number;
  isCurrentUserReview: boolean;
  hasCurrentUserMarkedHelpful: boolean;
  purchasedAtUtc: string;
  createdAtUtc: string;
}

export interface CreateProductReviewPayload {
  rating: number;
  comment: string;
  variantType: string;
  color: string;
  size: string;
}

export interface UpdateProductReviewPayload extends CreateProductReviewPayload {}

export interface ProductReviewHelpfulResponse {
  reviewId: number;
  helpfulCount: number;
  hasCurrentUserMarkedHelpful: boolean;
}

export interface ProductDetailApiResponse extends ProductApiResponse {
  reviews: ProductReview[];
  relatedProducts: ProductApiResponse[];
}

export interface ProductDetail extends ProductType {
  reviews: ProductReview[];
  relatedProducts: ProductType[];
}
