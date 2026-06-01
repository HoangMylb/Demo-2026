import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} description={description} onClose={onCancel}>
      <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-500" />
          <p className="text-sm leading-6 text-rose-700 dark:text-rose-200">
            This action is destructive and cannot be undone. Please confirm before continuing.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="secondary" onClick={onConfirm} disabled={busy}>
          {busy ? 'Processing...' : confirmLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
