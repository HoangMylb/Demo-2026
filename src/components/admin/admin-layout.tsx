import { AppstoreOutlined, BarChartOutlined, SettingOutlined, ShopOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Grid, Layout, Menu, Space, Tag, theme, Typography } from 'antd';
import { useMemo, type PropsWithChildren } from 'react';

const { Header, Content, Sider } = Layout;

export type AdminView = 'dashboard' | 'products' | 'users';

interface AdminLayoutProps extends PropsWithChildren {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  onExit: () => void;
  onOpenSettings: () => void;
  sessionRole: string | null;
  sessionEmail: string | null;
}

export function AdminLayout({ activeView, onNavigate, onExit, onOpenSettings, sessionRole, sessionEmail, children }: AdminLayoutProps) {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isDesktop = Boolean(screens.lg);

  const menuItems = useMemo(
    () => [
      { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
      { key: 'products', icon: <ShopOutlined />, label: 'Products' },
      { key: 'users', icon: <TeamOutlined />, label: 'Users' },
    ],
    [],
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth={isDesktop ? 80 : 0}
        width={260}
        style={{ background: 'transparent' }}
      >
        <div
            style={{
              position: 'sticky',
              top: 24,
              marginRight: 24,
              borderRadius: token.borderRadiusLG,
              background: 'var(--color-bg-surface)',
              border: `1px solid var(--color-border-soft)`,
              padding: 20,
              boxShadow: token.boxShadowTertiary,
            }}
        >
          <Space direction="vertical" size={4} style={{ marginBottom: 20 }}>
            <Typography.Text type="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 12 }}>
              Admin panel
            </Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Operations workspace
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
              A clean enterprise-style workspace that communicates maintainability and delivery speed.
            </Typography.Paragraph>
          </Space>

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              marginBottom: 20,
              padding: 16,
              borderRadius: token.borderRadiusLG,
              background: 'var(--color-brand-50)',
            }}
          >
            <BarChartOutlined style={{ color: 'var(--color-brand-600)', fontSize: 18, marginTop: 2 }} />
            <div>
              <Typography.Text strong>Admin APIs</Typography.Text>
              <Typography.Paragraph type="secondary" style={{ margin: '6px 0 0', fontSize: 13 }}>
                Standardized CRUD screens built for fast delivery and easier client handoff.
              </Typography.Paragraph>
            </div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[activeView]}
            items={menuItems}
            onClick={(event) => onNavigate(event.key as AdminView)}
            style={{ borderInlineEnd: 'none' }}
          />

          <Button block style={{ marginTop: 20 }} onClick={onExit}>
            Back to storefront
          </Button>
        </div>
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            background: 'transparent',
            padding: '24px 0 0',
            height: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: isDesktop ? '20px 24px' : '16px',
              borderRadius: token.borderRadiusLG,
              background: 'var(--color-bg-surface)',
              border: `1px solid var(--color-border-soft)`,
              boxShadow: token.boxShadowTertiary,
            }}
          >
            <div>
              <Typography.Text type="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 12 }}>
                Control center
              </Typography.Text>
              <Typography.Title level={isDesktop ? 2 : 3} style={{ margin: '6px 0 0' }}>
                Admin Panel
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ margin: '6px 0 0' }}>
                Standardized admin flows using familiar UI patterns for faster delivery and easier client handoff.
              </Typography.Paragraph>
            </div>

            <Dropdown
              menu={{
                items: [
                  { key: 'email', label: sessionEmail ?? 'No email available', disabled: true },
                  { key: 'role', label: sessionRole ?? 'Unknown role', disabled: true },
                  { type: 'divider' },
                  { key: 'settings', icon: <SettingOutlined />, label: 'Settings', onClick: onOpenSettings },
                  { key: 'logout', label: 'Logout', onClick: onExit },
                ],
              }}
              trigger={['click']}
            >
              <Button type="text" style={{ height: 'auto', padding: 0 }}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  {isDesktop ? (
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>Admin workspace</Typography.Text>
                      <Tag color="blue" style={{ marginInlineEnd: 0, width: 'fit-content' }}>
                        {sessionRole ?? 'Unknown role'}
                      </Tag>
                    </Space>
                  ) : null}
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ padding: '24px 0' }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
