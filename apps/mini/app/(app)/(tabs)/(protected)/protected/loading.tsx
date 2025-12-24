import { Skeleton } from "@mint-up/ui/components/skeleton";

export default function ProtectedPageLoading() {
  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
