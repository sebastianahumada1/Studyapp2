import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { HubContent } from '@/components/knowledge-hub/HubContent';

export default async function HubPage() {
  await requireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-hidden relative bg-background-dark">
        <HubContent />
      </main>
    </div>
  );
}

