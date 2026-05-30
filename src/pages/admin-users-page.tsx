import type { AdminUser } from '../types/admin';
import { AdminUsersTable } from '../components/admin/admin-users-table';

interface AdminUsersPageProps {
  users: AdminUser[];
  onToggleLock: (user: AdminUser) => Promise<void>;
  onToggleApproval: (user: AdminUser) => Promise<void>;
}

export function AdminUsersPage({ users, onToggleLock, onToggleApproval }: AdminUsersPageProps) {
  return <AdminUsersTable users={users} onToggleLock={onToggleLock} onToggleApproval={onToggleApproval} />;
}
