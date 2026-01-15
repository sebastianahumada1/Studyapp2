import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { AssessmentSessionView } from '@/components/assessment/AssessmentSessionView';

export default async function AssessmentSessionPage({
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
        <AssessmentSessionView sessionId={sessionId} />
      </main>
    </div>
  );
}
