import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  visible: boolean;
  message: string;
}

export function Toast({ visible, message }: ToastProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.94 }}
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-soft dark:border-emerald-900/60 dark:bg-slate-900"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{message}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
