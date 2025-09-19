
import Navigation from '@/components/Navigation';

export const ActivityFormLoading = () => {
  return (
    <>
      <Navigation />
      <main className="container py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-lg text-muted-foreground">Loading activity form...</p>
          </div>
        </div>
      </main>
    </>
  );
};
