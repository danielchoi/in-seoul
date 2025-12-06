import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function QnaListLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-9 w-24 mb-8" />

      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
