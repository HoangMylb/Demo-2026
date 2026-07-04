import { AppstoreOutlined, LogoutOutlined, MenuOutlined, MessageOutlined, SettingOutlined, ShopOutlined, ShoppingOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Grid, Layout, Menu, Space, Tag, theme, Typography } from 'antd';
import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AdminFooter } from './admin-footer';
import { ThemeToggle } from '../layout/theme-toggle';

const { Header, Content, Sider } = Layout;

export type AdminView = 'dashboard' | 'products' | 'users' | 'reviews' | 'orders';

interface AdminLayoutProps extends PropsWithChildren {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  sessionRole: string | null;
  sessionEmail: string | null;
}

export function AdminLayout({ activeView, onNavigate, onLogout, onOpenSettings, sessionRole, sessionEmail, children }: AdminLayoutProps) {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isDesktop = Boolean(screens.lg);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) {
      setMobileNavOpen(false);
    }
  }, [isDesktop]);

  const menuItems = useMemo(
      () => [
        { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
        { key: 'products', icon: <ShopOutlined />, label: 'Products' },
        { key: 'users', icon: <TeamOutlined />, label: 'Users' },
        { key: 'reviews', icon: <MessageOutlined />, label: 'Reviews' },
        { key: 'orders', icon: <ShoppingOutlined />, label: 'Orders' },
      ],
    [],
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth={80}
        width={260}
        style={{ background: 'transparent', paddingLeft: isDesktop ? 24 : 0, display: isDesktop ? 'block' : 'none' }}
      >
        <div
            style={{
              position: 'sticky',
              top: 24,
              marginRight: isDesktop ? 24 : 0,
              borderRadius: token.borderRadiusLG,
              background: 'var(--color-bg-surface)',
              border: `1px solid var(--color-border-soft)`,
              padding: 20,
              boxShadow: token.boxShadowTertiary,
            }}
        >
          <Typography.Title level={4} style={{ margin: '0 0 20px' }}>
            Admin Panel
          </Typography.Title>

          <Menu
            mode="inline"
            selectedKeys={[activeView]}
            items={menuItems}
            onClick={(event) => {
              onNavigate(event.key as AdminView);
              if (!isDesktop) {
                setMobileNavOpen(false);
              }
            }}
            style={{ borderInlineEnd: 'none' }}
          />
        </div>
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            background: 'transparent',
            padding: isDesktop ? '24px 24px 0 24px' : '16px 16px 0 16px',
            height: 'auto',
            position: isDesktop ? 'static' : 'sticky',
            top: isDesktop ? 'auto' : 0,
            left: 0,
            right: 0,
            zIndex: isDesktop ? 'auto' : 30,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: isDesktop ? '18px 22px' : '14px 16px',
              borderRadius: token.borderRadiusLG,
              background: 'var(--color-bg-surface)',
              border: `1px solid var(--color-border-soft)`,
            }}
          >
            <Space size={12} align="center">
              {!isDesktop ? (
                <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileNavOpen((current) => !current)} aria-label="Open admin navigation" />
              ) : null}
              <div>
              <Typography.Title level={isDesktop ? 3 : 4} style={{ margin: 0 }}>
                Admin Panel
              </Typography.Title>
              </div>
            </Space>

            <Space size={12} align="center">
              <ThemeToggle />

              <Dropdown
                menu={{
                  items: [
                    { key: 'settings', icon: <SettingOutlined />, label: 'Settings', onClick: onOpenSettings },
                    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: onLogout },
                  ],
                }}
                trigger={['click']}
                classNames={{ root: 'admin-account-dropdown' }}
              >
                <Button
                  type="text"
                  className="admin-identity-trigger"
                  style={{
                    height: 'auto',
                    padding: isDesktop ? '10px 14px' : '10px 12px',
                    borderRadius: token.borderRadiusLG,
                    border: `1px solid var(--color-border-soft)`,
                    background: 'var(--color-bg-surface)',
                  }}
                >
                  <Space size={10} align="center">
                    <Avatar
                      size={44}
                      icon={<UserOutlined />}
                      style={{ background: 'var(--color-brand-600)', color: '#ffffff', flexShrink: 0 }}
                    />
                    {isDesktop ? (
                      <Tag className="admin-tag admin-tag--role" bordered={false} style={{ marginInlineEnd: 0, width: 'fit-content' }}>
                          {sessionRole ?? 'Unknown role'}
                      </Tag>
                    ) : null}
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </div>

          {!isDesktop && mobileNavOpen ? (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: token.borderRadiusLG,
                background: 'var(--color-bg-surface)',
                border: `1px solid var(--color-border-soft)`,
              }}
            >
              <Menu
                mode="inline"
                selectedKeys={[activeView]}
                items={menuItems}
                onClick={(event) => {
                  onNavigate(event.key as AdminView);
                  setMobileNavOpen(false);
                }}
                style={{ borderInlineEnd: 'none' }}
              />
            </div>
          ) : null}
        </Header>

        <Content style={{ padding: isDesktop ? '24px 24px 32px' : '16px 16px 24px', marginTop: isDesktop ? 0 : 8 }}>{children}</Content>
        <AdminFooter />
      </Layout>
    </Layout>
  );
}
