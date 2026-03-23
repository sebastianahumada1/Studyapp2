import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { QuestionsContent } from '@/components/questions/QuestionsContent';

export default async function QuestionsPage() {
  await requireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-hidden relative bg-background-dark">
        <QuestionsContent />
      </main>
    </div>
  );
}
