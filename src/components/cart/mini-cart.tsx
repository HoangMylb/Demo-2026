import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, Image, List, Popconfirm, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cart-store';
import { formatCurrency } from '../../utils/format';

interface MiniCartProps {
  visible: boolean;
}

export function MiniCart({ visible }: MiniCartProps) {
  const navigate = useNavigate();
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
      size={420}
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
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text type="secondary">Total</Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatCurrency(totalPrice)}
            </Typography.Title>
          </div>
          <Button type="primary" size="large" block onClick={() => {
            toggleCart(false);
            navigate('/checkout');
          }}>
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
                <Popconfirm
                  key="remove"
                  title="Remove item"
                  description={`Remove ${item.name} from your cart?`}
                  okText="Remove"
                  cancelText="Cancel"
                  onConfirm={() => removeItem(item.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<Image src={item.image} alt={item.name} width={72} height={72} style={{ borderRadius: 12, objectFit: 'cover' }} />}
                title={<Typography.Text strong>{item.name}</Typography.Text>}
                description={
                  <Space orientation="vertical" size={2}>
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
