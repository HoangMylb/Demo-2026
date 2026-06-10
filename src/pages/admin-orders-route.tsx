import { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { getAdminOrders } from '../lib/admin-api';
import { AdminOrdersPage } from './admin-orders-page';
import type { AdminOrder } from '../types/admin';

export function AdminOrdersRoute() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await getAdminOrders();
      setOrders(items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  if (loading && orders.length === 0) {
    return <Spin size="large" fullscreen tip="Fetching orders for the admin workspace." />;
  }

  if (error && orders.length === 0) {
    return (
      <Result
        status="error"
        title="Unable to load orders"
        subTitle={error}
        extra={<Button type="primary" onClick={() => void loadOrders()}>Retry order load</Button>}
      />
    );
  }

  return <AdminOrdersPage orders={orders} />;
}
