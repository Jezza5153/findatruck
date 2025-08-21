import { Skeleton } from './skeleton';

export function SkeletonRow() {
  return (
    <div className="flex items-center space-x-4 py-2">
      <Skeleton className="h-12 w-12 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
