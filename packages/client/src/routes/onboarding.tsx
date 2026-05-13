import { graphql } from '@/__generated__/index.js';
import { StepActivityTypes } from '@/components/domain/onboarding/StepActivityTypes';
import { StepHabits } from '@/components/domain/onboarding/StepHabits';
import { StepTimeBlocks } from '@/components/domain/onboarding/StepTimeBlocks';
import { StepTodos } from '@/components/domain/onboarding/StepTodos';
import { Button } from '@/components/ui/button';
import { RouteError } from '@/components/ui/route-error';
import { cn } from '@/lib/utils';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Check, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { z } from 'zod';

// Only used to detect if the user is already onboarded (has activity types)
const CHECK_ONBOARDED = graphql(`
  query CheckOnboarded {
    myActivityTypes {
      id
    }
  }
`);

const STEPS = [
  { label: 'Activity Types' },
  { label: 'Time Blocks' },
  { label: 'Habits' },
  { label: 'Todos' },
] as const;

export const Route = createFileRoute('/onboarding')({
  validateSearch: z.object({
    step: z.number().int().min(1).max(4).catch(1),
    // force=true skips the "already set up" redirect, used when re-running from settings
    force: z.boolean().catch(false),
  }),
  component: OnboardingPage,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
});

function OnboardingPage() {
  const { step, force } = Route.useSearch();
  const navigate = useNavigate({ from: '/onboarding' });
  const checked = useRef(false);

  // On first load only (and only when not forced): if the user already has
  // activity types they're set up — redirect to dashboard and mark done.
  const { data, loading } = useQuery(CHECK_ONBOARDED, {
    skip: step > 1 || force,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (checked.current || loading || step > 1 || force) return;
    if (data && data.myActivityTypes.length > 0) {
      checked.current = true;
      localStorage.setItem('onboarding_done', '1');
      navigate({ to: '/dashboard' });
    }
  }, [data, loading, step, force, navigate]);

  function goToStep(s: number) {
    navigate({ search: { step: s } });
  }

  function handleFinish() {
    localStorage.setItem('onboarding_done', '1');
    navigate({ to: '/dashboard' });
  }

  function handleSkipAll() {
    localStorage.setItem('onboarding_done', '1');
    navigate({ to: '/dashboard' });
  }

  // Show spinner only on initial check
  if (step === 1 && loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">Checking setup…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome to Auto Cal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Let's get your schedule set up — takes about 2 minutes.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipAll}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Skip setup
          </Button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    i + 1 === step
                      ? 'bg-primary text-primary-foreground'
                      : i + 1 < step
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i + 1 < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    'hidden text-sm sm:block',
                    i + 1 === step
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-3 h-px flex-1',
                    i + 1 < step ? 'bg-primary/40' : 'bg-muted',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 1 && <StepActivityTypes onNext={() => goToStep(2)} />}
        {step === 2 && (
          <StepTimeBlocks
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
          />
        )}
        {step === 3 && (
          <StepHabits
            onBack={() => goToStep(2)}
            onNext={() => goToStep(4)}
            onSkip={() => goToStep(4)}
          />
        )}
        {step === 4 && (
          <StepTodos
            onBack={() => goToStep(3)}
            onFinish={handleFinish}
            onSkip={handleFinish}
          />
        )}

        {/* Step counter */}
        <p className="text-center text-xs text-muted-foreground">
          Step {step} of {STEPS.length}
          {step > 2 && ' · optional from here'}
        </p>
      </div>
    </div>
  );
}
