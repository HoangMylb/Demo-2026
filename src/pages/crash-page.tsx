import { useNavigate } from 'react-router-dom';
import { ErrorShowcase } from '../components/feedback/error-showcase';

interface CrashPageProps {
  onRetry?: () => void;
}

export function CrashPage({ onRetry }: CrashPageProps) {
  const navigate = useNavigate();

  return (
    <ErrorShowcase
      eyebrow="Application error"
      accentLabel="Unexpected issue"
      title="Something went wrong while loading this page"
      description="The application hit an unexpected problem and could not finish rendering this experience. You can go back home, return to the previous page, or retry the last screen."
      highlights={['Crash-safe fallback', 'Clear recovery actions', 'Storefront continuity']}
      onGoHome={() => navigate('/')}
      onGoBack={onRetry ?? (() => navigate(-1))}
      backLabel={onRetry ? 'Try again' : 'Go back'}
      variant="crash"
    />
  );
}
