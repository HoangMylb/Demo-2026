import { Button } from 'antd';
import { AlertTriangle, ArrowLeft, Home, ShieldAlert } from 'lucide-react';

interface ErrorShowcaseProps {
  eyebrow: string;
  title: string;
  description: string;
  accentLabel: string;
  highlights: string[];
  onGoHome: () => void;
  onGoBack?: () => void;
  homeLabel?: string;
  backLabel?: string;
  variant?: 'not-found' | 'unauthorized' | 'crash';
}

export function ErrorShowcase({
  eyebrow,
  title,
  description,
  accentLabel,
  highlights,
  onGoHome,
  onGoBack,
  homeLabel = 'Back to home',
  backLabel = 'Go back',
  variant = 'not-found',
}: ErrorShowcaseProps) {
  const icon = variant === 'unauthorized' ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />;

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] px-6 py-16 shadow-soft lg:px-12"
      style={{
        border: '1px solid var(--color-border-soft)',
        background: 'var(--hero-radial), var(--color-bg-surface)',
      }}
    >
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            style={{
              border: '1px solid var(--color-brand-100)',
              background: 'var(--color-brand-50)',
              color: 'var(--color-brand-700)',
            }}
          >
            {icon}
            {accentLabel}
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.28em]" style={{ color: 'var(--color-brand-600)' }}>{eyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="primary" size="large" onClick={onGoHome}>
              <Home className="mr-2 h-4 w-4" />
              {homeLabel}
            </Button>
            {onGoBack ? (
              <Button size="large" onClick={onGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {highlights.map((item, index) => (
            <div
              key={item}
              className="rounded-[1.75rem] p-6"
              style={{
                border: '1px solid var(--color-border-soft)',
                background: 'var(--color-bg-surface-soft)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-brand-600)' }}>0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item}</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Clear guidance helps users recover faster instead of getting stranded on a broken route.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
