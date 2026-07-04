import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Input, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { AdminOrder, AdminOrderStatus } from '../types/admin';
import { formatCurrency } from '../utils/format';

interface AdminOrdersPageProps {
  orders: AdminOrder[];
  busyOrderId: number | null;
  deletingOrderId: number | null;
  onUpdateStatus: (order: AdminOrder, status: AdminOrderStatus) => Promise<void>;
  onDeleteOrder: (order: AdminOrder) => Promise<void>;
}

const orderStatusOptions: Array<{ value: AdminOrderStatus; label: string }> = [
  { value: 'Order', label: 'Order' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipping', label: 'Shipping' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export function AdminOrdersPage({ orders, busyOrderId, deletingOrderId, onUpdateStatus, onDeleteOrder }: AdminOrdersPageProps) {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | 'all'>('all');

  const filteredOrders = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.phoneNumber.toLowerCase().includes(query) ||
        String(order.id).includes(query);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchValue, statusFilter]);

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
        <Space wrap align="center">
          <Select<AdminOrderStatus>
            value={order.status as AdminOrderStatus}
            style={{ minWidth: 150 }}
            options={orderStatusOptions}
            loading={busyOrderId === order.id}
            disabled={busyOrderId === order.id}
            onChange={(value) => {
              void onUpdateStatus(order, value);
            }}
          />
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, order) => (
        <Popconfirm
          title="Delete order"
          description={`Delete order #${order.id} for ${order.customerName}.`}
          okText="Delete"
          cancelText="Cancel"
          onConfirm={() => onDeleteOrder(order)}
        >
          <Button danger icon={<DeleteOutlined />} loading={deletingOrderId === order.id}>
            Delete
          </Button>
        </Popconfirm>
      ),
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
        <Space size={12} wrap style={{ marginBottom: 20, width: '100%' }}>
          <Input.Search
            allowClear
            placeholder="Search orders"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            style={{ flex: '1 1 280px', minWidth: 240 }}
          />
          <Select
            value={statusFilter}
            style={{ minWidth: 180 }}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All status' },
              ...orderStatusOptions,
            ]}
          />
        </Space>
        <Table rowKey="id" columns={columns} dataSource={filteredOrders} pagination={{ pageSize: 6, showSizeChanger: false }} scroll={{ x: 1000 }} />
      </Card>
    </Space>
  );
}
