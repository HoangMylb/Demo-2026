import { Button, Card, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrderBySessionId } from '../lib/storefront-api';
import type { Order } from '../types/product';
import { formatCurrency } from '../utils/format';

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return;
    }

    void getOrderBySessionId(sessionId).then(setOrder).catch(() => setOrder(null));
  }, [searchParams]);

  return (
    <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Payment successful
        </Typography.Title>
        <Typography.Text type="secondary">Your order has been created and payment is being tracked.</Typography.Text>
        {order ? (
          <>
            <Typography.Text strong>Order #{order.id}</Typography.Text>
            <Typography.Text>Total: {formatCurrency(order.totalAmount)}</Typography.Text>
            <Typography.Text>Status: {order.status}</Typography.Text>
          </>
        ) : null}
        <Button type="primary" onClick={() => navigate('/orders')}>
          View order history
        </Button>
      </Space>
    </Card>
  );
}
