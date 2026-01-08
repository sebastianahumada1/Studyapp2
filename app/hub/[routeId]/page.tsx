import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { RouteDetailContent } from '@/components/knowledge-hub/RouteDetailContent';

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ routeId: string }>;
}) {
  await requireAuth();
  const { routeId } = await params;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
        <RouteDetailContent routeId={routeId} />
      </main>
    </div>
  );
}

