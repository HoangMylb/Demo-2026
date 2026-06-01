import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { clearAdminSession, loginAdmin, registerAdmin } from '../../lib/admin-api';
import { Button } from '../ui/button';

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
    <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {children}
    </div>
  );
}

function LoginForm({ audience, onSuccess }: BaseFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
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
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              {...register('email')}
              placeholder="hello@lumastore.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.email ? <p className="mt-2 text-sm text-rose-500">{errors.email.message}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <LockKeyhole className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="Enter your password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.password ? <p className="mt-2 text-sm text-rose-500">{errors.password.message}</p> : null}
        </label>

        {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}

        <Button type="submit" variant="secondary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in...' : audience === 'admin' ? 'Access admin panel' : 'Login'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </AuthFormFrame>
  );
}

function RegisterForm({ onSuccess }: BaseFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
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
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <UserRound className="h-4 w-4 text-slate-400" />
            <input
              {...register('name')}
              placeholder="Avery Morgan"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.name ? <p className="mt-2 text-sm text-rose-500">{errors.name.message}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              {...register('email')}
              placeholder="hello@lumastore.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.email ? <p className="mt-2 text-sm text-rose-500">{errors.email.message}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <LockKeyhole className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="Create a password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.password ? <p className="mt-2 text-sm text-rose-500">{errors.password.message}</p> : null}
        </label>

        {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}

        <Button type="submit" variant="secondary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating account...' : 'Create account'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
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
