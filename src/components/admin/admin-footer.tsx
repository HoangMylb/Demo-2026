import { Layout, Typography } from 'antd';

const { Footer } = Layout;

export function AdminFooter() {
  return (
    <Footer style={{ background: 'transparent', padding: '0 24px 24px' }}>
      <div
        style={{
          borderRadius: 20,
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-soft)',
          padding: '16px 20px',
        }}
      >
        <Typography.Text style={{ color: 'var(--color-text-muted)' }}>
          Admin workspace
        </Typography.Text>
      </div>
    </Footer>
  );
}
