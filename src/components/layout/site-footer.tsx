import { Divider, Layout, Space, Tag, Typography } from 'antd';

const { Footer } = Layout;

export function SiteFooter() {
  return (
    <Footer
      style={{
        background: 'transparent',
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
        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          <Space wrap size={[12, 12]} style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Typography.Text style={{ textTransform: 'uppercase', letterSpacing: '0.26em', fontSize: 12, color: 'var(--color-brand-600)' }}>
                Hoang My Portfolio
              </Typography.Text>
              <Typography.Title level={4} style={{ margin: '6px 0 0', color: 'var(--color-text-primary)' }}>
                SaaS MVP Developer
              </Typography.Title>
            </div>

            <Space wrap>
              <Tag color="blue">React + Vite</Tag>
              <Tag color="cyan">.NET 9.0 API</Tag>
              <Tag color="purple">Supabase Postgres</Tag>
              <Tag color="orange">Ant Design</Tag>
            </Space>
          </Space>

          <Divider style={{ margin: '8px 0', borderColor: 'var(--color-border-soft)' }} />

          <Space wrap size={[16, 8]} style={{ justifyContent: 'space-between', width: '100%' }}>
            <Typography.Text style={{ color: 'var(--color-text-muted)' }}>
              © 2026 Hoang My. All rights reserved.
            </Typography.Text>
          </Space>
        </Space>
      </div>
    </Footer>
  );
}
