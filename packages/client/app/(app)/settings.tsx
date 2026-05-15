import { ApiKeyManager } from '@/components/domain/settings/ApiKeyManager';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { storage } from '@/storage';
import { useRouter } from 'expo-router';
import { Wand2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  function handleRunWizard() {
    storage.removeItem('onboarding_done');
    router.push('/onboarding?step=1&force=true');
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

      <ApiKeyManager />
    </div>
  );
}
