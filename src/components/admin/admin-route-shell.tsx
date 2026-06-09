import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminLayout, type AdminView } from './admin-layout';
import { getCurrentSession, logoutAdmin } from '../../lib/admin-api';
import type { AdminSession } from '../../types/admin';

const routeToView: Record<string, AdminView> = {
  '/admin': 'dashboard',
  '/admin/products': 'products',
  '/admin/users': 'users',
  '/admin/reviews': 'reviews',
};

export function AdminRouteShell({ onSessionCleared }: { onSessionCleared?: () => void }) {
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
      view === 'dashboard' ? '/admin' : view === 'products' ? '/admin/products' : view === 'users' ? '/admin/users' : '/admin/reviews';
    navigate(nextPath);
  };

  const handleExit = async () => {
    await logoutAdmin();
    setAdminSession(null);
    onSessionCleared?.();
    navigate('/', { replace: true });
  };

  return (
      <AdminLayout
        activeView={activeView}
        onNavigate={handleNavigate}
        onLogout={handleExit}
        onOpenSettings={() => navigate('/settings')}
        sessionRole={adminSession?.role ?? null}
        sessionEmail={adminSession?.email ?? null}
      >
      <Outlet />
    </AdminLayout>
  );
}
