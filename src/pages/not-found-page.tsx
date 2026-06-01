import { useNavigate } from 'react-router-dom';
import { ErrorShowcase } from '../components/feedback/error-showcase';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <ErrorShowcase
      eyebrow="404 error"
      accentLabel="Route unavailable"
      title="The page you are looking for does not exist"
      description="The link may be outdated, incorrect, or the page may have been removed. You can return to the homepage and continue using the app."
      highlights={['Check the route', 'Return to a known page', 'Resume shopping quickly']}
      onGoHome={() => navigate('/')}
      onGoBack={() => navigate(-1)}
      variant="not-found"
    />
  );
}
