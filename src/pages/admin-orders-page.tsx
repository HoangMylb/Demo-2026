import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { AdminOrder } from '../types/admin';
import { formatCurrency } from '../utils/format';

interface AdminOrdersPageProps {
  orders: AdminOrder[];
}

export function AdminOrdersPage({ orders }: AdminOrdersPageProps) {
  const columns: ColumnsType<AdminOrder> = [
    {
      title: 'Order',
      key: 'order',
      render: (_, order) => (
        <Space orientation="vertical" size={2}>
          <Typography.Text strong>#{order.id}</Typography.Text>
          <Typography.Text type="secondary">{order.customerName}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, order) => (
        <Space orientation="vertical" size={2}>
          <Typography.Text>{order.customerEmail}</Typography.Text>
          <Typography.Text type="secondary">{order.phoneNumber}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, order) => (
        <Space wrap>
          <Tag>{order.status}</Tag>
          <Tag>{order.paymentStatus}</Tag>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAtUtc',
      key: 'createdAtUtc',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <Space orientation="vertical" size={20} style={{ width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Order management
        </Typography.Title>
      </Card>
      <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
        <Table rowKey="id" columns={columns} dataSource={orders} pagination={{ pageSize: 6, showSizeChanger: false }} scroll={{ x: 1000 }} />
      </Card>
    </Space>
  );
}
