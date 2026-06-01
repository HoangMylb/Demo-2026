import { Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { useCartStore } from '../../stores/cart-store';
import type { AdminSession } from '../../types/admin';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  session: AdminSession | null;
  onLogout: () => void;
}

export function Navbar({ currentPath, onNavigate, session, onLogout }: NavbarProps) {
  const itemCount = useCartStore((state) => state.itemCount);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isLoggedIn = Boolean(session?.token);
  const navigationItems = [
    ['/', 'Home'],
    ['/products', 'Products'],
    ['/admin/login', 'Admin'],
  ] as const;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentPath]);

  const accountActions = isLoggedIn
    ? [
        { label: 'Setting', action: () => onNavigate('/settings') },
        { label: 'Logout', action: onLogout },
      ]
    : [
        { label: 'Login', action: () => onNavigate('/auth?mode=login') },
        { label: 'Register', action: () => onNavigate('/auth?mode=register') },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button type="button" onClick={() => onNavigate('/')} className="text-left">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent-600">Luma Commerce</p>
          <h1 className="text-lg font-semibold text-slate-950 dark:text-white">Interactive Storefront</h1>
        </button>

        <nav className="hidden gap-2 md:flex">
          {navigationItems.map(([key, label]) => {
            const isActive =
              key === '/'
                ? currentPath === '/'
                : key === '/admin/login'
                  ? currentPath.startsWith('/admin')
                  : currentPath === key || currentPath.startsWith(`${key}/`);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <ThemeToggle />
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:scale-[1.03] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-label="Open account menu"
              aria-expanded={menuOpen}
            >
              <UserRound className="h-5 w-5" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-14 w-52 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-3 pb-3 pt-2 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{isLoggedIn ? 'Account' : 'Welcome'}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {isLoggedIn ? session?.email ?? 'Signed in session' : 'Login or register to unlock the cart.'}
                  </p>
                </div>
                <div className="mt-2 space-y-1">
                  {accountActions.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        item.action();
                      }}
                      className="flex w-full rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => toggleCart(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white transition hover:scale-[1.03] dark:bg-white dark:text-slate-950"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-xs font-semibold text-white"
              >
                {itemCount}
              </motion.span>
            </button>
          ) : null}
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="border-t border-slate-200/70 px-6 pb-5 pt-4 md:hidden dark:border-slate-800/80">
          <div className="space-y-2 rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            {navigationItems.map(([key, label]) => {
              const isActive =
                key === '/'
                  ? currentPath === '/'
                  : key === '/admin/login'
                    ? currentPath.startsWith('/admin')
                    : currentPath === key || currentPath.startsWith(`${key}/`);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onNavigate(key)}
                  className={`flex w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
