import { BarChart3, LayoutDashboard, Package, ShieldCheck, UserRound, Users } from 'lucide-react';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { ThemeToggle } from '../layout/theme-toggle';
import { cn } from '../../utils/styles';

export type AdminView = 'dashboard' | 'products' | 'users';

interface AdminLayoutProps extends PropsWithChildren {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  onExit: () => void;
  onOpenSettings: () => void;
  sessionRole: string | null;
  sessionEmail: string | null;
}

const navigationItems: Array<{ key: AdminView; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
];

export function AdminLayout({ activeView, onNavigate, onExit, onOpenSettings, sessionRole, sessionEmail, children }: AdminLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent-600">Admin panel</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Operations workspace</h2>
          </div>
          <BarChart3 className="h-6 w-6 text-accent-600" />
        </div>

        <div className="mt-6 rounded-2xl border border-accent-100 bg-accent-50/80 p-4 text-sm text-accent-700 dark:border-accent-500/20 dark:bg-accent-500/10 dark:text-accent-100">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Admin-only APIs
          </div>
          <p className="mt-2 leading-6">These screens assume backend endpoints are protected with role-based authorization and return 403 for non-admin users.</p>
        </div>

        <nav className="mt-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition',
                  isActive
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onExit}
          className="mt-8 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back to storefront
        </button>
      </aside>

      <div className="space-y-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Control center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Admin Panel & Backend Integration</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:scale-[1.03] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label="Open admin account menu"
                aria-expanded={menuOpen}
              >
                <UserRound className="h-5 w-5" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-14 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-3 pb-3 pt-2 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin account</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {sessionEmail ?? 'No email is currently available.'}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.24em] text-accent-600">
                      {sessionRole ?? 'Unknown role'}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="flex w-full rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Setting
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onExit();
                      }}
                      className="flex w-full rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {children}
      </div>
    </section>
  );
}
