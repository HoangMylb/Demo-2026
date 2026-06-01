import type { AdminUser } from '../types/admin';
import { AdminUsersTable } from '../components/admin/admin-users-table';

interface AdminUsersPageProps {
  users: AdminUser[];
  onUpdateUser: (user: AdminUser, payload: { fullName: string; userName: string; email: string; role: 'Admin' | 'User' }) => Promise<void>;
  onToggleLock: (user: AdminUser) => Promise<void>;
  onToggleApproval: (user: AdminUser) => Promise<void>;
  onDeleteUser: (user: AdminUser) => Promise<void>;
}

export function AdminUsersPage({ users, onUpdateUser, onToggleLock, onToggleApproval, onDeleteUser }: AdminUsersPageProps) {
  return <AdminUsersTable users={users} onUpdateUser={onUpdateUser} onToggleLock={onToggleLock} onToggleApproval={onToggleApproval} onDeleteUser={onDeleteUser} />;
}
