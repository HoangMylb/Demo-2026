import { App, Button, Card, Col, Form, Input, Row, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCheckoutSession, getCheckoutPrefill } from '../lib/storefront-api';
import { useCartStore } from '../stores/cart-store';
import type { AdminSession } from '../types/admin';
import { formatCurrency } from '../utils/format';

interface CheckoutPageProps {
  session: AdminSession | null;
}

export function CheckoutPage({ session }: CheckoutPageProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const [form] = Form.useForm<{ fullName: string; email: string; phoneNumber: string; address: string }>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session?.isAuthenticated) {
      navigate('/auth?mode=login', { replace: true });
      return;
    }

    if (items.length === 0) {
      navigate('/products', { replace: true });
      return;
    }

    let active = true;

    const loadPrefill = async () => {
      try {
        const prefill = await getCheckoutPrefill();
        if (active) {
          form.setFieldsValue(prefill);
        }
      } catch (error) {
        if (active) {
          message.error(error instanceof Error ? error.message : 'Unable to load checkout details.');
        }
      }
    };

    void loadPrefill();

    return () => {
      active = false;
    };
  }, [form, items.length, message, navigate, session?.isAuthenticated]);

  const orderSummary = useMemo(
    () => items.map((item) => ({ ...item, lineTotal: item.price * item.quantity })),
    [items],
  );

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Checkout
      </Typography.Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={async (values) => {
                setSubmitting(true);

                try {
                  const checkoutItems = items.map((item) => {
                    const productId = Number.parseInt(item.id, 10);

                    if (!Number.isFinite(productId)) {
                      throw new Error(`Invalid product identifier for ${item.name}. Please refresh the page and try again.`);
                    }

                    return {
                      productId,
                      productName: item.name,
                      productImageUrl: item.image,
                      unitPrice: item.price,
                      quantity: item.quantity,
                    };
                  });

                  await createCheckoutSession({
                    ...values,
                    fullName: values.fullName.trim(),
                    email: values.email.trim(),
                    phoneNumber: values.phoneNumber.trim(),
                    address: values.address.trim(),
                    items: checkoutItems,
                  });

                  clearCart();
                  message.success('Payment completed successfully. Your demo order has been created.');
                  navigate('/orders');
                } catch (error) {
                  message.error(error instanceof Error ? error.message : 'Unable to start checkout right now.');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <Form.Item name="fullName" label="Full name" rules={[{ required: true, message: 'Please enter your full name.' }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email.' }, { type: 'email', message: 'Please enter a valid email.' }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item name="phoneNumber" label="Phone number" rules={[{ required: true, message: 'Please enter your phone number.' }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please enter your shipping address.' }]}>
                <Input.TextArea rows={4} />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                  Complete demo order
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              Order summary
            </Typography.Title>
            <Space orientation="vertical" size={16} style={{ width: '100%' }}>
              {orderSummary.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <Typography.Text strong>{item.name}</Typography.Text>
                    <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                      Qty {item.quantity}
                    </Typography.Paragraph>
                  </div>
                  <Typography.Text strong>{formatCurrency(item.lineTotal)}</Typography.Text>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border-soft)' }}>
                <Typography.Text type="secondary">Total</Typography.Text>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {formatCurrency(totalPrice)}
                </Typography.Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
