import { Card, Empty, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getMyOrders } from '../lib/storefront-api';
import type { Order } from '../types/product';
import { formatCurrency } from '../utils/format';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    void getMyOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  return (
    <Space orientation="vertical" size={20} style={{ width: '100%' }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Order history
      </Typography.Title>

      {orders.length === 0 ? (
        <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
          <Empty description="No orders yet" />
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                <Typography.Text strong>Order #{order.id}</Typography.Text>
                <Space wrap>
                  <Tag>{order.status}</Tag>
                  <Tag>{order.paymentStatus}</Tag>
                </Space>
              </Space>
              <Typography.Text type="secondary">{new Date(order.createdAtUtc).toLocaleString()}</Typography.Text>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <Typography.Text>{item.productName} × {item.quantity}</Typography.Text>
                  <Typography.Text strong>{formatCurrency(item.lineTotal)}</Typography.Text>
                </div>
              ))}
            </Space>
          </Card>
        ))
      )}
    </Space>
  );
}
