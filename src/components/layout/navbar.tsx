import { MenuOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { useCartStore } from '../../stores/cart-store';
import type { AdminSession } from '../../types/admin';

const { Header } = Layout;

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  session: AdminSession | null;
  onLogout: () => void;
}

export function Navbar({ currentPath, onNavigate, session, onLogout }: NavbarProps) {
  const itemCount = useCartStore((state) => state.itemCount);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isLoggedIn = Boolean(session?.isAuthenticated);
  const isAdmin = session?.role?.toLowerCase() === 'admin';

  const navigationItems = useMemo(
    () => [
      { key: '/', label: 'Home' },
      { key: '/products', label: 'Products' },
      ...(isAdmin ? [{ key: '/admin', label: 'Dashboard' }] : []),
    ],
    [isAdmin],
  );

  const accountMenuItems = isLoggedIn
    ? [
        { key: 'settings', label: 'Settings', onClick: () => onNavigate('/settings') },
        { key: 'logout', label: 'Logout', onClick: onLogout },
      ]
    : [
        { key: 'login', label: 'Login', onClick: () => onNavigate('/auth?mode=login') },
        { key: 'register', label: 'Register', onClick: () => onNavigate('/auth?mode=register') },
        { key: 'admin-login', label: 'Admin login', onClick: () => onNavigate('/admin/login') },
      ];

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        width: '100%',
        background: 'var(--color-bg-elevated)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--color-border-soft)',
        paddingInline: 24,
        height: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '14px 0',
        }}
      >
        <button type="button" onClick={() => onNavigate('/')} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
          <Typography.Text style={{ textTransform: 'uppercase', letterSpacing: '0.28em', fontSize: 12, color: 'var(--color-brand-600)' }}>
            Luma Commerce
          </Typography.Text>
          <Typography.Title level={5} style={{ margin: 0, color: 'var(--color-text-primary)' }}>
            Interactive Storefront
          </Typography.Title>
        </button>

        <Menu
          mode="horizontal"
          selectedKeys={[navigationItems.find((item) => item.key === '/' ? currentPath === '/' : currentPath === item.key || currentPath.startsWith(`${item.key}/`))?.key ?? '']}
          items={navigationItems.map((item) => ({ key: item.key, label: item.label }))}
          onClick={(event) => onNavigate(event.key)}
          style={{ flex: 1, minWidth: 0, justifyContent: 'center', borderBottom: 'none', background: 'transparent', color: 'var(--color-text-primary)' }}
          overflowedIndicator={null}
        />

        <Space size="middle">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <Dropdown menu={{ items: accountMenuItems }} trigger={['click']}>
            <Button type="text" icon={<Avatar size="small" icon={<UserOutlined />} style={{ background: 'var(--color-bg-surface-soft)', color: 'var(--color-text-primary)' }} />} />
          </Dropdown>

          {isLoggedIn ? (
            <Badge count={itemCount} size="small">
              <Button type="primary" shape="circle" icon={<ShoppingCartOutlined />} onClick={() => toggleCart(true)} />
            </Badge>
          ) : null}

          <Button className="md:hidden" type="text" icon={<MenuOutlined />} onClick={() => setMobileNavOpen(true)} />
        </Space>
      </div>

      <Drawer placement="left" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="Navigation">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <ThemeToggle />
          <Menu
            mode="inline"
            selectedKeys={[navigationItems.find((item) => item.key === '/' ? currentPath === '/' : currentPath === item.key || currentPath.startsWith(`${item.key}/`))?.key ?? '']}
            items={navigationItems.map((item) => ({ key: item.key, label: item.label }))}
            onClick={(event) => {
              setMobileNavOpen(false);
              onNavigate(event.key);
            }}
          />
        </Space>
      </Drawer>
    </Header>
  );
}
