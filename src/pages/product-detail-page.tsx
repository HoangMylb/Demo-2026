import { Alert, App, Button, Form, Input, Modal, Popconfirm, Rate, Select, Space, Tag, Typography } from 'antd';
import { motion } from 'framer-motion';
import { EditOutlined, LikeOutlined, DeleteOutlined } from '@ant-design/icons';
import { ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/product/product-card';
import { createStorefrontProductReview, deleteStorefrontProductReview, toggleStorefrontReviewHelpful, updateStorefrontProductReview } from '../lib/storefront-api';
import type { AdminSession } from '../types/admin';
import type { CreateProductReviewPayload, ProductDetail, ProductReview, ProductType } from '../types/product';
import { formatCurrency } from '../utils/format';

type ReviewSortOption = 'newest' | 'helpful' | 'rating';
type ReviewRatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';

interface ProductDetailPageProps {
  product: ProductDetail | null;
  onAddToCart: (product: ProductType) => void;
  onViewDetails?: (product: ProductType) => void;
  session?: AdminSession | null;
  onReviewCreated?: () => Promise<void> | void;
}

export function ProductDetailPage({ product, onAddToCart, onViewDetails, session, onReviewCreated }: ProductDetailPageProps) {
  const { message } = App.useApp();
  const [reviewForm] = Form.useForm<CreateProductReviewPayload>();
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter>('all');
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [localReviews, setLocalReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    setLocalReviews(product?.reviews ?? []);
  }, [product]);

  const filteredReviews = useMemo(() => {
    const reviews = ratingFilter === 'all'
      ? localReviews
      : localReviews.filter((review) => review.rating === Number(ratingFilter));

    return [...reviews].sort((left, right) => {
      if (sortBy === 'rating') {
        return right.rating - left.rating || new Date(right.createdAtUtc).getTime() - new Date(left.createdAtUtc).getTime();
      }

      if (sortBy === 'helpful') {
        return right.helpfulCount - left.helpfulCount || new Date(right.createdAtUtc).getTime() - new Date(left.createdAtUtc).getTime();
      }

      return new Date(right.createdAtUtc).getTime() - new Date(left.createdAtUtc).getTime();
    });
  }, [localReviews, ratingFilter, sortBy]);

  const ownReview = localReviews.find((review) => review.isCurrentUserReview) ?? null;
  const hasExistingReview = Boolean(ownReview);
  const canSubmitReview = Boolean(session?.isAuthenticated);

  const syncReviewList = async () => {
    await onReviewCreated?.();
  };

  const openEditReview = (review: ProductReview) => {
    setEditingReview(review);
    reviewForm.setFieldsValue({
      rating: review.rating,
      comment: review.comment,
      variantType: review.variantType,
      color: review.color,
      size: review.size,
    });
  };

  if (!product) {
    return (
      <section
        className="rounded-[2rem] border border-dashed p-10 text-center"
        style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
      >
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Product not found
        </h2>
        <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          The requested product could not be loaded from the storefront API.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-16">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="overflow-hidden rounded-[2rem] border shadow-soft"
          style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
        >
          <img src={product.image} alt={product.name} className="h-full min-h-[420px] w-full object-cover" />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
          <div className={`inline-flex rounded-full bg-gradient-to-r ${product.accent} px-4 py-2 text-sm font-semibold text-white`}>
            {product.category}
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {product.name}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1" style={{ background: 'var(--color-bg-surface-soft)' }}>
              <Star className="h-4 w-4 fill-current text-amber-400" />
              {product.rating} / 5 rating
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1" style={{ background: 'var(--color-bg-surface-soft)' }}>
              {product.reviewCount ?? 0} verified reviews
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1" style={{ background: 'var(--color-bg-surface-soft)' }}>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              2-year support
            </span>
          </div>

          <p className="mt-6 text-lg leading-8" style={{ color: 'var(--color-text-secondary)' }}>
            {product.description}
          </p>

          <div
            className="mt-8 rounded-[1.75rem] border p-6"
            style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface-soft)' }}
          >
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Price</p>
                <p className="mt-2 text-4xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(product.price)}
                </p>
              </div>
              <Button type="primary" size="large" onClick={() => onAddToCart(product)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Add to cart
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['Fast delivery', 'Arrives in 2-4 days'],
              ['Returns', '30-day easy returns'],
              ['Support', 'Live chat included'],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[1.5rem] border p-4"
                style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
              >
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em]" style={{ color: 'var(--color-brand-600)' }}>
            Customer reviews
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Feedback from previous buyers
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
            Real purchase notes, star ratings, and variant details are loaded from the backend for this specific product.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div
            className="rounded-[1.75rem] border p-6"
            style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
          >
            <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
              {ownReview ? 'Manage your review' : 'Write a review'}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
              Signed-in users can leave a real review with rating, comment, and product variant details.
            </Typography.Paragraph>

            {!canSubmitReview ? (
              <Alert
                type="info"
                showIcon
                title="Please sign in with a user account before submitting a review."
              />
            ) : hasExistingReview ? (
              <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                <Alert
                  type="success"
                  showIcon
                  title="You already reviewed this product with your current account."
                />
                <Space wrap>
                  <Button icon={<EditOutlined />} onClick={() => ownReview && openEditReview(ownReview)}>
                    Edit your review
                  </Button>
                  <Popconfirm
                    title="Delete your review"
                    description="This will permanently remove your review from the product page."
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={async () => {
                      if (!ownReview) {
                        return;
                      }

                      try {
                        await deleteStorefrontProductReview(product.id, ownReview.id);
                        message.success('Your review was deleted.');
                        await syncReviewList();
                      } catch (error) {
                        message.error(error instanceof Error ? error.message : 'Unable to delete your review right now.');
                      }
                    }}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Delete your review
                    </Button>
                  </Popconfirm>
                </Space>
              </Space>
            ) : (
              <Form
                form={reviewForm}
                layout="vertical"
                onFinish={async (values) => {
                  setSubmittingReview(true);

                  try {
                    await createStorefrontProductReview(product.id, {
                      rating: values.rating,
                      comment: values.comment.trim(),
                      variantType: values.variantType.trim(),
                      color: values.color.trim(),
                      size: values.size.trim(),
                    });

                    message.success('Your review was submitted successfully.');
                    reviewForm.resetFields();
                    await syncReviewList();
                  } catch (error) {
                    message.error(error instanceof Error ? error.message : 'Unable to submit your review right now.');
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
              >
                <Form.Item name="rating" label="Rating" rules={[{ required: true, message: 'Please select a rating.' }]}>
                  <Rate />
                </Form.Item>
                <Form.Item name="comment" label="Comment" rules={[{ required: true, message: 'Please enter your comment.' }, { min: 12, message: 'Please write at least 12 characters.' }]}>
                  <Input.TextArea rows={4} placeholder="Share what you liked, how it felt to use, and whether it matched your expectations." />
                </Form.Item>
                <Form.Item name="variantType" label="Type / Variant" rules={[{ required: true, message: 'Please enter the variant type.' }]}>
                  <Input placeholder="Wireless / Sport Edition / Desk Setup" />
                </Form.Item>
                <Space size={12} style={{ width: '100%' }} wrap>
                  <Form.Item name="color" label="Color" style={{ flex: 1, minWidth: 180 }} rules={[{ required: true, message: 'Please enter the color.' }]}>
                    <Input placeholder="Midnight Blue" />
                  </Form.Item>
                  <Form.Item name="size" label="Size" style={{ flex: 1, minWidth: 180 }} rules={[{ required: true, message: 'Please enter the size.' }]}>
                    <Input placeholder="42mm / Standard / 75%" />
                  </Form.Item>
                </Space>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="primary" htmlType="submit" loading={submittingReview}>
                    Submit review
                  </Button>
                </div>
              </Form>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Review feed
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
                  Sort by newest, helpful, or highest rating, and filter by star score.
                </Typography.Paragraph>
              </div>

              <Space size={12} wrap>
                <div>
                  <Typography.Text type="secondary">Sort</Typography.Text>
                  <Select<ReviewSortOption>
                    value={sortBy}
                    style={{ width: 160, display: 'block', marginTop: 6 }}
                    onChange={setSortBy}
                    options={[
                      { value: 'newest', label: 'Mới nhất' },
                      { value: 'helpful', label: 'Hữu ích nhất' },
                      { value: 'rating', label: 'Nhiều sao nhất' },
                    ]}
                  />
                </div>
                <div>
                  <Typography.Text type="secondary">Rating</Typography.Text>
                  <Select<ReviewRatingFilter>
                    value={ratingFilter}
                    style={{ width: 140, display: 'block', marginTop: 6 }}
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
                </div>
              </Space>
            </div>

            <div className="grid gap-5 lg:grid-cols-1">
              {filteredReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[1.75rem] border p-6 shadow-sm"
                  style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {review.customerName}
                      </h4>
                      {review.isCurrentUserReview ? <Tag color="blue" style={{ marginTop: 8, width: 'fit-content' }}>Your review</Tag> : null}
                      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Bought {review.productName} · {review.categoryName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium" style={{ background: 'var(--color-bg-surface-soft)', color: 'var(--color-text-primary)' }}>
                        <Star className="h-4 w-4 fill-current text-amber-400" />
                        {review.rating} stars
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium" style={{ background: 'var(--color-bg-surface-soft)', color: 'var(--color-text-primary)' }}>
                        {review.helpfulCount} helpful
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                    {review.comment}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
                    {[
                      `Type: ${review.variantType}`,
                      `Color: ${review.color}`,
                      `Size: ${review.size}`,
                    ].map((detail) => (
                      <span key={detail} className="rounded-full px-3 py-1" style={{ background: 'var(--color-bg-surface-soft)', color: 'var(--color-text-primary)' }}>
                        {detail}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Purchased on {new Date(review.purchasedAtUtc).toLocaleDateString()}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      icon={<LikeOutlined />}
                      type={review.hasCurrentUserMarkedHelpful ? 'primary' : 'default'}
                      disabled={!session?.isAuthenticated || review.isCurrentUserReview}
                      onClick={async () => {
                        try {
                          const response = await toggleStorefrontReviewHelpful(product.id, review.id);
                          setLocalReviews((current) =>
                            current.map((item) =>
                              item.id === response.reviewId
                                ? {
                                    ...item,
                                    helpfulCount: response.helpfulCount,
                                    hasCurrentUserMarkedHelpful: response.hasCurrentUserMarkedHelpful,
                                  }
                                : item,
                            ),
                          );
                        } catch (error) {
                          message.error(error instanceof Error ? error.message : 'Unable to update helpful vote right now.');
                        }
                      }}
                    >
                      {review.hasCurrentUserMarkedHelpful ? 'Helpful saved' : 'Helpful'}
                    </Button>

                    {review.isCurrentUserReview ? (
                      <Button icon={<EditOutlined />} onClick={() => openEditReview(review)}>
                        Edit
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em]" style={{ color: 'var(--color-brand-600)' }}>
            Related products
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            More in the same category
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
            These recommendations come from the same product category so shoppers can compare alternatives without leaving the detail flow.
          </p>
        </div>

        {product.relatedProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {product.relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onViewDetails={onViewDetails}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed p-8 text-center" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-bg-surface)' }}>
            <h4 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              No related products yet
            </h4>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              More recommendations will appear automatically when the catalog grows in this category.
            </p>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(editingReview)}
        title="Edit your review"
        onCancel={() => {
          setEditingReview(null);
          reviewForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditingReview(null);
              reviewForm.resetFields();
            }}
          >
            Cancel edit
          </Button>,
          <Button key="save" type="primary" loading={submittingReview} onClick={() => void reviewForm.submit()}>
            Save changes
          </Button>,
        ]}
        confirmLoading={submittingReview}
        destroyOnHidden
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!editingReview) {
              return;
            }

            setSubmittingReview(true);

            try {
              await updateStorefrontProductReview(product.id, editingReview.id, {
                rating: values.rating,
                comment: values.comment.trim(),
                variantType: values.variantType.trim(),
                color: values.color.trim(),
                size: values.size.trim(),
              });

              message.success('Your review was updated successfully.');
              setEditingReview(null);
              reviewForm.resetFields();
              await syncReviewList();
            } catch (error) {
              message.error(error instanceof Error ? error.message : 'Unable to update your review right now.');
            } finally {
              setSubmittingReview(false);
            }
          }}
        >
          <Form.Item name="rating" label="Rating" rules={[{ required: true, message: 'Please select a rating.' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Comment" rules={[{ required: true, message: 'Please enter your comment.' }, { min: 12, message: 'Please write at least 12 characters.' }]}> 
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="variantType" label="Type / Variant" rules={[{ required: true, message: 'Please enter the variant type.' }]}>
            <Input />
          </Form.Item>
          <Space size={12} style={{ width: '100%' }} wrap>
            <Form.Item name="color" label="Color" style={{ flex: 1, minWidth: 180 }} rules={[{ required: true, message: 'Please enter the color.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="size" label="Size" style={{ flex: 1, minWidth: 180 }} rules={[{ required: true, message: 'Please enter the size.' }]}>
              <Input />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </section>
  );
}
