import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import { MentorContent } from '@/components/mentor/MentorContent';

export default async function MentorPage() {
  await requireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-hidden relative bg-background-dark">
        <MentorContent />
      </main>
    </div>
  );
}
