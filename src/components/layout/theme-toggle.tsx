import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../stores/theme-store';

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex w-20 items-center rounded-full border border-slate-200 bg-white/90 px-1.5 py-1 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/90"
    >
      <motion.div
        className="flex w-full items-center justify-between"
        animate={{ opacity: 1 }}
      >
        <Sun className="h-4 w-4 text-amber-500" />
        <Moon className="h-4 w-4 text-sky-400" />
      </motion.div>
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        animate={{ x: isDark ? 28 : 0 }}
        className="absolute ml-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950"
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </motion.span>
    </button>
  );
}
