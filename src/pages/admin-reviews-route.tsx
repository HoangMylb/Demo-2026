import { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { deleteAdminReview, getAdminReviews } from '../lib/admin-api';
import { AdminReviewsPage } from './admin-reviews-page';
import type { AdminReview } from '../types/admin';

export function AdminReviewsRoute() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const reviewItems = await getAdminReviews();
      setReviews(reviewItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const handleDeleteReview = async (reviewId: number): Promise<{ message: string }> => {
    setDeletingReviewId(reviewId);

    try {
      const result = await deleteAdminReview(reviewId);
      await loadReviews();
      return result;
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading && reviews.length === 0) {
    return <Spin size="large" fullscreen description="Fetching storefront reviews for moderation." />;
  }

  if (error && reviews.length === 0) {
    return (
      <Result
        status="error"
        title="Unable to load reviews"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => void loadReviews()}>
            Retry review load
          </Button>
        }
      />
    );
  }

  return <AdminReviewsPage reviews={reviews} deletingReviewId={deletingReviewId} onDeleteReview={handleDeleteReview} />;
}
