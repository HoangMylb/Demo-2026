import { useEffect, useState } from 'react';
import { AdminStateCard } from '../components/admin/admin-state-card';
import { Button } from '../components/ui/button';
import { deleteAdminUser, getAdminUsers, getCurrentSession, updateAdminUserAccess } from '../lib/admin-api';
import { AdminUsersPage } from './admin-users-page';
import type { AdminSession, AdminUser } from '../types/admin';

export function AdminUsersRoute() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const userItems = await getAdminUsers();
      setUsers(userItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    void getCurrentSession().then(setSession);
  }, []);

  const refreshUsers = async () => {
    await loadUsers();
  };

  const handleToggleLock = async (user: AdminUser): Promise<{ message: string }> => {
    setBusyUserId(user.id);

    try {
      const result = await updateAdminUserAccess(user.id, { isLocked: !user.isLocked });
      await refreshUsers();
      return result;
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleApproval = async (user: AdminUser): Promise<{ message: string }> => {
    setBusyUserId(user.id);

    try {
      const result = await updateAdminUserAccess(user.id, { isApproved: !user.isApproved });
      await refreshUsers();
      return result;
    } finally {
      setBusyUserId(null);
    }
  };

  const handleUpdateUser = async (user: AdminUser, payload: { fullName: string; userName: string; email: string; role: 'Admin' | 'User' }): Promise<{ message: string }> => {
    setBusyUserId(user.id);

    try {
      const result = await updateAdminUserAccess(user.id, payload);
      await refreshUsers();
      return result;
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser): Promise<{ message: string }> => {
    setBusyUserId(user.id);

    try {
      const result = await deleteAdminUser(user.id);
      await refreshUsers();
      return result;
    } finally {
      setBusyUserId(null);
    }
  };

  if (loading && users.length === 0) {
    return <AdminStateCard title="Loading users" description="Fetching user accounts and access states for the admin table." />;
  }

  if (error && users.length === 0) {
    return (
      <AdminStateCard
        title="Unable to load users"
        description={error}
        action={
          <Button type="button" variant="secondary" onClick={() => void loadUsers()}>
            Retry user load
          </Button>
        }
      />
    );
  }

  return <AdminUsersPage session={session} users={users} busyUserId={busyUserId} onUpdateUser={handleUpdateUser} onToggleLock={handleToggleLock} onToggleApproval={handleToggleApproval} onDeleteUser={handleDeleteUser} />;
}
