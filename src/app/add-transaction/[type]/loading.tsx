import Page from '~/components/Page/Page';
import { Skeleton } from '~/components/ui/skeleton';

export default function Loading() {
  return (
    <Page className="gap-4 flex flex-col mt-4">
      <Skeleton className="w-full h-[32px]" />
      <Skeleton className="w-full h-[355px]" />
    </Page>
  );
}
