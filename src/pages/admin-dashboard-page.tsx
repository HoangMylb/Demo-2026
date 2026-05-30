import { Package, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AdminProduct, AdminStats } from '../types/admin';
import { AdminStatCard } from '../components/admin/admin-stat-card';

interface AdminDashboardPageProps {
  stats: AdminStats | null;
  products: AdminProduct[];
  loading: boolean;
  error: string | null;
}

export function AdminDashboardPage({ stats, products, loading, error }: AdminDashboardPageProps) {
  const chartData = Object.values(
    products.reduce<Record<string, { name: string; total: number }>>((accumulator, product) => {
      const key = product.categoryName;
      const current = accumulator[key] ?? { name: key, total: 0 };

      accumulator[key] = {
        name: current.name,
        total: current.total + 1,
      };

      return accumulator;
    }, {}),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <AdminStatCard
          label="Total users"
          value={stats?.totalUsers ?? 0}
          description="Pulled from the admin stats endpoint using a direct count query on the Users table."
          icon={<Users className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Total products"
          value={stats?.totalProducts ?? 0}
          description="Pulled from the admin stats endpoint using a direct count query on the Products table."
          icon={<Package className="h-5 w-5" />}
        />
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Weekly activity</p>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Category distribution from live products</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">This chart is derived from the current product list returned by the backend, so the dashboard changes with real inventory data.</p>
        </div>

        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#316df5" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No product data is available yet, so there is no category distribution to visualize.
            </div>
          )}
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading admin stats...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
      </section>
    </div>
  );
}
