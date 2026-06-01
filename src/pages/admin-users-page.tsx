import type { AdminUser } from '../types/admin';
import { AdminUsersTable } from '../components/admin/admin-users-table';
import { ConfirmDialog } from '../components/feedback/confirm-dialog';
import { useNotification } from '../components/feedback/notification-provider';
import { Modal } from '../components/ui/modal';
import { Button } from '../components/ui/button';
import { useEffect, useState } from 'react';
import type { AdminSession } from '../types/admin';

interface AdminUsersPageProps {
  session: AdminSession | null;
  users: AdminUser[];
  busyUserId: number | null;
  onUpdateUser: (user: AdminUser, payload: { fullName: string; userName: string; email: string; role: 'Admin' | 'User' }) => Promise<{ message: string }>;
  onToggleLock: (user: AdminUser) => Promise<{ message: string }>;
  onToggleApproval: (user: AdminUser) => Promise<{ message: string }>;
  onDeleteUser: (user: AdminUser) => Promise<{ message: string }>;
}

type PendingUserAction =
  | { type: 'lock'; user: AdminUser }
  | { type: 'approval'; user: AdminUser }
  | null;

export function AdminUsersPage({ session, users, busyUserId, onUpdateUser, onToggleLock, onToggleApproval, onDeleteUser }: AdminUsersPageProps) {
  const { notify } = useNotification();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AdminUser | null>(null);
  const [pendingUserAction, setPendingUserAction] = useState<PendingUserAction>(null);
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'User'>('User');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingUser) {
      setFullName('');
      setUserName('');
      setEmail('');
      setRole('User');
      return;
    }

    setFullName(editingUser.fullName);
    setUserName(editingUser.userName);
    setEmail(editingUser.email);
    setRole(editingUser.role === 'Admin' ? 'Admin' : 'User');
  }, [editingUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }

    setSaving(true);

    try {
      if (session?.email && editingUser.email === session.email && role !== 'Admin') {
        notify('You cannot remove your own admin role.', 'error');
        return;
      }

      const result = await onUpdateUser(editingUser, { fullName, userName, email, role });
      setEditingUser(null);
      notify(result.message);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to update the user right now.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminUsersTable
        users={users}
        busyUserId={busyUserId}
        onEditUser={setEditingUser}
        onToggleLock={async (user) => setPendingUserAction({ type: 'lock', user })}
        onToggleApproval={async (user) => setPendingUserAction({ type: 'approval', user })}
        onDeleteUser={async (user) => setPendingDeleteUser(user)}
      />

      <Modal
        open={Boolean(editingUser)}
        title="Edit user access"
        description="Use a focused popup to update identity fields and role assignments without disrupting the table layout."
        onClose={() => setEditingUser(null)}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Username</span>
            <input value={userName} onChange={(event) => setUserName(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as 'Admin' | 'User')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="User" disabled={Boolean(session?.email && editingUser?.email === session.email)}>
                User
              </option>
              <option value="Admin">Admin</option>
            </select>
            {session?.email && editingUser?.email === session.email ? (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">You cannot remove your own admin role while you are using this admin session.</p>
            ) : null}
          </label>

          <div className="flex gap-3 md:col-span-2">
            <Button type="submit" variant="secondary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDeleteUser)}
        title="Delete user"
        description={pendingDeleteUser ? `Delete ${pendingDeleteUser.fullName} and permanently remove their account from the system.` : 'Delete the selected user account.'}
        confirmLabel="Delete user"
        busy={busyUserId === pendingDeleteUser?.id}
        onConfirm={() => {
          if (pendingDeleteUser) {
            void onDeleteUser(pendingDeleteUser)
              .then((result) => {
                setPendingDeleteUser(null);
                notify(result.message);
              })
              .catch((error) => {
                notify(error instanceof Error ? error.message : 'Unable to delete the user right now.', 'error');
              });
          }
        }}
        onCancel={() => setPendingDeleteUser(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingUserAction)}
        title={pendingUserAction?.type === 'lock' ? (pendingUserAction.user.isLocked ? 'Unlock user' : 'Lock user') : pendingUserAction?.user.isApproved ? 'Revoke approval' : 'Approve user'}
        description={
          pendingUserAction?.type === 'lock'
            ? pendingUserAction.user.isLocked
              ? `Restore ${pendingUserAction.user.fullName}'s account access.`
              : `Temporarily block ${pendingUserAction.user.fullName} from using the account.`
            : pendingUserAction?.user
              ? pendingUserAction.user.isApproved
                ? `Remove approval for ${pendingUserAction.user.fullName}.`
                : `Approve ${pendingUserAction.user.fullName} for platform access.`
              : 'Confirm this user access change.'
        }
        confirmLabel={
          pendingUserAction?.type === 'lock'
            ? pendingUserAction.user.isLocked
              ? 'Unlock user'
              : 'Lock user'
            : pendingUserAction?.user?.isApproved
              ? 'Revoke approval'
              : 'Approve user'
        }
        busy={busyUserId === pendingUserAction?.user.id}
        onConfirm={() => {
          if (!pendingUserAction) {
            return;
          }

          const actionPromise = pendingUserAction.type === 'lock' ? onToggleLock(pendingUserAction.user) : onToggleApproval(pendingUserAction.user);
          void actionPromise
            .then((result) => {
              setPendingUserAction(null);
              notify(result.message);
            })
            .catch((error) => {
              notify(error instanceof Error ? error.message : 'Unable to update this user action right now.', 'error');
            });
        }}
        onCancel={() => setPendingUserAction(null)}
      />
    </>
  );
}
