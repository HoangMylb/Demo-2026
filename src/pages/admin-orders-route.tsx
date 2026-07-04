import { useEffect, useState } from 'react';
import { App, Button, Result, Spin } from 'antd';
import { deleteAdminOrder, getAdminOrders, updateAdminOrderStatus } from '../lib/admin-api';
import { AdminOrdersPage } from './admin-orders-page';
import type { AdminOrder, AdminOrderStatus } from '../types/admin';

export function AdminOrdersRoute() {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

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

  const handleUpdateStatus = async (order: AdminOrder, status: AdminOrderStatus) => {
    setBusyOrderId(order.id);

    try {
      const result = await updateAdminOrderStatus(order.id, status);
      setOrders((current) => current.map((item) => (item.id === order.id ? result.data : item)));
      message.success(result.message);
    } catch (updateError) {
      message.error(updateError instanceof Error ? updateError.message : 'Unable to update the order status right now.');
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleDeleteOrder = async (order: AdminOrder) => {
    setDeletingOrderId(order.id);

    try {
      const result = await deleteAdminOrder(order.id);
      setOrders((current) => current.filter((item) => item.id !== order.id));
      message.success(result.message);
    } catch (deleteError) {
      message.error(deleteError instanceof Error ? deleteError.message : 'Unable to delete the order right now.');
    } finally {
      setDeletingOrderId(null);
    }
  };

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

  return (
    <AdminOrdersPage
      orders={orders}
      busyOrderId={busyOrderId}
      deletingOrderId={deletingOrderId}
      onUpdateStatus={handleUpdateStatus}
      onDeleteOrder={handleDeleteOrder}
    />
  );
}
