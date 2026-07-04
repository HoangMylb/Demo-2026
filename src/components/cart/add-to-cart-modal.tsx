import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Image, InputNumber, Modal, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { ProductType } from '../../types/product';
import { formatCurrency } from '../../utils/format';

interface AddToCartModalProps {
  product: ProductType | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: (product: ProductType, quantity: number) => void;
}

export function AddToCartModal({ product, open, onCancel, onConfirm }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setQuantity(1);
    }
  }, [open, product?.id]);

  if (!product) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(product, quantity);
  };

  return (
    <Modal
      open={open}
      title="Add product"
      onCancel={onCancel}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleConfirm}>
            Add
          </Button>
        </div>
      }
      destroyOnHidden
      width={620}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px minmax(0, 1fr) auto',
          gap: 16,
          alignItems: 'center',
          paddingTop: 8,
        }}
      >
        <Image
          src={product.image}
          alt={product.name}
          width={120}
          height={120}
          preview={false}
          style={{ borderRadius: 16, objectFit: 'cover' }}
        />

        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {product.name}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 16 }}>
            {formatCurrency(product.price)}
          </Typography.Text>
        </div>

        <Space orientation="vertical" size={8} align="center">
          <Typography.Text strong>Quantity</Typography.Text>
          <Space.Compact>
            <Button
              aria-label="Decrease quantity"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              icon={<MinusOutlined />}
            />
            <InputNumber
              min={1}
              controls={false}
              value={quantity}
              onChange={(value) => setQuantity(typeof value === 'number' && value >= 1 ? value : 1)}
              style={{ width: 72, textAlign: 'center' }}
              className="cart-quantity-input"
            />
            <Button
              aria-label="Increase quantity"
              onClick={() => setQuantity((current) => current + 1)}
              icon={<PlusOutlined />}
            />
          </Space.Compact>
        </Space>
      </div>
    </Modal>
  );
}
