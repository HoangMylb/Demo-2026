export interface ProductType {
  id: string;
  name: string;
  description: string;
  category: 'Audio' | 'Wearables' | 'Workspace' | 'Accessories';
  price: number;
  image: string;
  rating: number;
  featured?: boolean;
  accent: string;
}

export interface CartItem extends ProductType {
  quantity: number;
}
