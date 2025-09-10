import { Skeleton } from '~/components/ui/skeleton';

export default function Loading() {
  return (
    <main>
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 p-4 flex flex-col flex-1 h-full gap-4">
        <Skeleton className="w-full h-[32px]" />
        <Skeleton className="w-full h-[120px]" />
        <Skeleton className="w-full h-[120px]" />
        <Skeleton className="w-full h-[120px] " />
        <Skeleton className="w-full h-[120px]" />
      </div>
    </main>
  );
}
