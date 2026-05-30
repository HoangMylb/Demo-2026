import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../utils/styles';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200',
  secondary:
    'bg-accent-600 text-white shadow-lg shadow-accent-600/20 hover:bg-accent-700',
  ghost:
    'bg-white/70 text-slate-900 hover:bg-white dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900',
};

export function Button({ children, className, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
