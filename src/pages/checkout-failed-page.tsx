import { Button, Card, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export function CheckoutFailedPage() {
  const navigate = useNavigate();

  return (
    <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Payment not completed
        </Typography.Title>
        <Typography.Text type="secondary">You can go back to checkout and try again.</Typography.Text>
        <Button type="primary" onClick={() => navigate('/checkout')}>
          Return to checkout
        </Button>
      </Space>
    </Card>
  );
}
