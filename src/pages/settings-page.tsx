import { CheckCircleOutlined, LockOutlined, MailOutlined, SaveOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Form, Input, Row, Space, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../lib/admin-api';
import type { AdminSession, Profile } from '../types/admin';

interface SettingsPageProps {
  session: AdminSession | null;
}

export function SettingsPage({ session }: SettingsPageProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ fullName: string; userName: string; email: string; phoneNumber: string; address: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.isAuthenticated) {
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await getProfile();
        setProfile(response);
        form.setFieldsValue({
          fullName: response.fullName,
          userName: response.userName,
          email: response.email,
          phoneNumber: response.phoneNumber,
          address: response.address,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [form, session?.isAuthenticated]);

  if (!session?.isAuthenticated) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return (
      <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Update profile
        </Typography.Title>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={async (values) => {
                  setSaving(true);
                  setError(null);

                  try {
                    const result = await updateProfile(values);
                    setProfile(result.data);
                    form.setFieldsValue({
                      fullName: result.data.fullName,
                      userName: result.data.userName,
                      email: result.data.email,
                      phoneNumber: result.data.phoneNumber,
                      address: result.data.address,
                    });
                    message.success(result.message);
                  } catch (submitError) {
                    setError(submitError instanceof Error ? submitError.message : 'Unable to update profile.');
                    message.error(submitError instanceof Error ? submitError.message : 'Unable to update profile.');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="fullName" label="Full name" rules={[{ required: true, message: 'Please enter your full name.' }]}>
                      <Input prefix={<UserOutlined />} size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="userName" label="Username" rules={[{ required: true, message: 'Please enter your username.' }]}>
                      <Input prefix={<UserOutlined />} size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email.' }, { type: 'email', message: 'Please enter a valid email.' }]}>
                  <Input prefix={<MailOutlined />} size="large" />
                </Form.Item>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="phoneNumber" label="Phone number" rules={[{ required: true, message: 'Please enter your phone number.' }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please enter your address.' }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                {error ? <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} /> : null}

                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                  Save profile
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
              <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
            <Space orientation="vertical" size={10}>
                  <Tag icon={<SafetyOutlined />} color="blue">Role</Tag>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {profile?.role ?? session.role ?? 'Unknown'}
                  </Typography.Title>
                </Space>
              </Card>

              <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
            <Space orientation="vertical" size={10}>
                  <Tag icon={<CheckCircleOutlined />} color={profile?.isApproved ? 'green' : 'gold'}>
                    Approval
                  </Tag>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {profile?.isApproved ? 'Approved' : 'Pending'}
                  </Typography.Title>
                </Space>
              </Card>

              <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
            <Space orientation="vertical" size={10}>
                  <Tag icon={<LockOutlined />} color={profile?.isLocked ? 'red' : 'blue'}>
                    Status
                  </Tag>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {profile?.isLocked ? 'Locked' : 'Active'}
                  </Typography.Title>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Spin>
    </Space>
  );
}
