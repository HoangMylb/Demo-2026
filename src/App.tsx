import { lazy, Suspense, useEffect, useState } from 'react';
import { App as AntApp, Result, Spin } from 'antd';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MiniCart } from './components/cart/mini-cart';
import { AppErrorBoundary } from './components/feedback/app-error-boundary';
import { SiteFooter } from './components/layout/site-footer';
import { Navbar } from './components/layout/navbar';
import { AdminRouteShell } from './components/admin/admin-route-shell';
import { getCurrentSession, logoutAdmin } from './lib/admin-api';
import { getStorefrontProductById, getStorefrontProducts } from './lib/storefront-api';
import { useThemeEffect } from './hooks/use-theme-effect';
import { useCartStore } from './stores/cart-store';
import type { AdminSession } from './types/admin';
import type { ProductType } from './types/product';

const HomePage = lazy(() => import('./pages/home-page').then((module) => ({ default: module.HomePage })));
const ProductsPage = lazy(() => import('./pages/products-page').then((module) => ({ default: module.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/product-detail-page').then((module) => ({ default: module.ProductDetailPage })));
const AuthPage = lazy(() => import('./pages/auth-page').then((module) => ({ default: module.AuthPage })));
const SettingsPage = lazy(() => import('./pages/settings-page').then((module) => ({ default: module.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/not-found-page').then((module) => ({ default: module.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('./pages/unauthorized-page').then((module) => ({ default: module.UnauthorizedPage })));
const AdminDashboardRoute = lazy(() => import('./pages/admin-dashboard-route').then((module) => ({ default: module.AdminDashboardRoute })));
const AdminProductsRoute = lazy(() => import('./pages/admin-products-route').then((module) => ({ default: module.AdminProductsRoute })));
const AdminUsersRoute = lazy(() => import('./pages/admin-users-route').then((module) => ({ default: module.AdminUsersRoute })));

function RouteFallback() {
  return (
    <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
      <Spin size="large" tip="Loading experience..." />
    </div>
  );
}

function HomeRoute({ onAddToCart }: { onAddToCart: (product: ProductType) => void }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const response = await getStorefrontProducts();
        if (active) {
          setProducts(response);
        }
      } catch {
        if (active) {
          setProducts([]);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <HomePage
      products={products}
      onExploreProducts={() => navigate('/products')}
      onViewDetails={(product) => navigate(`/products/${product.id}`)}
      onAddToCart={onAddToCart}
    />
  );
}

function ProductsRoute({ onAddToCart }: { onAddToCart: (product: ProductType) => void }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const response = await getStorefrontProducts();
        if (active) {
          setProducts(response);
        }
      } catch {
        if (active) {
          setProducts([]);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ProductsPage
      products={products}
      onViewDetails={(product) => navigate(`/products/${product.id}`)}
      onAddToCart={onAddToCart}
    />
  );
}

function ProductDetailRoute({ onAddToCart }: { onAddToCart: (product: ProductType) => void }) {
  const { productId } = useParams();
  const [product, setProduct] = useState<ProductType | null>(null);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      if (!productId) {
        if (active) {
          setProduct(null);
        }
        return;
      }

      try {
        const response = await getStorefrontProductById(productId);
        if (active) {
          setProduct(response);
        }
      } catch {
        if (active) {
          setProduct(null);
        }
      }
    };

    void loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  return <ProductDetailPage product={product} onAddToCart={onAddToCart} />;
}

interface StoreShellProps {
  children: React.ReactNode;
  session: AdminSession | null;
  onLogout: () => void;
}

function StoreShell({ children, session, onLogout }: StoreShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <>
      <Navbar currentPath={currentPath} onNavigate={(path) => navigate(path)} session={session} onLogout={onLogout} />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Suspense fallback={<RouteFallback />}>{children}</Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

function AuthRoute({ onAuthSuccess, session, onLogout }: { onAuthSuccess: () => void; session: AdminSession | null; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <StoreShell session={session} onLogout={onLogout}>
      <AuthPage
        audience="store"
        onSuccess={() => {
          onAuthSuccess();
          navigate('/');
        }}
      />
    </StoreShell>
  );
}

function AdminLoginRoute({ onAuthSuccess, session, onLogout }: { onAuthSuccess: () => void; session: AdminSession | null; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <StoreShell session={session} onLogout={onLogout}>
      <AuthPage
        audience="admin"
        onSuccess={() => {
          onAuthSuccess();
          navigate('/admin');
        }}
      />
    </StoreShell>
  );
}

function SettingsRoute({ session, onLogout }: { session: AdminSession | null; onLogout: () => void }) {
  return (
    <StoreShell session={session} onLogout={onLogout}>
      <SettingsPage session={session} />
    </StoreShell>
  );
}

function NotFoundRoute({ session, onLogout }: { session: AdminSession | null; onLogout: () => void }) {
  return (
    <StoreShell session={session} onLogout={onLogout}>
      <NotFoundPage />
    </StoreShell>
  );
}

function UnauthorizedRoute({ session, onLogout }: { session: AdminSession | null; onLogout: () => void }) {
  return (
    <StoreShell session={session} onLogout={onLogout}>
      <UnauthorizedPage />
    </StoreShell>
  );
}

function AppContent() {
  useThemeEffect();

  const [session, setSession] = useState<AdminSession | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const { message } = AntApp.useApp();

  const syncSession = async () => {
    const nextSession = await getCurrentSession();
    setSession(nextSession);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    toggleCart(false);
    setSession(null);
  };

  useEffect(() => {
    void syncSession();
  }, []);

  const handleAddToCart = (product: ProductType) => {
    addItem(product);
    if (session?.isAuthenticated) {
      toggleCart(true);
    }
    message.success(`${product.name} was added to your cart.`);
  };

  return (
    <AppErrorBoundary>
      <div className="min-h-screen">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <StoreShell session={session} onLogout={handleLogout}>
                  <HomeRoute onAddToCart={handleAddToCart} />
                </StoreShell>
              }
            />
            <Route
              path="/products"
              element={
                <StoreShell session={session} onLogout={handleLogout}>
                  <ProductsRoute onAddToCart={handleAddToCart} />
                </StoreShell>
              }
            />
            <Route
              path="/products/:productId"
              element={
                <StoreShell session={session} onLogout={handleLogout}>
                  <ProductDetailRoute onAddToCart={handleAddToCart} />
                </StoreShell>
              }
            />
            <Route
              path="/auth"
              element={<AuthRoute onAuthSuccess={syncSession} session={session} onLogout={handleLogout} />}
            />
            <Route path="/settings" element={<SettingsRoute session={session} onLogout={handleLogout} />} />
            <Route path="/unauthorized" element={<UnauthorizedRoute session={session} onLogout={handleLogout} />} />
            <Route path="/admin/login" element={<AdminLoginRoute onAuthSuccess={syncSession} session={session} onLogout={handleLogout} />} />
            <Route path="/admin" element={<AdminRouteShell />}>
              <Route index element={<AdminDashboardRoute />} />
              <Route path="products" element={<AdminProductsRoute />} />
              <Route path="users" element={<AdminUsersRoute />} />
            </Route>
            <Route path="*" element={<NotFoundRoute session={session} onLogout={handleLogout} />} />
          </Routes>
        </Suspense>

        <MiniCart visible={Boolean(session?.isAuthenticated)} />
      </div>
    </AppErrorBoundary>
  );
}

function App() {
  return <AppContent />;
}

export default App;
