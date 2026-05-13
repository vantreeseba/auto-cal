import { graphql } from '@/__generated__/index.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RouteError } from '@/components/ui/route-error';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Calendar, Check, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { useState } from 'react';

const GET_PROFILE = graphql(`
  query GetProfileForSettings {
    myProfile {
      id
      icalSecret
    }
  }
`);

const REGENERATE_ICAL_SECRET = graphql(`
  mutation RegenerateIcalSecret {
    myRegenerateIcalSecret
  }
`);

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
});

function ICalCard({ icalSecret }: { icalSecret: string }) {
  const feedUrl = `${window.location.origin}/ical?secret=${icalSecret}`;
  const [copied, setCopied] = useState(false);

  const [regenerate, { loading: regenerating }] = useMutation(
    REGENERATE_ICAL_SECRET,
    { refetchQueries: ['GetProfileForSettings'] },
  );

  function handleCopy() {
    navigator.clipboard.writeText(feedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleRegenerate() {
    regenerate();
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            title="Regenerate secret"
          >
            <RefreshCw
              className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Treat this URL like a password — regenerate if shared accidentally.
        </p>
      </CardContent>
    </Card>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const { data } = useQuery(GET_PROFILE);
  const icalSecret = data?.myProfile?.icalSecret as string | undefined;

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

      {icalSecret && <ICalCard icalSecret={icalSecret} />}
    </div>
  );
}
