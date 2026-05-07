import { SkeletonHomePage } from '@/components/server/skeletons/SkeletonHome';

export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <main className="pt-20 md:pt-28 pb-24 md:pb-8">
        <SkeletonHomePage />
      </main>
    </div>
  );
}
