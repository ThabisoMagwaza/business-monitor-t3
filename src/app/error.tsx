'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Page from '~/components/Page';
import { Button } from '~/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Page className="flex flex-col gap-4 items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
      <Button
        variant="outline"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        <RefreshCcw className="w-4 h-4 mr-2" />
        Try again
      </Button>
    </Page>
  );
}
