import { PageSkeleton } from "@/components/shared/loading-skeleton";

export default function RootLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageSkeleton />
    </div>
  );
}
