import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MiniCart } from './components/cart/mini-cart';
import { Toast } from './components/feedback/toast';
import { Navbar } from './components/layout/navbar';
import { AdminRouteShell } from './components/admin/admin-route-shell';
import { clearAdminSession, getStoredAdminSession } from './lib/admin-api';
import { products } from './data/products';
import { useThemeEffect } from './hooks/use-theme-effect';
import { AdminDashboardRoute } from './pages/admin-dashboard-route';
import { AdminProductsRoute } from './pages/admin-products-route';
import { AdminUsersRoute } from './pages/admin-users-route';
import { AuthPage } from './pages/auth-page';
import { HomePage } from './pages/home-page';
import { ProductDetailPage } from './pages/product-detail-page';
import { ProductsPage } from './pages/products-page';
import { SettingsPage } from './pages/settings-page';
import { useCartStore } from './stores/cart-store';
import type { AdminSession } from './types/admin';
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
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
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

function App() {
  useThemeEffect();

  const [toastVisible, setToastVisible] = useState(false);
  const [lastAddedProductName, setLastAddedProductName] = useState(products[0].name);
  const [session, setSession] = useState<AdminSession | null>(() => getStoredAdminSession());
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const syncSession = () => {
    setSession(getStoredAdminSession());
  };

  const handleLogout = () => {
    clearAdminSession();
    toggleCart(false);
    setSession(null);
  };

  useEffect(() => {
    if (!toastVisible) {
      return;
    }

    const timeout = window.setTimeout(() => setToastVisible(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastVisible]);

  const handleAddToCart = (product: ProductType) => {
    addItem(product);
    if (session?.token) {
      toggleCart(true);
    }
    setLastAddedProductName(product.name);
    setToastVisible(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
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
        <Route path="/admin/login" element={<AdminLoginRoute onAuthSuccess={syncSession} session={session} onLogout={handleLogout} />} />
        <Route path="/admin" element={<AdminRouteShell />}>
          <Route index element={<AdminDashboardRoute />} />
          <Route path="products" element={<AdminProductsRoute />} />
          <Route path="users" element={<AdminUsersRoute />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <MiniCart visible={Boolean(session?.token)} />
      <Toast visible={toastVisible} message={`${lastAddedProductName} was added to your cart.`} />
    </div>
  );
}

export default App;
