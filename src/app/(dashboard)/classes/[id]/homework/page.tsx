"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Filter,
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  RefreshCcw,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { useSubjects } from "@/features/subjects/hooks.subject";
import { useHomeworkByClass } from "@/features/homework/hooks.homework";
import { useAuthStore } from "@/store/authStore";
import { useClass } from "@/features/class/hooks.class";
import { HomeworkList } from "@/features/homework/components/list.homework";
import { CreateHomeworkDialog } from "@/features/homework/components/create.homework";
import { cn } from "@/lib/utils";

export default function ClassHomeworkPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.id);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<number | "all">("all");

  const { user, activeSessionId } = useAuthStore();

  const { data: classData, isLoading: loadingClass } = useClass(
    classId.toString(),
  );
  const { data: subjectsData, isLoading: loadingSubjects } =
    useSubjects(classId);
  const {
    data: homeworkData,
    isLoading: loadingHomework,
    refetch,
    isRefetching,
  } = useHomeworkByClass(classId, activeSessionId || undefined);

  const classInfo = classData?.data;
  const subjects = subjectsData?.data || [];
  const homework = homeworkData?.data || [];

  const isLoading = loadingClass || loadingSubjects || loadingHomework;

  // Filter and search homework
  const filteredHomework = useMemo(() => {
    return homework.filter((hw) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subject.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Subject filter
      const matchesSubject =
        subjectFilter === "all" || hw.subject.id === subjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [homework, searchQuery, subjectFilter]);

  // Filter by status
  const activeHomework = filteredHomework.filter(
    (hw) => new Date(hw.dueDate) > new Date(),
  );
  const expiredHomework = filteredHomework.filter(
    (hw) => new Date(hw.dueDate) <= new Date(),
  );

  // Calculate statistics
  const totalAttachments = homework.reduce(
    (acc, hw) => acc + hw.attachments.length,
    0,
  );
  const completionRate =
    homework.length > 0
      ? Math.round((activeHomework.length / homework.length) * 100)
      : 0;

  // Show session warning if no active session
  if (!activeSessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-background/80"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Homework
              </h1>
              <p className="text-muted-foreground mt-1">
                {classInfo?.name} {classInfo?.section}
              </p>
            </div>
          </div>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
            <CardContent className="py-16">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-semibold text-amber-800 mb-3">
                  No Active Session
                </h2>
                <p className="text-amber-600/80 mb-6">
                  Please select an active academic session to view and manage
                  homework assignments.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/sessions")}
                  className="border-amber-300 hover:bg-amber-100"
                >
                  Go to Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-background/80"
            >
              <ChevronLeft className="w-4 h-8 " />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Homework
                </h1>
              </div>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Manage and track homework assignments</span>
              </p>
            </div>
          </div>

          {(user?.role === "admin" || user?.role === "teacher") && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Homework
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Total Homework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{homework.length}</div>
              <p className="text-blue-100 text-xs mt-1">
                {subjects.length} subjects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeHomework.length}</div>
              <Progress
                value={completionRate}
                className="mt-2 bg-green-400/30"
                indicatorClassName="bg-white"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{expiredHomework.length}</div>
              <p className="text-orange-100 text-xs mt-1">
                {expiredHomework.length > 0
                  ? "Needs attention"
                  : "All up to date"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalAttachments}</div>
              <p className="text-purple-100 text-xs mt-1">
                Files across all homework
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Session Info and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search homework..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw
                className={cn("w-4 h-4 ", isRefetching ? "animate-spin " : "")}
              />
              Refresh
            </Button>
            {/* Search */}

            {/* Subject Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {subjectFilter === "all"
                    ? "All Subjects"
                    : subjects.find((s) => s.id === subjectFilter)?.name}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSubjectFilter("all")}>
                  All Subjects
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {subjects.map((subject) => (
                  <DropdownMenuItem
                    key={subject.id}
                    onClick={() => setSubjectFilter(subject.id)}
                  >
                    <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                    {subject.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Homework List */}
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Homework Assignments</CardTitle>
                <CardDescription>
                  {filteredHomework.length} assignment
                  {filteredHomework.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-background"
                >
                  All ({filteredHomework.length})
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-background"
                >
                  Active ({activeHomework.length})
                </TabsTrigger>
                <TabsTrigger
                  value="expired"
                  className="data-[state=active]:bg-background"
                >
                  Expired ({expiredHomework.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {filteredHomework.length > 0 ? (
                  <HomeworkList
                    homework={filteredHomework}
                    subjects={subjects}
                    classId={classId}
                    userRole={user?.role}
                    sessionId={activeSessionId}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground">
                      No homework found
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-0">
                {activeHomework.length > 0 ? (
                  <HomeworkList
                    homework={activeHomework}
                    subjects={subjects}
                    classId={classId}
                    userRole={user?.role}
                    sessionId={activeSessionId}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground">
                      No active homework
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      All caught up! Check back later for new assignments
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="expired" className="mt-0">
                {expiredHomework.length > 0 ? (
                  <HomeworkList
                    homework={expiredHomework}
                    subjects={subjects}
                    classId={classId}
                    userRole={user?.role}
                    sessionId={activeSessionId}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground">
                      No expired homework
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      All assignments are up to date
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Create Homework Dialog */}
      <CreateHomeworkDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        subjects={subjects}
        classId={classId}
        className={`${classInfo?.name} ${classInfo?.section}`}
        sessionId={activeSessionId}
      />
    </div>
  );
}
