import { Lock, ShieldCheck, ShieldOff, Trash2, Unlock } from 'lucide-react';
import { Button } from '../ui/button';
import type { AdminUser } from '../../types/admin';

interface AdminUsersTableProps {
  users: AdminUser[];
  busyUserId: number | null;
  onEditUser: (user: AdminUser) => void;
  onToggleLock: (user: AdminUser) => void;
  onToggleApproval: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}

export function AdminUsersTable({ users, busyUserId, onEditUser, onToggleLock, onToggleApproval, onDeleteUser }: AdminUsersTableProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">User management</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Access control table</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Username</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Approval</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isBusy = busyUserId === user.id;

              return (
                <tr key={user.id} className="border-t border-slate-200 align-top dark:border-slate-800">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-950 dark:text-white">{user.fullName}</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.userName}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isLocked ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                      {user.isLocked ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2" onClick={() => onEditUser(user)} disabled={isBusy}>
                        Edit
                      </Button>

                      <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2" onClick={() => void onToggleLock(user)} disabled={isBusy}>
                        {user.isLocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                        {isBusy && user.isLocked ? 'Unlocking...' : isBusy ? 'Locking...' : user.isLocked ? 'Unlock' : 'Lock'}
                      </Button>

                      <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2" onClick={() => void onToggleApproval(user)} disabled={isBusy}>
                        {user.isApproved ? <ShieldOff className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        {isBusy ? 'Updating...' : user.isApproved ? 'Revoke approval' : 'Approve'}
                      </Button>

                      <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2 text-rose-600 hover:text-rose-700" onClick={() => void onDeleteUser(user)} disabled={isBusy}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isBusy ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
