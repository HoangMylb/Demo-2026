import { DeleteOutlined, EditOutlined, LockOutlined, SafetyOutlined, UnlockOutlined } from '@ant-design/icons';
import { App, Button, Card, Divider, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { AdminSession, AdminUser } from '../types/admin';

interface AdminUsersPageProps {
  session: AdminSession | null;
  users: AdminUser[];
  busyUserId: number | null;
  onUpdateUser: (user: AdminUser, payload: { fullName: string; userName: string; email: string; role: 'Admin' | 'User' }) => Promise<{ message: string }>;
  onToggleLock: (user: AdminUser) => Promise<{ message: string }>;
  onToggleApproval: (user: AdminUser) => Promise<{ message: string }>;
  onDeleteUser: (user: AdminUser) => Promise<{ message: string }>;
}

export function AdminUsersPage({ session, users, busyUserId, onUpdateUser, onToggleLock, onToggleApproval, onDeleteUser }: AdminUsersPageProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ fullName: string; userName: string; email: string; role: 'Admin' | 'User' }>();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

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

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'User',
      key: 'user',
      render: (_, user) => (
        <Space direction="vertical" size={2}>
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
      render: (value: string) => <Tag color={value === 'Admin' ? 'purple' : 'default'}>{value}</Tag>,
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
            <Button icon={user.isLocked ? <UnlockOutlined /> : <LockOutlined />} disabled={isBusy} onClick={() => {
              void onToggleLock(user)
                .then((result) => message.success(result.message))
                .catch((error) => message.error(error instanceof Error ? error.message : 'Unable to update this user right now.'));
            }}>
              {user.isLocked ? 'Unlock' : 'Lock'}
            </Button>
            <Button icon={<SafetyOutlined />} disabled={isBusy} onClick={() => {
              void onToggleApproval(user)
                .then((result) => message.success(result.message))
                .catch((error) => message.error(error instanceof Error ? error.message : 'Unable to update this user right now.'));
            }}>
              {user.isApproved ? 'Revoke approval' : 'Approve'}
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
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              User management
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
              Familiar access-control actions with clear states and standard enterprise patterns.
            </Typography.Paragraph>
          </div>
        </Card>

        <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
          <Table<AdminUser>
            rowKey="id"
            columns={columns}
            dataSource={users}
            pagination={{ pageSize: 6, showSizeChanger: false }}
            scroll={{ x: 1100 }}
          />
        </Card>
      </Space>

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
          <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
            Keep this edit flow compact and conventional so another team can extend it without reverse-engineering custom UI behavior.
          </Typography.Paragraph>

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
