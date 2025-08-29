import * as React from 'react';

function Page({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4 flex flex-col flex-1 h-full gap-4">
        {children}
      </div>
    </main>
  );
}

export default Page;
