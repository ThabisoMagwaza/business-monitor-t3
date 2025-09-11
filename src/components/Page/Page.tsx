import { cn } from '~/lib/utils';

function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={'flex-1'}>
      <div
        className={cn(
          'max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4 flex-1 h-full',
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}

export default Page;
