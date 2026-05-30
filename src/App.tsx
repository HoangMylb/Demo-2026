import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MiniCart } from './components/cart/mini-cart';
import { Toast } from './components/feedback/toast';
import { Navbar } from './components/layout/navbar';
import { AdminRouteShell } from './components/admin/admin-route-shell';
import { products } from './data/products';
import { useThemeEffect } from './hooks/use-theme-effect';
import { AdminDashboardRoute } from './pages/admin-dashboard-route';
import { AdminProductsRoute } from './pages/admin-products-route';
import { AdminUsersRoute } from './pages/admin-users-route';
import { AuthPage } from './pages/auth-page';
import { HomePage } from './pages/home-page';
import { ProductDetailPage } from './pages/product-detail-page';
import { ProductsPage } from './pages/products-page';
import { useCartStore } from './stores/cart-store';
import type { ProductType } from './types/product';

function HomeRoute({ onAddToCart }: { onAddToCart: (product: ProductType) => void }) {
  const navigate = useNavigate();

  return (
    <HomePage
      onExploreProducts={() => navigate('/products')}
      onViewDetails={(product) => navigate(`/products/${product.id}`)}
      onAddToCart={onAddToCart}
    />
  );
}

function ProductsRoute({ onAddToCart }: { onAddToCart: (product: ProductType) => void }) {
  const navigate = useNavigate();

  return (
    <ProductsPage
      onViewDetails={(product) => navigate(`/products/${product.id}`)}
      onAddToCart={onAddToCart}
    />
  );
}

function ProductDetailRoute({ onAddToCart }: { onAddToCart: (product: ProductType) => void }) {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId) ?? products[0];

  return <ProductDetailPage product={product} onAddToCart={onAddToCart} />;
}

function StoreShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <>
      <Navbar currentPath={currentPath} onNavigate={(path) => navigate(path)} />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </>
  );
}

function AuthRoute() {
  const navigate = useNavigate();

  return (
    <StoreShell>
      <AuthPage onRedirectDashboard={() => navigate('/admin')} />
    </StoreShell>
  );
}

function App() {
  useThemeEffect();

  const [toastVisible, setToastVisible] = useState(false);
  const [lastAddedProductName, setLastAddedProductName] = useState(products[0].name);
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    if (!toastVisible) {
      return;
    }

    const timeout = window.setTimeout(() => setToastVisible(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastVisible]);

  const handleAddToCart = (product: ProductType) => {
    addItem(product);
    toggleCart(true);
    setLastAddedProductName(product.name);
    setToastVisible(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Routes>
        <Route
          path="/"
          element={
            <StoreShell>
              <HomeRoute onAddToCart={handleAddToCart} />
            </StoreShell>
          }
        />
        <Route
          path="/products"
          element={
            <StoreShell>
              <ProductsRoute onAddToCart={handleAddToCart} />
            </StoreShell>
          }
        />
        <Route
          path="/products/:productId"
          element={
            <StoreShell>
              <ProductDetailRoute onAddToCart={handleAddToCart} />
            </StoreShell>
          }
        />
        <Route
          path="/auth"
          element={<AuthRoute />}
        />
        <Route path="/admin" element={<AdminRouteShell />}>
          <Route index element={<AdminDashboardRoute />} />
          <Route path="products" element={<AdminProductsRoute />} />
          <Route path="users" element={<AdminUsersRoute />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <MiniCart />
      <Toast visible={toastVisible} message={`${lastAddedProductName} was added to your cart.`} />
    </div>
  );
}

export default App;
