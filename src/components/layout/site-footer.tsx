import { Divider, Layout, Space, Tag, Typography } from 'antd';

const { Footer } = Layout;

export function SiteFooter() {
  return (
    <Footer
      style={{
        background: 'transparent',
        padding: '32px 0 48px',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '24px 28px',
          borderRadius: 28,
          background: 'var(--color-bg-surface-soft)',
          border: '1px solid var(--color-border-soft)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Space wrap size={[12, 12]} style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Typography.Text style={{ textTransform: 'uppercase', letterSpacing: '0.26em', fontSize: 12, color: 'var(--color-brand-600)' }}>
                Luma Commerce
              </Typography.Text>
              <Typography.Title level={4} style={{ margin: '6px 0 0', color: 'var(--color-text-primary)' }}>
                Product-minded frontend for fast client delivery.
              </Typography.Title>
            </div>

            <Space wrap>
              <Tag color="blue">React + Vite</Tag>
              <Tag color="cyan">Ant Design</Tag>
              <Tag color="purple">Tailwind tokens</Tag>
            </Space>
          </Space>

          <Typography.Paragraph style={{ margin: 0, color: 'var(--color-text-secondary)', maxWidth: 760 }}>
            Standardized UI primitives where clients care about speed and maintainability, with branded presentation kept only where it adds portfolio value.
          </Typography.Paragraph>

          <Divider style={{ margin: '8px 0', borderColor: 'var(--color-border-soft)' }} />

          <Space wrap size={[16, 8]} style={{ justifyContent: 'space-between', width: '100%' }}>
            <Typography.Text style={{ color: 'var(--color-text-muted)' }}>
              © 2026 Luma Commerce Portfolio Demo
            </Typography.Text>
            <Typography.Text style={{ color: 'var(--color-text-muted)' }}>
              Built to showcase practical delivery, maintainability, and client-ready UI decisions.
            </Typography.Text>
          </Space>
        </Space>
      </div>
    </Footer>
  );
}
