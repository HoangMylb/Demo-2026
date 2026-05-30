import type { ReactNode } from 'react';

interface AdminStateCardProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function AdminStateCard({ title, description, action }: AdminStateCardProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
