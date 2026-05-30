import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';

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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-hero-radial bg-white px-6 py-16 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700 dark:border-accent-500/20 dark:bg-accent-500/10 dark:text-accent-100"
          >
            <Sparkles className="h-4 w-4" />
            Built for a 24-hour polished sprint
          </motion.div>

          <h2 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
            <span className="bg-gradient-to-r from-slate-950 via-accent-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-white dark:via-accent-300 dark:to-fuchsia-300">
              {typedText}
            </span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2 }}
              className="ml-1 inline-block h-12 w-1 rounded-full bg-accent-500 align-middle"
            />
          </h2>

          <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
            Launch a premium storefront with clean architecture, smooth dark mode, expressive motion, and typed state that scales.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={onExploreProducts}>
              Shop the collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost">Watch product story</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {highlights.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
              className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <p className="text-sm font-medium text-accent-600">0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">{item}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Production-minded UI composition with thoughtful defaults and smooth user feedback.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
