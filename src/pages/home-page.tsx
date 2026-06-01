import type { ProductType } from '../types/product';
import { FeaturedProducts } from '../components/sections/featured-products';
import { HeroSection } from '../components/sections/hero-section';

interface HomePageProps {
  products: ProductType[];
  onExploreProducts: () => void;
  onViewDetails: (product: ProductType) => void;
  onAddToCart: (product: ProductType) => void;
}

export function HomePage({ products, onExploreProducts, onViewDetails, onAddToCart }: HomePageProps) {
  return (
    <>
      <HeroSection onExploreProducts={onExploreProducts} />
      <FeaturedProducts products={products} onViewDetails={onViewDetails} onAddToCart={onAddToCart} />
    </>
  );
}
