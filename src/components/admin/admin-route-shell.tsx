import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminLayout, type AdminView } from './admin-layout';
import { clearAdminSession, getStoredAdminSession } from '../../lib/admin-api';
import type { AdminSession } from '../../types/admin';

const routeToView: Record<string, AdminView> = {
  '/admin': 'dashboard',
  '/admin/products': 'products',
  '/admin/users': 'users',
};

export function AdminRouteShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getStoredAdminSession());

  useEffect(() => {
    const session = getStoredAdminSession();
    setAdminSession(session);

    if (!session?.token) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  const activeView = useMemo<AdminView>(() => routeToView[location.pathname] ?? 'dashboard', [location.pathname]);

  const handleNavigate = (view: AdminView) => {
    const nextPath =
      view === 'dashboard' ? '/admin' : view === 'products' ? '/admin/products' : '/admin/users';
    navigate(nextPath);
  };

  const handleExit = () => {
    clearAdminSession();
    setAdminSession(null);
    navigate('/', { replace: true });
  };

  return (
    <AdminLayout
      activeView={activeView}
      onNavigate={handleNavigate}
      onExit={handleExit}
      sessionRole={adminSession?.role ?? null}
      sessionEmail={adminSession?.email ?? null}
    >
      <Outlet />
    </AdminLayout>
  );
}
