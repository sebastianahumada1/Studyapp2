import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { ErrorsContent } from '@/components/errors/ErrorsContent';

export default async function ErrorsPage() {
  await requireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-hidden relative bg-background-dark">
        <ErrorsContent />
      </main>
    </div>
  );
}
