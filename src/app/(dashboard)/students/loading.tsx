import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function StudentsLoading() {
  return (
    <div className="h-full w-full space-y-6 py-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b -mx-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <Skeleton className="h-10 flex-1 max-w-xs ml-auto" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-[160px]" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="w-full">
              <div className="bg-muted/50 p-4 border-b flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
