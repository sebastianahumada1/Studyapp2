import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { HubMainContent } from '@/components/knowledge-hub/HubMainContent';

export default async function HubPage() {
  await requireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative bg-background-dark bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-background-dark to-background-dark">
        <HubMainContent />
      </main>
    </div>
  );
}

