import { Button } from 'antd';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const fullHeadline = 'Design-forward gear for modern digital living.';

interface HeroSectionProps {
  onExploreProducts: () => void;
}

export function HeroSection({ onExploreProducts }: HeroSectionProps) {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let currentIndex = 0;
    const interval = window.setInterval(() => {
      currentIndex += 1;
      setTypedText(fullHeadline.slice(0, currentIndex));

      if (currentIndex >= fullHeadline.length) {
        window.clearInterval(interval);
      }
    }, 42);

    return () => window.clearInterval(interval);
  }, []);

  const highlights = useMemo(
    () => [
      'Framer Motion micro-interactions',
      'Zustand cart persistence',
      'Strictly typed form flows',
    ],
    [],
  );

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] px-6 py-16 lg:px-12"
      style={{
        border: '1px solid var(--color-border-soft)',
        background: 'var(--hero-radial), var(--color-bg-surface)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            style={{
              border: '1px solid var(--color-brand-100)',
              background: 'var(--color-brand-50)',
              color: 'var(--color-brand-700)',
            }}
          >
            <Sparkles className="h-4 w-4" />
            Built for a 24-hour polished sprint
          </motion.div>

          <h2 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl" style={{ color: 'var(--color-text-primary)' }}>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, var(--color-text-primary), var(--color-brand-600), var(--color-brand-fuchsia))',
              }}
            >
              {typedText}
            </span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2 }}
              className="ml-1 inline-block h-12 w-1 rounded-full align-middle"
              style={{ background: 'var(--color-brand-500)' }}
            />
          </h2>

          <p className="mt-6 max-w-xl text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Launch a premium storefront with clean architecture, smooth dark mode, expressive motion, and typed state that scales.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="primary" size="large" onClick={onExploreProducts}>
              Shop the collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="large">Watch product story</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {highlights.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
              className="rounded-[1.75rem] p-6"
              style={{
                border: '1px solid var(--color-border-soft)',
                background: 'var(--color-bg-surface-soft)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-brand-600)' }}>0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item}</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Production-minded UI composition with thoughtful defaults and smooth user feedback.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
