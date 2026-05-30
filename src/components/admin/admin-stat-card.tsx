import type { ReactNode } from 'react';

interface AdminStatCardProps {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
}

export function AdminStatCard({ label, value, description, icon }: AdminStatCardProps) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">{label}</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="rounded-2xl bg-accent-50 p-3 text-accent-700 dark:bg-accent-500/10 dark:text-accent-100">{icon}</div>
      </div>
    </article>
  );
}
