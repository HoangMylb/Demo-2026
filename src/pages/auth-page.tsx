import { useMemo, useState } from 'react';
import { AuthForm } from '../components/auth/auth-form';

interface AuthPageProps {
  onRedirectDashboard: () => void;
}

export function AuthPage({ onRedirectDashboard }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const heading = useMemo(
    () =>
      mode === 'login'
        ? 'Use a real access token so the admin interface renders strictly from backend responses.'
        : 'If your auth flow issues a fresh JWT after registration, save it here and continue into the admin workspace.',
    [mode],
  );

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Authentication</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Use backend authorization, not frontend placeholders.</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{heading}</p>

        <div className="mt-8 flex gap-3">
          {(['login', 'register'] as const).map((item) => {
            const active = mode === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
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
      </div>

      <AuthForm mode={mode} onSuccess={onRedirectDashboard} />
    </section>
  );
}
