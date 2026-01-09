import Page from '~/components/Page/Page';
import { Skeleton } from '~/components/ui/skeleton';

export default function SalesLoading() {
  return (
    <Page>
      <Skeleton className="w-full h-[300px]" />
    </Page>
  );
}
