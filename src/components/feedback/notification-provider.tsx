import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Toast } from './toast';

type NotificationTone = 'success' | 'error';

interface NotificationContextValue {
  notify: (message: string, tone?: NotificationTone) => void;
}

interface NotificationItem {
  id: number;
  message: string;
  tone: NotificationTone;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<NotificationItem[]>([]);
  const [current, setCurrent] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (current || queue.length === 0) {
      return;
    }

    setCurrent(queue[0]);
    setQueue((items) => items.slice(1));
  }, [current, queue]);

  useEffect(() => {
    if (!current) {
      return;
    }

    const timeout = window.setTimeout(() => setCurrent(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [current]);

  const notify = useCallback((nextMessage: string, nextTone: NotificationTone = 'success') => {
    setQueue((items) => [
      ...items,
      {
        id: Date.now() + items.length,
        message: nextMessage,
        tone: nextTone,
      },
    ]);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toast visible={Boolean(current)} message={current?.message ?? ''} tone={current?.tone ?? 'success'} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  return context;
}
