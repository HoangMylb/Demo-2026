import { BarChartOutlined, ShoppingOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Row, Space, Statistic, Tag, Typography } from 'antd';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AdminProduct, AdminStats } from '../types/admin';

interface AdminDashboardPageProps {
  stats: AdminStats | null;
  products: AdminProduct[];
  loading: boolean;
  error: string | null;
}

export function AdminDashboardPage({ stats, products, loading, error }: AdminDashboardPageProps) {
  const chartData = Object.values(
    products.reduce<Record<string, { name: string; total: number }>>((accumulator, product) => {
      const key = product.categoryName;
      const current = accumulator[key] ?? { name: key, total: 0 };

      accumulator[key] = {
        name: current.name,
        total: current.total + 1,
      };

      return accumulator;
    }, {}),
  );

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Dashboard overview
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
          High-signal metrics and product distribution in a layout clients and internal teams can scan quickly.
        </Typography.Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
            <Statistic title="Total users" value={stats?.totalUsers ?? 0} prefix={<TeamOutlined />} loading={loading && !stats} />
            <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
              Live count pulled from the admin statistics endpoint.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
            <Statistic title="Total products" value={stats?.totalProducts ?? 0} prefix={<ShoppingOutlined />} loading={loading && !stats} />
            <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
              Current product inventory returned by the backend.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      <Card
        title="Category distribution"
        extra={<Tag color="blue">Live product data</Tag>}
        bordered={false}
        style={{ boxShadow: 'var(--shadow-soft)' }}
      >
        <Typography.Paragraph type="secondary">
          This chart shows how the current inventory is distributed across categories.
        </Typography.Paragraph>

        <div style={{ height: 320 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d9d9d9" vertical={false} />
                <XAxis dataKey="name" stroke="#8c8c8c" />
                <YAxis stroke="#8c8c8c" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#1677ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No product data available yet" />
          )}
        </div>

        {error ? (
          <Typography.Paragraph type="danger" style={{ marginTop: 16, marginBottom: 0 }}>
            <BarChartOutlined /> {` ${error}`}
          </Typography.Paragraph>
        ) : null}
      </Card>
    </Space>
  );
}
