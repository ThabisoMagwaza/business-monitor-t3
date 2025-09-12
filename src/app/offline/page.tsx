export const dynamic = 'force-dynamic';

export default function OfflinePage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          You are offline
        </h1>
        <p className="mt-2 text-gray-600">
          Please check your internet connection. Some features may be
          unavailable.
        </p>
      </div>
    </main>
  );
}
