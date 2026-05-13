import { ApiKeyManager } from '@/components/domain/settings/ApiKeyManager';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RouteError } from '@/components/ui/route-error';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Calendar, Check, Copy, Wand2 } from 'lucide-react';
import { useState } from 'react';

type ProfileQuery = { myProfile: { id: string } };

const GET_PROFILE = gql`
  query GetProfileForSettings {
    myProfile {
      id
    }
  }
`;

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
});

function ICalCard({ userId }: { userId: string }) {
  const feedUrl = `${window.location.origin}/ical?userId=${userId}`;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(feedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          iCal Feed
        </CardTitle>
        <CardDescription>
          Subscribe to your schedule in any calendar app (Google Calendar, Apple
          Calendar, Home Assistant, etc.). The feed includes the current and
          next week's scheduled todos and habits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs font-mono">
            {feedUrl}
          </code>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          This URL is public — anyone with the link can view your schedule.
          Treat it like a password.
        </p>
      </CardContent>
    </Card>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const { data } = useQuery<ProfileQuery>(GET_PROFILE);
  const userId = data?.myProfile?.id as string | undefined;

  function handleRunWizard() {
    localStorage.removeItem('onboarding_done');
    navigate({ to: '/onboarding', search: { step: 1, force: true } });
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-4">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Setup wizard</CardTitle>
          <CardDescription>
            Re-run the onboarding wizard to add activity types, time blocks,
            habits, or todos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRunWizard}>
            <Wand2 className="mr-2 h-4 w-4" />
            Run setup wizard
          </Button>
        </CardContent>
      </Card>

      {userId && <ICalCard userId={userId} />}

      <ApiKeyManager />
    </div>
  );
}
