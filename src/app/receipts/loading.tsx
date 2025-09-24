import Page from '~/components/Page';
import { Skeleton } from '~/components/ui/skeleton';

export default function ReceiptsLoading() {
  return (
    <Page className="gap-4 flex flex-col mt-4">
      <Skeleton className="w-full h-[36px]" />
      <Skeleton className="w-full h-[40px]" />

      <div className="flex flex-col gap-4">
        <Skeleton className="w-full h-[90px]" />
        <Skeleton className="w-full h-[90px]" />
        <Skeleton className="w-full h-[90px]" />
        <Skeleton className="w-full h-[90px]" />
      </div>
    </Page>
  );
}
