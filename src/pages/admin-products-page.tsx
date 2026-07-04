import { DeleteOutlined, EditOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Divider, Dropdown, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, Upload } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { AdminCategoryOption, AdminProduct, ProductPayload } from '../types/admin';
import { formatCurrency } from '../utils/format';

interface AdminProductsPageProps {
  products: AdminProduct[];
  categoryOptions: AdminCategoryOption[];
  isCreateOpen: boolean;
  editingProduct: AdminProduct | null;
  deletingProductId: number | null;
  onSubmitProduct: (values: ProductPayload) => Promise<{ message: string }>;
  onOpenCreate: () => void;
  onEditProduct: (product: AdminProduct) => void;
  onDeleteProduct: (productId: number) => Promise<{ message: string }>;
  onCancelEdit: () => void;
}

type ImageInputMode = 'url' | 'upload';

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Unable to read the selected image file.'));
    };

    reader.onerror = () => reject(new Error('Unable to read the selected image file.'));
    reader.readAsDataURL(file);
  });
}

export function AdminProductsPage({
  products,
  categoryOptions,
  isCreateOpen,
  editingProduct,
  deletingProductId,
  onSubmitProduct,
  onOpenCreate,
  onEditProduct,
  onDeleteProduct,
  onCancelEdit,
}: AdminProductsPageProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<ProductPayload>();
  const [submitting, setSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>('url');
  const [selectedFileName, setSelectedFileName] = useState('');

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, products, searchValue]);

  useEffect(() => {
    const initialCategoryId = categoryOptions[0]?.id ?? editingProduct?.categoryId ?? 0;
    const initialImageUrl = editingProduct?.imageUrl ?? '';

    form.setFieldsValue({
      name: editingProduct?.name ?? '',
      description: editingProduct?.description ?? '',
      price: editingProduct?.price ?? 0,
      imageUrl: initialImageUrl,
      categoryId: editingProduct?.categoryId ?? initialCategoryId,
    });

    setImageInputMode(initialImageUrl.startsWith('data:image/') ? 'upload' : 'url');
    setSelectedFileName('');
  }, [categoryOptions, editingProduct, form, isCreateOpen]);

  const imageUrlValue = Form.useWatch('imageUrl', form) ?? '';

  const handleFileChange = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    form.setFieldValue('imageUrl', dataUrl);
    setSelectedFileName(file.name);
  };

  const columns: ColumnsType<AdminProduct> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, product) => (
        <Space align="start" size="middle">
          <Image src={product.imageUrl} alt={product.name} width={56} height={56} style={{ borderRadius: 12, objectFit: 'cover' }} />
          <Space orientation="vertical" size={2}>
            <Typography.Text strong>{product.name}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }} ellipsis={{ rows: 2 }}>
              {product.description}
            </Typography.Paragraph>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAtUtc',
      key: 'updatedAtUtc',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, product) => (
        <Space wrap>
          <Button icon={<EditOutlined />} onClick={() => onEditProduct(product)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete product"
            description="Remove this product from the inventory and storefront listing."
            okText="Delete"
            cancelText="Cancel"
            onConfirm={async () => {
              try {
                const result = await onDeleteProduct(product.id);
                message.success(result.message);
              } catch (error) {
                message.error(error instanceof Error ? error.message : 'Unable to delete the product right now.');
              }
            }}
          >
            <Button danger icon={<DeleteOutlined />} loading={deletingProductId === product.id}>
              Delete
            </Button>
          </Popconfirm>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'duplicate-info',
                  label: `Category: ${product.categoryName}`,
                  disabled: true,
                },
                {
                  key: 'updated-info',
                  label: `Updated: ${new Date(product.updatedAtUtc).toLocaleDateString()}`,
                  disabled: true,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button icon={<EllipsisOutlined />} aria-label="More product actions" />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Product management
              </Typography.Title>
            </div>

            <Button type="primary" icon={<PlusOutlined />} onClick={onOpenCreate}>
              Add product
            </Button>
          </Space>

          <Divider style={{ margin: '16px 0' }} />

          <Space size={12} wrap style={{ width: '100%' }}>
            <Input.Search
              allowClear
              placeholder="Search products"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              style={{ flex: '1 1 280px', minWidth: 240 }}
            />
            <Select
              value={categoryFilter}
              style={{ minWidth: 180 }}
              onChange={setCategoryFilter}
              options={[
                { value: 'all', label: 'All categories' },
                ...categoryOptions.map((category) => ({ value: category.id, label: category.name })),
              ]}
            />
          </Space>
        </Card>

        <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
          <Table<AdminProduct>
            rowKey="id"
            columns={columns}
            dataSource={filteredProducts}
            pagination={{ pageSize: 6, showSizeChanger: false }}
            scroll={{ x: 960 }}
          />
        </Card>
      </Space>

      <Modal
        open={isCreateOpen || Boolean(editingProduct)}
        title={editingProduct ? 'Edit product' : 'Add a new product'}
        styles={{ body: { paddingTop: 12 } }}
        onCancel={onCancelEdit}
        onOk={() => void form.submit()}
        okText={editingProduct ? 'Update product' : 'Create product'}
        confirmLoading={submitting}
        destroyOnClose
        width={720}
        >
          <Form
            form={form}
            layout="vertical"
          onFinish={async (values) => {
            setSubmitting(true);

            try {
              const result = await onSubmitProduct(values);
              message.success(result.message);
            } catch (error) {
              message.error(error instanceof Error ? error.message : 'Unable to save the product right now.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Form.Item name="name" label="Product name" rules={[{ required: true, message: 'Please enter the product name.' }]}>
            <Input placeholder="Wireless Bluetooth Headphones" />
          </Form.Item>

          <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: 'Please select a category.' }]}>
            <Select
              options={categoryOptions.map((category) => ({ value: category.id, label: category.name }))}
              placeholder="Select category"
            />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter the description.' }]}>
            <Input.TextArea rows={4} placeholder="Adaptive noise canceling headphones with spatial audio tuning." />
          </Form.Item>

          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please enter the product price.' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="249" />
          </Form.Item>

          <Form.Item label="Image source">
            <Select<ImageInputMode>
              value={imageInputMode}
              options={[
                { value: 'url', label: 'Image URL' },
                { value: 'upload', label: 'Upload from device' },
              ]}
              onChange={(value) => {
                setImageInputMode(value);
                if (value === 'url' && imageUrlValue.startsWith('data:image/')) {
                  form.setFieldValue('imageUrl', '');
                  setSelectedFileName('');
                }
              }}
            />
          </Form.Item>

          {imageInputMode === 'url' ? (
            <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true, message: 'Please enter the image URL.' }]}>
              <Input placeholder="https://images.unsplash.com/..." />
            </Form.Item>
          ) : (
            <Form.Item label="Upload image" required>
              <Upload
                beforeUpload={(file) => {
                  void handleFileChange(file).catch((error) => {
                    message.error(error instanceof Error ? error.message : 'Unable to read the selected image file.');
                  });
                  return false;
                }}
                maxCount={1}
                accept="image/*"
                showUploadList={false}
              >
                <Button>Choose image file</Button>
              </Upload>
              <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                {selectedFileName ? `Selected file: ${selectedFileName}` : 'The image will be converted into a stored image URL payload.'}
              </Typography.Paragraph>
            </Form.Item>
          )}

          {imageUrlValue ? (
            <Form.Item label="Preview">
              <Image src={imageUrlValue} alt="Product preview" width="100%" style={{ borderRadius: 12 }} />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
}
