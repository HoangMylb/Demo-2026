import { Navigate } from 'react-router-dom';
import type { AdminSession } from '../types/admin';

interface SettingsPageProps {
  session: AdminSession | null;
}

export function SettingsPage({ session }: SettingsPageProps) {
  if (!session?.token) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Setting</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Account overview</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        This screen separates storefront account access from the admin workspace while keeping the signed-in session visible.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Email</p>
          <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{session.email ?? 'Unavailable from token claims'}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Role</p>
          <p className="mt-2 text-lg font-semibold capitalize text-slate-950 dark:text-white">{session.role ?? 'Unknown'}</p>
        </div>
      </div>
    </section>
  );
}
