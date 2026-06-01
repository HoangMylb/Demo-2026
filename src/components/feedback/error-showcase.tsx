import { AlertTriangle, ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';

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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-hero-radial bg-white px-6 py-16 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700 dark:border-accent-500/20 dark:bg-accent-500/10 dark:text-accent-100">
            {icon}
            {accentLabel}
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.28em] text-accent-600">{eyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl">
            {title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={onGoHome}>
              <Home className="mr-2 h-4 w-4" />
              {homeLabel}
            </Button>
            {onGoBack ? (
              <Button variant="ghost" onClick={onGoBack}>
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
              className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <p className="text-sm font-medium text-accent-600">0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">{item}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Clear guidance helps users recover faster instead of getting stranded on a broken route.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
