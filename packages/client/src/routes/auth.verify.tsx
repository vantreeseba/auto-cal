import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/auth/verify')({
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) { setError('No token found in URL'); return; }

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          navigate({ to: '/dashboard' });
        } else {
          setError(data.error ?? 'Verification failed');
        }
      })
      .catch(() => setError('Network error'));
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <a href="/login" className="mt-2 block text-sm underline">Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}
