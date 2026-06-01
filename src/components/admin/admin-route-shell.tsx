import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminLayout, type AdminView } from './admin-layout';
import { getCurrentSession, logoutAdmin } from '../../lib/admin-api';
import type { AdminSession } from '../../types/admin';

const routeToView: Record<string, AdminView> = {
  '/admin': 'dashboard',
  '/admin/products': 'products',
  '/admin/users': 'users',
};

export function AdminRouteShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const session = await getCurrentSession();
      setAdminSession(session);

      if (!session?.isAuthenticated || session.role?.toLowerCase() !== 'admin') {
        navigate('/admin/login', { replace: true });
      }
    };

    void loadSession();
  }, [navigate]);

  const activeView = useMemo<AdminView>(() => routeToView[location.pathname] ?? 'dashboard', [location.pathname]);

  const handleNavigate = (view: AdminView) => {
    const nextPath =
      view === 'dashboard' ? '/admin' : view === 'products' ? '/admin/products' : '/admin/users';
    navigate(nextPath);
  };

  const handleExit = async () => {
    await logoutAdmin();
    setAdminSession(null);
    navigate('/', { replace: true });
  };

  return (
      <AdminLayout
        activeView={activeView}
        onNavigate={handleNavigate}
        onExit={handleExit}
        onOpenSettings={() => navigate('/settings')}
        sessionRole={adminSession?.role ?? null}
        sessionEmail={adminSession?.email ?? null}
      >
      <Outlet />
    </AdminLayout>
  );
}
