import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { clearAdminSession, loginAdmin, registerAdmin } from '../../lib/admin-api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
  audience: 'store' | 'admin';
  onSuccess: () => void;
}

interface BaseFormProps {
  audience: 'store' | 'admin';
  onSuccess: () => void;
}

function AuthFormFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card bordered={false} style={{ width: '100%', maxWidth: 480, marginInline: 'auto', boxShadow: 'var(--shadow-soft)' }}>
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Typography.Text type="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 12 }}>
          {eyebrow}
        </Typography.Text>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {description}
        </Typography.Paragraph>
      </Space>
      <div style={{ marginTop: 28 }}>{children}</div>
    </Card>
  );
}

function LoginForm({ audience, onSuccess }: BaseFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);

    try {
      const session = await loginAdmin(values.email, values.password);

      if (audience === 'admin' && session?.role?.toLowerCase() !== 'admin') {
        clearAdminSession();
        throw new Error('This account does not have admin access. Please use an administrator account.');
      }

      onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to complete login.');
    }
  };

  return (
    <AuthFormFrame
      eyebrow="Welcome back"
      title={audience === 'admin' ? 'Sign in to manage the admin workspace' : 'Sign in to continue shopping'}
      description={
        audience === 'admin'
          ? 'Admin access is separated from the storefront. Use an administrator account such as admin@gmail.com / 123456.'
          : 'Use your shopper account to unlock the account menu and cart. Example accounts are user@gmail.com / 123456.'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>Email</Typography.Text>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<MailOutlined />}
                  placeholder="hello@lumastore.com"
                  size="large"
                  status={errors.email ? 'error' : ''}
                />
              )}
            />
            {errors.email ? <Typography.Paragraph type="danger" style={{ margin: '8px 0 0' }}>{errors.email.message}</Typography.Paragraph> : null}
          </div>

          <div>
            <Typography.Text strong>Password</Typography.Text>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  size="large"
                  status={errors.password ? 'error' : ''}
                />
              )}
            />
            {errors.password ? <Typography.Paragraph type="danger" style={{ margin: '8px 0 0' }}>{errors.password.message}</Typography.Paragraph> : null}
          </div>

          {submitError ? <Alert type="error" showIcon message={submitError} /> : null}

          <Button type="primary" htmlType="submit" loading={isSubmitting} size="large" block icon={<ArrowRightOutlined />} iconPosition="end">
            {audience === 'admin' ? 'Access admin panel' : 'Login'}
          </Button>
        </Space>
      </form>
    </AuthFormFrame>
  );
}

function RegisterForm({ onSuccess }: BaseFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);

    try {
      await registerAdmin(values.name, values.email, values.password);
      onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to complete registration.');
    }
  };

  return (
    <AuthFormFrame
      eyebrow="Create account"
      title="Start your premium storefront journey"
      description="Create a shopper account first, then your account dropdown and cart access will appear in the navigation."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>Full name</Typography.Text>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  placeholder="Avery Morgan"
                  size="large"
                  status={errors.name ? 'error' : ''}
                />
              )}
            />
            {errors.name ? <Typography.Paragraph type="danger" style={{ margin: '8px 0 0' }}>{errors.name.message}</Typography.Paragraph> : null}
          </div>

          <div>
            <Typography.Text strong>Email</Typography.Text>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<MailOutlined />}
                  placeholder="hello@lumastore.com"
                  size="large"
                  status={errors.email ? 'error' : ''}
                />
              )}
            />
            {errors.email ? <Typography.Paragraph type="danger" style={{ margin: '8px 0 0' }}>{errors.email.message}</Typography.Paragraph> : null}
          </div>

          <div>
            <Typography.Text strong>Password</Typography.Text>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Create a password"
                  size="large"
                  status={errors.password ? 'error' : ''}
                />
              )}
            />
            {errors.password ? <Typography.Paragraph type="danger" style={{ margin: '8px 0 0' }}>{errors.password.message}</Typography.Paragraph> : null}
          </div>

          {submitError ? <Alert type="error" showIcon message={submitError} /> : null}

          <Button type="primary" htmlType="submit" loading={isSubmitting} size="large" block icon={<ArrowRightOutlined />} iconPosition="end">
            Create account
          </Button>
        </Space>
      </form>
    </AuthFormFrame>
  );
}

export function AuthForm({ mode, audience, onSuccess }: AuthFormProps) {
  if (mode === 'register') {
    return <RegisterForm audience={audience} onSuccess={onSuccess} />;
  }

  return <LoginForm audience={audience} onSuccess={onSuccess} />;
}
