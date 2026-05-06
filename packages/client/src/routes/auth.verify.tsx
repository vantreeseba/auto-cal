import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

interface VerifyMagicLinkResult {
  verifyMagicLink: { token: string; userId: string };
}

const VERIFY_MAGIC_LINK = gql`
  mutation VerifyMagicLink($token: String!) {
    verifyMagicLink(token: $token) {
      token
      userId
    }
  }
`;

export const Route = createFileRoute('/auth/verify')({
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();

  const [verify, { error }] = useMutation<VerifyMagicLinkResult>(
    VERIFY_MAGIC_LINK,
    {
      onCompleted(data) {
        localStorage.setItem('auth_token', data.verifyMagicLink.token);
        navigate({ to: '/dashboard' });
      },
    },
  );

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      verify({ variables: { token } });
    }
  }, [verify]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="font-medium text-destructive">
            {error.message.includes('expired')
              ? 'This link has expired. Please request a new one.'
              : 'Invalid magic link.'}
          </p>
          <a href="/login" className="mt-2 block text-sm underline">
            Back to login
          </a>
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
