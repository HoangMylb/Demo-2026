import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { loginAdmin, registerAdmin } from '../../lib/admin-api';
import { Button } from '../ui/button';

const authSchema = z.object({
  name: z.string().min(2, 'Please enter at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type AuthFormValues = z.infer<typeof authSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const isRegister = mode === 'register';
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema.refine((data) => (isRegister ? Boolean(data.name?.trim()) : true), {
      path: ['name'],
      message: 'Full name is required for registration',
    })),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setSubmitError(null);

    try {
      if (isRegister) {
        await registerAdmin(values.name?.trim() ?? '', values.email, values.password);
      } else {
        await loginAdmin(values.email, values.password);
      }

      onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to complete authentication.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">
        {isRegister ? 'Create account' : 'Welcome back'}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {isRegister ? 'Start your premium storefront journey' : 'Sign in to continue shopping'}
      </h2>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Sign in or register against the backend auth API. Seeded test accounts are admin@gmail.com / 123456 and user@gmail.com / 123456.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {isRegister ? (
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
        ) : null}

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
          {isSubmitting ? 'Submitting...' : isRegister ? 'Create account' : 'Access admin panel'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
