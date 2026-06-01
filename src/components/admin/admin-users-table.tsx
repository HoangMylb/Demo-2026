import { Lock, Save, ShieldCheck, ShieldOff, Trash2, Unlock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import type { AdminUser } from '../../types/admin';

interface AdminUsersTableProps {
  users: AdminUser[];
  onUpdateUser: (user: AdminUser, payload: { fullName: string; userName: string; email: string; role: 'Admin' | 'User' }) => Promise<void>;
  onToggleLock: (user: AdminUser) => Promise<void>;
  onToggleApproval: (user: AdminUser) => Promise<void>;
  onDeleteUser: (user: AdminUser) => Promise<void>;
}

export function AdminUsersTable({ users, onUpdateUser, onToggleLock, onToggleApproval, onDeleteUser }: AdminUsersTableProps) {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, { fullName: string; userName: string; email: string; role: 'Admin' | 'User' }>>({});

  const sortedUsers = useMemo(() => users, [users]);

  const ensureDraft = (user: AdminUser) => {
    setDrafts((current) => ({
      ...current,
      [user.id]: current[user.id] ?? {
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        role: user.role === 'Admin' ? 'Admin' : 'User',
      },
    }));
  };

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
            {sortedUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              const draft = drafts[user.id] ?? {
                fullName: user.fullName,
                userName: user.userName,
                email: user.email,
                role: user.role === 'Admin' ? 'Admin' : 'User',
              };

              return (
                <tr key={user.id} className="border-t border-slate-200 align-top dark:border-slate-800">
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={draft.fullName}
                          onChange={(event) => setDrafts((current) => ({ ...current, [user.id]: { ...draft, fullName: event.target.value } }))}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                        />
                        <input
                          value={draft.email}
                          onChange={(event) => setDrafts((current) => ({ ...current, [user.id]: { ...draft, email: event.target.value } }))}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-950 dark:text-white">{user.fullName}</p>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">{user.email}</p>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {isEditing ? (
                      <input
                        value={draft.userName}
                        onChange={(event) => setDrafts((current) => ({ ...current, [user.id]: { ...draft, userName: event.target.value } }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                      />
                    ) : (
                      user.userName
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {isEditing ? (
                      <select
                        value={draft.role}
                        onChange={(event) => setDrafts((current) => ({ ...current, [user.id]: { ...draft, role: event.target.value as 'Admin' | 'User' } }))}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
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
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            className="rounded-2xl px-4 py-2"
                            onClick={() => void onUpdateUser(user, draft).then(() => setEditingUserId(null))}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2" onClick={() => setEditingUserId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-2xl px-4 py-2"
                          onClick={() => {
                            ensureDraft(user);
                            setEditingUserId(user.id);
                          }}
                        >
                          Edit
                        </Button>
                      )}

                      <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2" onClick={() => void onToggleLock(user)}>
                        {user.isLocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                        {user.isLocked ? 'Unlock' : 'Lock'}
                      </Button>

                      <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2" onClick={() => void onToggleApproval(user)}>
                        {user.isApproved ? <ShieldOff className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        {user.isApproved ? 'Revoke approval' : 'Approve'}
                      </Button>

                      <Button type="button" variant="ghost" className="rounded-2xl px-4 py-2 text-rose-600 hover:text-rose-700" onClick={() => void onDeleteUser(user)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
