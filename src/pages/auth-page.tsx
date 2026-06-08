import { LockOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { Card, Segmented, Space, Tag, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthForm } from '../components/auth/auth-form';

interface AuthPageProps {
  audience: 'store' | 'admin';
  onSuccess: () => void;
}

export function AuthPage({ audience, onSuccess }: AuthPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const allowRegister = audience === 'store';

  useEffect(() => {
    if (!allowRegister) {
      setMode('login');
      return;
    }

    setMode(requestedMode);
  }, [allowRegister, requestedMode]);

  const heading = useMemo(
    () =>
      audience === 'admin'
        ? 'Use the isolated admin sign-in so operations access stays separate from the storefront experience.'
        : mode === 'login'
          ? 'Use the standard sign-in flow to restore account access, cart controls, and storefront tools.'
          : 'Create a shopper account with a conventional form flow that client teams can understand immediately.',
    [audience, mode],
  );

  const handleModeChange = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    if (allowRegister) {
      setSearchParams(nextMode === 'register' ? { mode: 'register' } : { mode: 'login' });
    }
  };

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Tag color={audience === 'admin' ? 'red' : 'blue'} style={{ width: 'fit-content' }}>
            {audience === 'admin' ? 'Admin authentication' : 'Store account'}
          </Tag>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {audience === 'admin' ? 'Separate admin login for protected operations.' : 'Account access that unlocks the storefront tools.'}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 760 }}>
            {heading}
          </Typography.Paragraph>

          {allowRegister ? (
            <Segmented
              value={mode}
              onChange={(value) => handleModeChange(value as 'login' | 'register')}
              options={[
                { value: 'login', label: 'Login', icon: <LoginOutlined /> },
                { value: 'register', label: 'Register', icon: <UserAddOutlined /> },
              ]}
            />
          ) : (
            <Tag icon={<LockOutlined />} color="red" style={{ width: 'fit-content' }}>
              Admin access only
            </Tag>
          )}
        </Space>
      </Card>

      <AuthForm mode={mode} audience={audience} onSuccess={onSuccess} />
    </section>
  );
}
