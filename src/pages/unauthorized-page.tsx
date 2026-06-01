import { useNavigate } from 'react-router-dom';
import { ErrorShowcase } from '../components/feedback/error-showcase';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <ErrorShowcase
      eyebrow="403 error"
      accentLabel="Access restricted"
      title="You do not have permission to view this page"
      description="This area is restricted based on your current role or account access. If you believe this is incorrect, sign in with the right account or return to the storefront."
      highlights={['Role-based access', 'Protected admin routes', 'Safe route recovery']}
      onGoHome={() => navigate('/')}
      onGoBack={() => navigate(-1)}
      homeLabel="Return to storefront"
      variant="unauthorized"
    />
  );
}
