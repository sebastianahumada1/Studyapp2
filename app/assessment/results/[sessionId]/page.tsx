import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { AssessmentResultsView } from '@/components/assessment/AssessmentResultsView';

export default async function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireAuth();
  const { sessionId } = await params;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-hidden relative bg-background-dark">
        <AssessmentResultsView sessionId={sessionId} />
      </main>
    </div>
  );
}
