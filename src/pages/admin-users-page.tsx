import { DeleteOutlined, EditOutlined, EllipsisOutlined, LockOutlined, PlusOutlined, SafetyOutlined, UnlockOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Card, Divider, Dropdown, Input, Form, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { AdminSession, AdminUser, CreateAdminUserPayload } from '../types/admin';

interface AdminUsersPageProps {
  session: AdminSession | null;
  users: AdminUser[];
  busyUserId: number | null;
  creatingUser: boolean;
  onCreateUser: (payload: CreateAdminUserPayload) => Promise<{ message: string }>;
  onUpdateUser: (user: AdminUser, payload: { fullName: string; userName: string; email: string; role: 'Admin' | 'User' }) => Promise<{ message: string }>;
  onToggleLock: (user: AdminUser) => Promise<{ message: string }>;
  onToggleApproval: (user: AdminUser) => Promise<{ message: string }>;
  onDeleteUser: (user: AdminUser) => Promise<{ message: string }>;
}

export function AdminUsersPage({ session, users, busyUserId, creatingUser, onCreateUser, onUpdateUser, onToggleLock, onToggleApproval, onDeleteUser }: AdminUsersPageProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ fullName: string; userName: string; email: string; role: 'Admin' | 'User' }>();
  const [createForm] = Form.useForm<CreateAdminUserPayload>();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'User'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Locked'>('all');

  useEffect(() => {
    if (!editingUser) {
      return;
    }

    form.setFieldsValue({
      fullName: editingUser.fullName,
      userName: editingUser.userName,
      email: editingUser.email,
      role: editingUser.role === 'Admin' ? 'Admin' : 'User',
    });
  }, [editingUser, form]);

  useEffect(() => {
    if (!createOpen) {
      return;
    }

    createForm.setFieldsValue({
      fullName: '',
      userName: '',
      email: '',
      password: '',
      role: 'User',
    });
  }, [createForm, createOpen]);

  const filteredUsers = useMemo(() => {
    const query = nameFilter.trim().toLowerCase();

    return users.filter((user) => {
      const matchesName =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.userName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const derivedStatus = user.isLocked ? 'Locked' : 'Active';
      const matchesStatus = statusFilter === 'all' || derivedStatus === statusFilter;

      return matchesName && matchesRole && matchesStatus;
    });
  }, [nameFilter, roleFilter, statusFilter, users]);

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'User',
      key: 'user',
      render: (_, user) => (
          <Space orientation="vertical" size={2}>
          <Typography.Text strong>{user.fullName}</Typography.Text>
          <Typography.Text type="secondary">{user.email}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (value: string) => (
        <Tag className={value === 'Admin' ? 'admin-tag admin-tag--admin' : 'admin-tag admin-tag--user'} bordered={false}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Approval',
      dataIndex: 'isApproved',
      key: 'isApproved',
      render: (value: boolean) => <Tag color={value ? 'green' : 'gold'}>{value ? 'Approved' : 'Pending'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'isLocked',
      key: 'isLocked',
      render: (value: boolean) => <Tag color={value ? 'red' : 'blue'}>{value ? 'Locked' : 'Active'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => {
        const isBusy = busyUserId === user.id;

        return (
          <Space wrap>
            <Button icon={<EditOutlined />} disabled={isBusy} onClick={() => setEditingUser(user)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete user"
              description={`Delete ${user.fullName} and permanently remove the account.`}
              okText="Delete"
              cancelText="Cancel"
              onConfirm={async () => {
                try {
                  const result = await onDeleteUser(user);
                  message.success(result.message);
                } catch (error) {
                  message.error(error instanceof Error ? error.message : 'Unable to delete the user right now.');
                }
              }}
            >
              <Button danger icon={<DeleteOutlined />} loading={isBusy}>
                Delete
              </Button>
            </Popconfirm>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'toggle-lock',
                    icon: user.isLocked ? <UnlockOutlined /> : <LockOutlined />,
                    label: user.isLocked ? 'Unlock' : 'Lock',
                    onClick: () => {
                      void onToggleLock(user)
                        .then((result) => message.success(result.message))
                        .catch((error) => message.error(error instanceof Error ? error.message : 'Unable to update this user right now.'));
                    },
                  },
                  {
                    key: 'toggle-approval',
                    icon: <SafetyOutlined />,
                    label: user.isApproved ? 'Revoke approval' : 'Approve',
                    onClick: () => {
                      void onToggleApproval(user)
                        .then((result) => message.success(result.message))
                        .catch((error) => message.error(error instanceof Error ? error.message : 'Unable to update this user right now.'));
                    },
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button icon={<EllipsisOutlined />} aria-label="More user actions" />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                User management
              </Typography.Title>
            </div>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Create user
            </Button>
          </Space>
        </Card>

        <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
          <Space size={12} wrap style={{ marginBottom: 20, width: '100%' }}>
            <Input.Search
              allowClear
              placeholder="Search users"
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              style={{ flex: '1 1 280px', minWidth: 240 }}
            />
            <Select
              value={roleFilter}
              style={{ minWidth: 140 }}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'All roles' },
                { value: 'Admin', label: 'Admin' },
                { value: 'User', label: 'User' },
              ]}
            />
            <Select
              value={statusFilter}
              style={{ minWidth: 140 }}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All status' },
                { value: 'Active', label: 'Active' },
                { value: 'Locked', label: 'Locked' },
              ]}
            />
          </Space>
          <Table<AdminUser>
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
            pagination={{ pageSize: 6, showSizeChanger: false }}
            scroll={{ x: 1100 }}
          />
        </Card>
      </Space>

      <Modal
        open={createOpen}
        title="Create user account"
        styles={{ body: { paddingTop: 12 } }}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={() => void createForm.submit()}
        confirmLoading={creatingUser}
        okText="Create user"
        destroyOnClose
        >
          <Form
            form={createForm}
            layout="vertical"
          onFinish={async (values) => {
            try {
              const normalizedPayload: CreateAdminUserPayload = {
                ...values,
                fullName: values.fullName.trim(),
                userName: values.userName.trim(),
                email: values.email.trim(),
                password: values.password.trim(),
              };

              const result = await onCreateUser(normalizedPayload);
              message.success(result.message);
              setCreateOpen(false);
              createForm.resetFields();
            } catch (error) {
              message.error(error instanceof Error ? error.message : 'Unable to create the user right now.');
            }
          }}
        >
          <Divider style={{ marginTop: 0 }} />

          <Form.Item name="fullName" label="Full name" rules={[{ required: true, message: 'Please enter the full name.' }]}>
            <Input prefix={<UserOutlined />} placeholder="Avery Morgan" />
          </Form.Item>
          <Form.Item name="userName" label="Username" rules={[{ required: true, message: 'Please enter the username.' }]}>
            <Input placeholder="avery.morgan" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter the email.' }, { type: 'email', message: 'Please enter a valid email.' }]}>
            <Input placeholder="avery@lumastore.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter a password.' }, { min: 6, message: 'Password must be at least 6 characters long.' }]}>
            <Input.Password placeholder="Create a secure password" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select the role.' }]}>
            <Select
              options={[
                { value: 'User', label: 'User' },
                { value: 'Admin', label: 'Admin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={Boolean(editingUser)}
        title="Edit user access"
        styles={{ body: { paddingTop: 12 } }}
        onCancel={() => setEditingUser(null)}
        onOk={() => void form.submit()}
        confirmLoading={saving}
        okText="Save changes"
        destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
          onFinish={async (values) => {
            if (!editingUser) {
              return;
            }

            setSaving(true);

            try {
              if (session?.email && editingUser.email === session.email && values.role !== 'Admin') {
                message.error('You cannot remove your own admin role.');
                return;
              }

              const result = await onUpdateUser(editingUser, values);
              message.success(result.message);
              setEditingUser(null);
            } catch (error) {
              message.error(error instanceof Error ? error.message : 'Unable to update the user right now.');
            } finally {
              setSaving(false);
            }
          }}
        >
          <Divider style={{ marginTop: 0 }} />

          <Form.Item name="fullName" label="Full name" rules={[{ required: true, message: 'Please enter the full name.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="userName" label="Username" rules={[{ required: true, message: 'Please enter the username.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter the email.' }, { type: 'email', message: 'Please enter a valid email.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select the role.' }]}>
            <Select
              options={[
                { value: 'User', label: 'User', disabled: Boolean(session?.email && editingUser?.email === session?.email) },
                { value: 'Admin', label: 'Admin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
