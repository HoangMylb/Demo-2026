import { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { getAdminProducts, getAdminStats } from '../lib/admin-api';
import { AdminDashboardPage } from './admin-dashboard-page';
import type { AdminProduct, AdminStats } from '../types/admin';

export function AdminDashboardRoute() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResponse, productsResponse] = await Promise.all([getAdminStats(), getAdminProducts()]);
      setStats(statsResponse);
      setProducts(productsResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (loading && !stats) {
    return <Spin size="large" fullscreen description="Fetching statistics and product distribution for the admin overview." />;
  }

  if (error && !stats) {
    return (
      <Result
        status="error"
        title="Unable to load dashboard"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => void loadData()}>
            Retry dashboard load
          </Button>
        }
      />
    );
  }

  return <AdminDashboardPage stats={stats} products={products} loading={loading} error={error} />;
}
