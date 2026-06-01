import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  visible: boolean;
  message: string;
  tone?: 'success' | 'error';
}

export function Toast({ visible, message, tone = 'success' }: ToastProps) {
  const isError = tone === 'error';

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.94 }}
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-soft dark:bg-slate-900 ${
            isError ? 'border-rose-200 dark:border-rose-900/60' : 'border-emerald-200 dark:border-emerald-900/60'
          }`}
        >
          {isError ? <AlertCircle className="h-5 w-5 text-rose-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{message}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
