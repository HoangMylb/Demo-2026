import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, Image, List, Space, Typography } from 'antd';
import { useCartStore } from '../../stores/cart-store';
import { formatCurrency } from '../../utils/format';

interface MiniCartProps {
  visible: boolean;
}

export function MiniCart({ visible }: MiniCartProps) {
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  if (!visible) {
    return null;
  }

  return (
    <Drawer
      title="Your cart"
      placement="right"
      width={420}
      onClose={() => toggleCart(false)}
      open={isOpen}
      extra={
        items.length > 0 ? (
          <Button type="text" onClick={clearCart}>
            Clear
          </Button>
        ) : null
      }
      footer={
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text type="secondary">Total</Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatCurrency(totalPrice)}
            </Typography.Title>
          </div>
          <Button type="primary" size="large" block>
            Checkout
          </Button>
        </Space>
      }
    >
      {items.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Your cart is empty"
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="remove" type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item.id)} />,
              ]}
            >
              <List.Item.Meta
                avatar={<Image src={item.image} alt={item.name} width={72} height={72} style={{ borderRadius: 12, objectFit: 'cover' }} />}
                title={<Typography.Text strong>{item.name}</Typography.Text>}
                description={
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">Qty {item.quantity}</Typography.Text>
                    <Typography.Text>{formatCurrency(item.price * item.quantity)}</Typography.Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}
