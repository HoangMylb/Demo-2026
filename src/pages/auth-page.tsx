import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthForm } from '../components/auth/auth-form';

interface AuthPageProps {
  audience: 'store' | 'admin';
  onSuccess: () => void;
}

export function AuthPage({ audience, onSuccess }: AuthPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const allowRegister = audience === 'store';

  useEffect(() => {
    if (!allowRegister) {
      setMode('login');
      return;
    }

    setMode(requestedMode);
  }, [allowRegister, requestedMode]);

  const heading = useMemo(
    () =>
      audience === 'admin'
        ? 'Use the isolated admin sign-in so operations access stays separate from the storefront experience.'
        : mode === 'login'
          ? 'Login now uses its own submit flow, so signing in calls the auth API directly without sharing validation with registration.'
          : 'Register now runs as a separate flow with its own validation and API request before storefront access is unlocked.',
    [audience, mode],
  );

  const handleModeChange = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    if (allowRegister) {
      setSearchParams(nextMode === 'register' ? { mode: 'register' } : { mode: 'login' });
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">{audience === 'admin' ? 'Admin authentication' : 'Store account'}</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {audience === 'admin' ? 'Separate admin login for protected operations.' : 'Account access that unlocks the storefront tools.'}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{heading}</p>

        {allowRegister ? (
          <div className="mt-8 flex gap-3">
            {(['login', 'register'] as const).map((item) => {
              const active = mode === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleModeChange(item)}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {item === 'login' ? 'Login' : 'Register'}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <AuthForm mode={mode} audience={audience} onSuccess={onSuccess} />
    </section>
  );
}
