import { DeleteOutlined } from '@ant-design/icons';
import { App, Button, Card, Input, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useMemo, useState } from 'react';
import type { AdminReview } from '../types/admin';

interface AdminReviewsPageProps {
  reviews: AdminReview[];
  deletingReviewId: number | null;
  onDeleteReview: (reviewId: number) => Promise<{ message: string }>;
}

export function AdminReviewsPage({ reviews, deletingReviewId, onDeleteReview }: AdminReviewsPageProps) {
  const { message } = App.useApp();
  const [searchValue, setSearchValue] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [helpfulFilter, setHelpfulFilter] = useState<'all' | '0' | '1-4' | '5+'>('all');

  const productOptions = useMemo(() => {
    const uniqueProducts = Array.from(new Set(reviews.map((review) => review.productName))).sort((left, right) => left.localeCompare(right));
    return uniqueProducts.map((productName) => ({ label: productName, value: productName }));
  }, [reviews]);

  const [productFilter, setProductFilter] = useState<string | undefined>(undefined);

  const filteredReviews = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        review.customerName.toLowerCase().includes(query) ||
        review.productName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query);

      const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter);
      const matchesProduct = !productFilter || review.productName === productFilter;
      const matchesHelpful =
        helpfulFilter === 'all' ||
        (helpfulFilter === '0' && review.helpfulCount === 0) ||
        (helpfulFilter === '1-4' && review.helpfulCount >= 1 && review.helpfulCount <= 4) ||
        (helpfulFilter === '5+' && review.helpfulCount >= 5);

      return matchesSearch && matchesRating && matchesProduct && matchesHelpful;
    });
  }, [helpfulFilter, productFilter, ratingFilter, reviews, searchValue]);

  const columns: ColumnsType<AdminReview> = [
    {
      title: 'Review',
      key: 'review',
      render: (_, review) => (
          <Space orientation="vertical" size={4}>
          <Typography.Text strong>{review.customerName}</Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 2 }}>
            {review.comment}
          </Typography.Paragraph>
        </Space>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_, review) => (
            <Space orientation="vertical" size={2}>
          <Typography.Text strong>{review.productName}</Typography.Text>
          <Typography.Text type="secondary">{review.categoryName}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (value: number) => <Tag color="gold">{value} stars</Tag>,
    },
    {
      title: 'Variant',
      key: 'variant',
      render: (_, review) => (
        <Space wrap>
          <Tag>{review.variantType}</Tag>
          <Tag>{review.color}</Tag>
          <Tag>{review.size}</Tag>
        </Space>
      ),
    },
    {
      title: 'Helpful',
      dataIndex: 'helpfulCount',
      key: 'helpfulCount',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, review) => (
        <Popconfirm
          title="Delete review"
          description="Remove this review from the storefront experience."
          okText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            try {
              const result = await onDeleteReview(review.id);
              message.success(result.message);
            } catch (error) {
              message.error(error instanceof Error ? error.message : 'Unable to delete the review right now.');
            }
          }}
        >
          <Button danger icon={<DeleteOutlined />} loading={deletingReviewId === review.id}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const handleTableChange: TableProps<AdminReview>['onChange'] = () => undefined;

  return (
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Review management
        </Typography.Title>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--shadow-soft)' }}>
        <Space size={12} wrap style={{ width: '100%', marginBottom: 20 }}>
          <Input.Search
            allowClear
            placeholder="Search reviews"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            style={{ flex: '1 1 280px', minWidth: 240 }}
          />

          <Space size={12} wrap>
            <Select
              allowClear
              placeholder="Filter by product"
              style={{ minWidth: 180 }}
              options={productOptions}
              value={productFilter}
              onChange={(value) => setProductFilter(value)}
            />
            <Select
              value={ratingFilter}
              style={{ minWidth: 140 }}
              onChange={setRatingFilter}
              options={[
                { value: 'all', label: 'All ratings' },
                { value: '5', label: '5 stars' },
                { value: '4', label: '4 stars' },
                { value: '3', label: '3 stars' },
                { value: '2', label: '2 stars' },
                { value: '1', label: '1 star' },
              ]}
            />
            <Select
              value={helpfulFilter}
              style={{ minWidth: 150 }}
              onChange={setHelpfulFilter}
              options={[
                { value: 'all', label: 'All helpful' },
                { value: '0', label: '0 helpful' },
                { value: '1-4', label: '1-4 helpful' },
                { value: '5+', label: '5+ helpful' },
              ]}
            />
          </Space>
        </Space>

        <Table<AdminReview>
          rowKey="id"
          columns={columns}
          dataSource={filteredReviews}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1200 }}
          onChange={handleTableChange}
        />
      </Card>
    </Space>
  );
}
