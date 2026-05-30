import { useEffect, useState } from 'react';
import { AdminStateCard } from '../components/admin/admin-state-card';
import { Button } from '../components/ui/button';
import { getAdminUsers, updateAdminUserAccess } from '../lib/admin-api';
import { AdminUsersPage } from './admin-users-page';
import type { AdminUser } from '../types/admin';

export function AdminUsersRoute() {
  const [users, setUsers] = useState<AdminUser[]>([]);
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
  }, []);

  const refreshUsers = async () => {
    await loadUsers();
  };

  const handleToggleLock = async (user: AdminUser) => {
    await updateAdminUserAccess(user.id, { isLocked: !user.isLocked });
    await refreshUsers();
  };

  const handleToggleApproval = async (user: AdminUser) => {
    await updateAdminUserAccess(user.id, { isApproved: !user.isApproved });
    await refreshUsers();
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

  return <AdminUsersPage users={users} onToggleLock={handleToggleLock} onToggleApproval={handleToggleApproval} />;
}
