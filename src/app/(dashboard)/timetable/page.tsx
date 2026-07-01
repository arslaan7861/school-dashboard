"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ChevronRight,
  Search,
  School,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useClasses } from "@/features/class/hooks.class";
import { useAuthStore } from "@/store/authStore";

export default function TimetableOverviewPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const activeSessionId = useAuthStore((s) => s.activeSessionId);

  const {
    data: classes,
    isLoading,
    error,
  } = useClasses(activeSessionId ? Number(activeSessionId) : undefined, search);

  // Filter classes based on search only (session is fixed)
  const filteredClasses = classes?.data?.filter((cls: any) => {
    const matchesSearch =
      !search ||
      cls.name.toLowerCase().includes(search.toLowerCase()) ||
      cls.section.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  // Get status badge based on filled slots
  const getStatusBadge = (filledSlots: number, totalSlots: number) => {
    const percentage = (filledSlots / totalSlots) * 100;
    if (percentage === 100) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Complete
        </Badge>
      );
    } else if (percentage >= 75) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          Almost Ready
        </Badge>
      );
    } else if (percentage >= 50) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          In Progress
        </Badge>
      );
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const totalSlots = 6 * 8; // 6 days * 8 periods

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Timetable Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Loading your classes...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Timetable Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Something went wrong
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to Load Classes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Please try again later"}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show no active session
  if (!activeSessionId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Timetable Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            No active session selected
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Session</h3>
            <p className="text-sm text-muted-foreground">
              Please select an active session from the sidebar to view
              timetables
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Timetable Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and view timetables for all classes in the current session
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search classes by name or section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses?.map((cls: any) => {
          // This would come from your timetable data in real implementation
          const filledSlots = Math.floor(Math.random() * totalSlots); // Placeholder

          return (
            <Card
              key={cls.id}
              className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-primary"
              onClick={() => router.push(`/timetable/${cls.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {cls.name}-{cls.section}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Class {cls.name} • Section {cls.section}
                    </CardDescription>
                  </div>
                  <School className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/30 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Filled Slots</span>
                    </div>
                    <span className="font-medium">
                      {filledSlots}/{totalSlots}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Class Teacher</span>
                    </div>
                    <span className="font-medium truncate max-w-[150px]">
                      {cls.classTeacher?.name || "Not Assigned"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Completion</span>
                      <span>
                        {Math.round((filledSlots / totalSlots) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(filledSlots / totalSlots) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Status
                    </span>
                    {getStatusBadge(filledSlots, totalSlots)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 bg-muted/5">
                <Button variant="ghost" className="w-full gap-2">
                  Manage Timetable
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {filteredClasses?.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Classes Found</h3>
                <p className="text-sm text-muted-foreground">
                  {search
                    ? "No classes match your search criteria"
                    : "No classes available in the current session"}
                </p>
                {search && (
                  <Button
                    variant="link"
                    onClick={() => setSearch("")}
                    className="mt-2"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
