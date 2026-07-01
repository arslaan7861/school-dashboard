"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  BookOpen,
  Plus,
  Search,
  ChevronRight,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

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
import { useAuthStore } from "@/store/authStore";
import {
  useExams,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
} from "@/features/exam/hooks.exam";
import { ExamStatus, ExamType } from "@/features/exam/types.exam";
import { ExamFormDialog } from "@/components/modal/exam.form";

export default function ExamsOverviewPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  const activeSessionId = useAuthStore((s) => s.activeSessionId);

  const {
    data: exams,
    isLoading,
    error,
  } = useExams({
    sessionId: activeSessionId ? Number(activeSessionId) : undefined,
  });

  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();
  const deleteMutation = useDeleteExam();

  const handleCreate = (data: any, form: any) => {
    if (!activeSessionId) return;
    createMutation.mutate(
      { ...data, sessionId: activeSessionId },
      {
        onSuccess: () => {
          toast.success("New examination successfully initiated");
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to initiate exam");
        },
      },
    );
  };

  const handleUpdate = (id: number, data: any, form: any) => {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Exam parameters updated successfully");
          setDialogOpen(false);
          setEditingExam(null);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update exam");
        },
      },
    );
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure you want to delete this exam? This will delete all schedules and associated marks!",
      )
    ) {
      return;
    }
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Exam deleted successfully");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete exam");
      },
    });
  };

  const getStatusBadge = (status: ExamStatus) => {
    switch (status) {
      case ExamStatus.DRAFT:
        return (
          <Badge variant="secondary" className="capitalize">
            Draft
          </Badge>
        );
      case ExamStatus.SCHEDULED:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 capitalize hover:bg-blue-100">
            Scheduled
          </Badge>
        );
      case ExamStatus.ONGOING:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 capitalize animate-pulse hover:bg-amber-100">
            Ongoing
          </Badge>
        );
      case ExamStatus.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 capitalize hover:bg-green-100">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: ExamType) => {
    switch (type) {
      case ExamType.MID_TERM:
        return "Mid-Term";
      case ExamType.FINAL:
        return "Final Assessment";
      case ExamType.UNIT_TEST:
        return "Unit Test";
      default:
        return "Other";
    }
  };

  // Filter exams based on search query
  const filteredExams = exams?.filter(
    (exam) =>
      exam.name.toLowerCase().includes(search.toLowerCase()) ||
      exam.type.toLowerCase().includes(search.toLowerCase()),
  );

  // Compute metrics
  const stats = {
    total: exams?.length || 0,
    scheduled:
      exams?.filter((e) => e.status === ExamStatus.SCHEDULED).length || 0,
    ongoing: exams?.filter((e) => e.status === ExamStatus.ONGOING).length || 0,
    completed:
      exams?.filter((e) => e.status === ExamStatus.COMPLETED).length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Loading academic exams...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Error loading exams
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to Load Exams</h3>
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

  if (!activeSessionId) {
    return (
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            No active session selected
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No Active Session Selected
            </h3>
            <p className="text-sm text-muted-foreground">
              Please choose an academic session in the top header switcher to
              access exam dashboards.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage terms, class mappings, scheduling, and mark entry results
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingExam(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Exam
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900/50 border-indigo-100 dark:border-indigo-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
              Total Exams
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900/50 border-blue-100 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              Scheduled
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {stats.scheduled}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900/50 border-amber-100 dark:border-amber-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
              Ongoing
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {stats.ongoing}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-50/50 to-white dark:from-slate-900/50 border-green-100 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider text-green-600 dark:text-green-400 uppercase">
              Completed
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats.completed}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Options */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search exams by name or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams?.map((exam) => (
          <Card
            key={exam.id}
            className="hover:shadow-lg transition-all cursor-pointer group border-t-4 border-t-indigo-500 flex flex-col justify-between"
            onClick={() => router.push(`/exams/${exam.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <Badge
                    variant="outline"
                    className="mb-2 text-xs font-semibold tracking-wide"
                  >
                    {getTypeLabel(exam.type)}
                  </Badge>
                  <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                    {exam.name}
                  </CardTitle>
                  <CardDescription className="mt-1.5 flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      {new Date(exam.startDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                      {" - "}
                      {new Date(exam.endDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </CardDescription>
                </div>
                <BookOpen className="w-8 h-8 text-muted-foreground/20 group-hover:text-indigo-500/20 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Compilation Weight
                  </span>
                  <span className="font-semibold">
                    {exam.weightage ?? 100}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Cumulative Grades
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {exam.includeInFinalResult ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(exam.status)}
                </div>
                {exam.resultPublished && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 rounded p-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Results published to portal</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3 pb-3 bg-muted/10 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 gap-1 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingExam(exam);
                  setDialogOpen(true);
                }}
              >
                <Edit className="w-3.5 h-3.5" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 gap-1"
                onClick={(e) => handleDelete(exam.id, e)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredExams?.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Exams Configured</h3>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "No exams match your search criteria."
                  : "No examinations are configured for the selected session."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Forms Dialog */}
      <ExamFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editingExam}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
