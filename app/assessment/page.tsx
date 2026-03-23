import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { AssessmentContent } from '@/components/assessment/AssessmentContent';

export default async function AssessmentPage() {
  const user = await requireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative bg-background-dark bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-background-dark to-background-dark">
        <AssessmentContent />
      </main>
    </div>
  );
}
