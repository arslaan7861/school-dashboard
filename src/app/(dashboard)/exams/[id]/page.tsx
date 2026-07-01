"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  BookOpen,
  ArrowLeft,
  Users,
  Settings,
  Layers,
  Award,
  FileText,
  AlertCircle,
  Plus,
  Loader2,
  CheckCircle2,
  Trash2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  Clock,
  MapPin,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { useAuthStore } from "@/store/authStore";
import {
  useExam,
  useExamStatusSummary,
  useUpdateExamStatus,
  usePublishExamResults,
  useAssignExamToClasses,
  useAddExamSubject,
  useAddExamComponent,
  useExamMarksByComponent,
  useEnterMarks,
  useAdmitCard,
  useAdmitCardEligibility,
} from "@/features/exam/hooks.exam";
import { useClasses } from "@/features/class/hooks.class";
import { useStudentsByClass } from "@/features/students/hooks.student";
import {
  ExamStatus,
  ExamClassStatus,
  MarksType,
  ExamComponentStatus,
} from "@/features/exam/types.exam";
import { StructureTab } from "@/features/exam/components/StructureTab";
import { SchedulerTab } from "@/features/exam/components/scheduler/SchedulerTab";
import { AdmitCardPolicyDialog } from "@/features/exam/components/scheduler/AdmitCardPolicyDialog";

// ==================== Admit Card Clearance Badge ====================
function AdmitCardClearanceBadge({
  examId,
  studentId,
}: {
  examId: number;
  studentId: number;
}) {
  const { data: eligibility, isLoading } = useAdmitCardEligibility(examId, studentId);

  if (isLoading) {
    return <Skeleton className="h-5 w-20 rounded bg-slate-100 dark:bg-slate-800" />;
  }

  if (!eligibility) {
    return (
      <Badge variant="outline" className="text-slate-500 border-slate-200">
        Unknown
      </Badge>
    );
  }

  return eligibility.isEligible ? (
    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
      Cleared
    </Badge>
  ) : (
    <Badge
      className="bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 cursor-help"
      title={eligibility.reasons?.join(", ")}
    >
      Dues Pending
    </Badge>
  );
}

// ==================== MAIN DASHBOARD COMPONENT ====================

export default function ExamDashboardHub() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = Number(params.id);

  const initialTab = searchParams.get("tab") || "overview";
  const initialStructureClassId = searchParams.get("structureClassId") || "";
  const initialGradeClassId = searchParams.get("gradeClassId") || "";
  const initialGradeSubjectId = searchParams.get("gradeSubjectId") || "";
  const initialGradeComponentId = searchParams.get("gradeComponentId") || "";
  const initialAdmitClassId = searchParams.get("admitClassId") || "";

  const activeSessionId = useAuthStore((s) => s.activeSessionId);

  // Helper to update query parameters in URL
  const updateParams = (newParams: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    const queryString = nextParams.toString();
    const newUrl = `/exams/${examId}${queryString ? `?${queryString}` : ""}`;
    router.replace(newUrl, { scroll: false });
  };

  // Local state for modals/forms
  const [activeTab, setActiveTab] = useState(initialTab);

  // Fetch Core Exam Data
  const {
    data: exam,
    isLoading: examLoading,
    error: examError,
  } = useExam(examId, true);
  const { data: summary, isLoading: summaryLoading } =
    useExamStatusSummary(examId);
  const { data: classes } = useClasses(
    activeSessionId ? Number(activeSessionId) : undefined,
  );

  // Mutations
  const updateStatusMutation = useUpdateExamStatus();
  const publishMutation = usePublishExamResults();
  const assignClassesMutation = useAssignExamToClasses();
  const addSubjectMutation = useAddExamSubject();
  const addComponentMutation = useAddExamComponent();

  // ==================== COMPONENT CONFIGURATION CLASS ====================
  const [structureClassId, setStructureClassId] = useState(
    initialStructureClassId,
  );

  // ==================== GRADING / MARKS TAB STATE ====================
  const [gradeClassId, setGradeClassId] = useState(initialGradeClassId);
  const [gradeSubjectId, setGradeSubjectId] = useState(initialGradeSubjectId);
  const [gradeComponentId, setGradeComponentId] = useState(
    initialGradeComponentId,
  );
  const [marksState, setMarksState] = useState<
    Record<
      number,
      { marksObtained: string; isAbsent: boolean; remarks: string }
    >
  >({});

  const gradeClassSubjects = useMemo(() => {
    if (!exam?.examClasses || !gradeClassId) return [];
    const ec = exam.examClasses.find((c) => c.classId === Number(gradeClassId));
    return ec?.subjects || [];
  }, [exam?.examClasses, gradeClassId]);

  const gradeSubjectComponents = useMemo(() => {
    if (!gradeClassSubjects || !gradeSubjectId) return [];
    const es = gradeClassSubjects.find(
      (s) => s.subjectId === Number(gradeSubjectId),
    );
    return es?.components || [];
  }, [gradeClassSubjects, gradeSubjectId]);

  // Load Marks
  const { data: gradingData, isLoading: marksLoading } =
    useExamMarksByComponent(gradeComponentId ? Number(gradeComponentId) : 0);

  // Initialize Marks entries local state
  useMemo(() => {
    if (gradingData?.marks) {
      const dict: any = {};
      gradingData.marks.forEach((m) => {
        dict[m.classStudentId] = {
          marksObtained: m.marksObtained?.toString() ?? "",
          isAbsent: m.isAbsent ?? false,
          remarks: m.remarks ?? "",
        };
      });
      setMarksState(dict);
    }
  }, [gradingData]);

  const enterMarksMutation = useEnterMarks();

  const handleSaveMarks = () => {
    if (!gradeComponentId) return;
    const formattedMarks = Object.entries(marksState).map(
      ([studentId, data]) => ({
        classStudentId: Number(studentId),
        marksObtained: data.isAbsent
          ? undefined
          : data.marksObtained === ""
            ? undefined
            : Number(data.marksObtained),
        isAbsent: data.isAbsent,
        remarks: data.remarks || undefined,
      }),
    );

    enterMarksMutation.mutate(
      {
        examComponentId: Number(gradeComponentId),
        marks: formattedMarks,
      },
      {
        onSuccess: () => {
          toast.success("Marks recorded successfully");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to enter marks");
        },
      },
    );
  };

  // ==================== ADMIT CARD TAB STATE ====================
  const [admitClassId, setAdmitClassId] = useState(initialAdmitClassId);
  const [selectedStudentForAdmitCard, setSelectedStudentForAdmitCard] =
    useState<any>(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  // Fetch Students by Class for Admit Cards Table
  const { data: studentsData, isLoading: studentsLoading } = useStudentsByClass(
    {
      classId: admitClassId ? Number(admitClassId) : 0,
      limit: 100,
    },
  );

  const { data: admitCardDetails, isLoading: admitCardLoading } = useAdmitCard(
    examId,
    selectedStudentForAdmitCard ? selectedStudentForAdmitCard.id : 0,
  );

  // ==================== URL SYNCHRONIZATION AND FILTERS ====================

  // Synchronize state with URL search parameters
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    const sClass = searchParams.get("structureClassId");
    if (sClass !== null && sClass !== structureClassId) {
      setStructureClassId(sClass);
    }
    const gClass = searchParams.get("gradeClassId");
    if (gClass !== null && gClass !== gradeClassId) {
      setGradeClassId(gClass);
    }
    const gSubj = searchParams.get("gradeSubjectId");
    if (gSubj !== null && gSubj !== gradeSubjectId) {
      setGradeSubjectId(gSubj);
    }
    const gComp = searchParams.get("gradeComponentId");
    if (gComp !== null && gComp !== gradeComponentId) {
      setGradeComponentId(gComp);
    }
    const aClass = searchParams.get("admitClassId");
    if (aClass !== null && aClass !== admitClassId) {
      setAdmitClassId(aClass);
    }
  }, [searchParams]);

  // Cascade first option auto-selection for unselected child filters in Grading
  useEffect(() => {
    if (!exam || activeTab !== "grading") return;

    if (gradeClassId) {
      const ec = exam.examClasses?.find(
        (c) => c.classId === Number(gradeClassId),
      );
      const subjects = ec?.subjects || [];

      if (subjects.length > 0) {
        const isSubjectValid = subjects.some(
          (s) => s.subjectId.toString() === gradeSubjectId,
        );
        if (!isSubjectValid) {
          const firstSubjId = subjects[0].subjectId.toString();
          setGradeSubjectId(firstSubjId);
          setGradeComponentId("");
          updateParams({
            gradeSubjectId: firstSubjId,
            gradeComponentId: null,
          });
          return;
        }
      } else {
        if (gradeSubjectId !== "" || gradeComponentId !== "") {
          setGradeSubjectId("");
          setGradeComponentId("");
          updateParams({
            gradeSubjectId: null,
            gradeComponentId: null,
          });
          return;
        }
      }
    }

    if (gradeClassId && gradeSubjectId) {
      const ec = exam.examClasses?.find(
        (c) => c.classId === Number(gradeClassId),
      );
      const subjects = ec?.subjects || [];
      const es = subjects.find(
        (s) => s.subjectId.toString() === gradeSubjectId,
      );
      const components = es?.components || [];

      if (components.length > 0) {
        const isComponentValid = components.some(
          (c) => c.id.toString() === gradeComponentId,
        );
        if (!isComponentValid) {
          const firstCompId = components[0].id.toString();
          setGradeComponentId(firstCompId);
          updateParams({
            gradeComponentId: firstCompId,
          });
        }
      } else {
        if (gradeComponentId !== "") {
          setGradeComponentId("");
          updateParams({
            gradeComponentId: null,
          });
        }
      }
    }
  }, [exam, activeTab, gradeClassId, gradeSubjectId, gradeComponentId]);

  // Component configuration class change handler
  const handleStructureClassChange = (val: string) => {
    setStructureClassId(val);
    updateParams({ structureClassId: val });
  };

  // Tab change handler
  const handleTabChange = (val: string) => {
    setActiveTab(val);
    updateParams({ tab: val });
  };

  // Grading class change handler
  const handleGradeClassChange = (val: string) => {
    setGradeClassId(val);
    setGradeSubjectId("");
    setGradeComponentId("");
    updateParams({
      gradeClassId: val,
      gradeSubjectId: null,
      gradeComponentId: null,
    });
  };

  // Grading subject change handler
  const handleGradeSubjectChange = (val: string) => {
    setGradeSubjectId(val);
    setGradeComponentId("");
    updateParams({
      gradeSubjectId: val,
      gradeComponentId: null,
    });
  };

  // Grading component change handler
  const handleGradeComponentChange = (val: string) => {
    setGradeComponentId(val);
    updateParams({ gradeComponentId: val });
  };

  // Admit cards class change handler
  const handleAdmitClassChange = (val: string) => {
    setAdmitClassId(val);
    setSelectedStudentForAdmitCard(null);
    updateParams({ admitClassId: val });
  };

  // ==================== LIFECYCLE MANAGEMENT ====================
  const handlePublishResults = () => {
    if (
      !confirm(
        "Are you sure you want to compile and publish results for this exam?",
      )
    )
      return;
    publishMutation.mutate(examId, {
      onSuccess: () => {
        toast.success("Exam results published and catalogued successfully");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to publish results");
      },
    });
  };

  const handleStatusChange = (status: ExamStatus) => {
    updateStatusMutation.mutate(
      { id: examId, status },
      {
        onSuccess: () => {
          toast.success(`Exam status advanced to: ${status}`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update exam lifecycle status");
        },
      },
    );
  };

  if (examLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <Card className="m-6 border-red-200 pt-6">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold">Exam Dashboard Failed</h3>
          <p className="text-sm text-muted-foreground mt-2">
            The exam dashboard details could not be retrieved from the server
            database.
          </p>
          <Button className="mt-4" onClick={() => router.push("/exams")}>
            Back to Overview
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Back Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/exams")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{exam.name}</h1>
              <Badge className="capitalize bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
                {exam.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scheduled window: {new Date(exam.startDate).toLocaleDateString()}{" "}
              - {new Date(exam.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status lifecycle actions */}
          <Select
            value={exam.status}
            onValueChange={(val) => handleStatusChange(val as ExamStatus)}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Advance Lifecycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ExamStatus.DRAFT}>Draft State</SelectItem>
              <SelectItem value={ExamStatus.SCHEDULED}>
                Lock Schedule
              </SelectItem>
              <SelectItem value={ExamStatus.ONGOING}>
                Ongoing Assessment
              </SelectItem>
              <SelectItem value={ExamStatus.COMPLETED}>
                Grading Phase
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Results compiler */}
          {exam.status === ExamStatus.COMPLETED && !exam.resultPublished && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={handlePublishResults}
            >
              <Award className="w-4 h-4" />
              Publish Results
            </Button>
          )}

          {exam.resultPublished && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 py-1.5 px-3">
              Results Catalogued & Live
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-5 max-w-2xl bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="structure" className="rounded-lg">
            Structure
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="rounded-lg">
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="grading" className="rounded-lg">
            Grading
          </TabsTrigger>
          <TabsTrigger value="clearance" className="rounded-lg">
            Admit Cards
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Lifecycle & Progress</CardTitle>
                <CardDescription>
                  Overall progression checklist for this examination campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                      Components Grading Progress
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Components scored vs. total scheduled exam components
                    </p>
                  </div>
                  {summary ? (
                    <div className="text-right">
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {summary.completedComponents} /{" "}
                        {summary.totalComponents}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        ({Math.round(summary.progressPercentage)}%)
                      </p>
                    </div>
                  ) : (
                    <Skeleton className="w-16 h-8" />
                  )}
                </div>

                {/* Class lists state */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">
                    Assigned Classes & Status
                  </h4>
                  <div className="divide-y border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    {summary?.classes?.map((c) => (
                      <div
                        key={c.classId}
                        className="flex justify-between items-center p-3 text-sm"
                      >
                        <span className="font-medium">{c.className}</span>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              c.status === "active" ? "default" : "secondary"
                            }
                          >
                            {c.status}
                          </Badge>
                          {c.marksEntryCompleted ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              Marks Ready
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-amber-600 border-amber-200 bg-amber-50"
                            >
                              Pending Marks
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!summary?.classes || summary.classes.length === 0) && (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No classes assigned to this exam. Configure classes in
                        the Structure tab.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Execution Timeline</CardTitle>
                <CardDescription>Dates & details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-semibold">
                    {new Date(exam.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-semibold">
                    {new Date(exam.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">
                    Weightage in Finals
                  </span>
                  <span className="font-semibold">
                    {exam.weightage ?? 100}%
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">
                    Final Grade Compilation
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {exam.includeInFinalResult ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* STRUCTURE TAB */}
        <TabsContent value="structure" className="space-y-4">
          <StructureTab
            exam={exam}
            examId={examId}
            allClasses={classes?.data || []}
            assignClassesMutation={assignClassesMutation}
            addSubjectMutation={addSubjectMutation}
            addComponentMutation={addComponentMutation}
            onRefreshExam={() => {}}
            selectedClassId={structureClassId}
            onClassChange={handleStructureClassChange}
          />
        </TabsContent>

        {/* SCHEDULER TAB (DND DRAG AND DROP SCHEDULER) */}
        <TabsContent value="scheduler" className="space-y-4">
          <SchedulerTab exam={exam} examId={examId} />
        </TabsContent>

        {/* GRADING TAB */}
        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex md:flex-row flex-col items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Grading & Mark Register</CardTitle>
                <CardDescription>
                  Spreadsheet scoring mode for exam components
                </CardDescription>
              </div>

              {/* Class & Subject Selector */}
              <div className="flex flex-wrap gap-3">
                <Select
                  value={gradeClassId}
                  onValueChange={handleGradeClassChange}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {exam.examClasses?.map((ec) => (
                      <SelectItem
                        key={ec.classId}
                        value={ec.classId.toString()}
                      >
                        {ec.class?.name} {ec.class?.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={gradeSubjectId}
                  onValueChange={handleGradeSubjectChange}
                  disabled={!gradeClassId}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeClassSubjects.map((es) => (
                      <SelectItem
                        key={es.subjectId}
                        value={es.subjectId.toString()}
                      >
                        {es.subject?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={gradeComponentId}
                  onValueChange={handleGradeComponentChange}
                  disabled={!gradeSubjectId}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Component" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeSubjectComponents.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id.toString()}>
                        {comp.subjectComponent?.name} (
                        {comp.subjectComponent?.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {!gradeComponentId ? (
                <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <span className="font-semibold text-sm">
                    Spreadsheet Locked
                  </span>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Please choose a class, subject, and component component from
                    the selectors in the header.
                  </p>
                </div>
              ) : marksLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary card metrics */}
                  {gradingData?.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs">
                      <div>
                        Total Students:{" "}
                        <strong className="font-bold text-slate-800 dark:text-slate-100">
                          {gradingData.summary.totalStudents}
                        </strong>
                      </div>
                      <div>
                        Present:{" "}
                        <strong className="font-bold text-emerald-600">
                          {gradingData.summary.presentCount}
                        </strong>
                      </div>
                      <div>
                        Absent:{" "}
                        <strong className="font-bold text-red-500">
                          {gradingData.summary.absentCount}
                        </strong>
                      </div>
                      <div>
                        Class Average:{" "}
                        <strong className="font-bold text-indigo-600">
                          {gradingData.summary.averageMarks}
                        </strong>
                      </div>
                    </div>
                  )}

                  <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-950">
                        <TableRow>
                          <TableHead className="w-[100px]">Roll No</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead className="w-[120px]">
                            Admission No
                          </TableHead>
                          <TableHead className="w-[120px]">Absent</TableHead>
                          <TableHead className="w-[180px]">
                            Marks Obtained
                          </TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradingData?.marks?.map((m) => {
                          const state = marksState[m.classStudentId] || {
                            marksObtained: "",
                            isAbsent: false,
                            remarks: "",
                          };
                          return (
                            <TableRow key={m.classStudentId}>
                              <TableCell className="font-mono text-xs">
                                {m.rollNumber || "N/A"}
                              </TableCell>
                              <TableCell className="font-medium text-slate-800 dark:text-slate-100">
                                {m.studentName}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {m.admissionNo}
                              </TableCell>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={state.isAbsent}
                                  onChange={(e) => {
                                    setMarksState({
                                      ...marksState,
                                      [m.classStudentId]: {
                                        ...state,
                                        isAbsent: e.target.checked,
                                        marksObtained: e.target.checked
                                          ? ""
                                          : state.marksObtained,
                                      },
                                    });
                                  }}
                                  className="w-4 h-4 cursor-pointer accent-indigo-600"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder={`Max: ${gradingData?.component?.maxMarks}`}
                                  value={state.marksObtained}
                                  disabled={state.isAbsent}
                                  onChange={(e) => {
                                    setMarksState({
                                      ...marksState,
                                      [m.classStudentId]: {
                                        ...state,
                                        marksObtained: e.target.value,
                                      },
                                    });
                                  }}
                                  className="h-9 font-medium"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Leave remarks"
                                  value={state.remarks}
                                  onChange={(e) => {
                                    setMarksState({
                                      ...marksState,
                                      [m.classStudentId]: {
                                        ...state,
                                        remarks: e.target.value,
                                      },
                                    });
                                  }}
                                  className="h-9"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <Button
                      variant="outline"
                      onClick={() => setGradeComponentId("")}
                    >
                      Discard
                    </Button>
                    <Button onClick={handleSaveMarks}>
                      Save & Compile Marks
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADMIT CARDS TAB */}
        <TabsContent value="clearance" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex md:flex-row flex-col items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Admit Cards & Clearance Auditing</CardTitle>
                <CardDescription>
                  Verify student fee clearances and generate admit cards
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs gap-1.5 border-dashed border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:bg-indigo-950/20"
                  onClick={() => setPolicyDialogOpen(true)}
                >
                  <Settings className="w-3.5 h-3.5" /> Configure Rules
                </Button>

                <Select
                  value={admitClassId}
                  onValueChange={handleAdmitClassChange}
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Choose Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {exam.examClasses?.map((ec) => (
                      <SelectItem key={ec.classId} value={ec.classId.toString()}>
                        {ec.class?.name} {ec.class?.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {!admitClassId ? (
                <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <span className="font-semibold text-sm">
                    Clearance Dashboard Locked
                  </span>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Please choose a class from the class selector dropdown.
                  </p>
                </div>
              ) : studentsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950">
                      <TableRow>
                        <TableHead>Admission No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Admit Card Clearance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsData?.students?.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs">
                            {student.admissionNo}
                          </TableCell>
                          <TableCell className="font-medium text-slate-800 dark:text-slate-100">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {student.classRelation?.rollNumber || "N/A"}
                          </TableCell>
                          <TableCell>
                            <AdmitCardClearanceBadge
                              examId={examId}
                              studentId={student.id}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5"
                              onClick={() =>
                                setSelectedStudentForAdmitCard(student)
                              }
                            >
                              <Printer className="w-3.5 h-3.5" /> Print Admit
                              Card
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <AdmitCardPolicyDialog
            open={policyDialogOpen}
            onOpenChange={setPolicyDialogOpen}
            examId={examId}
            sessionId={activeSessionId ? Number(activeSessionId) : (exam?.sessionId || 0)}
          />

          {/* PRINT DIALOG MODAL */}
          <Dialog
            open={!!selectedStudentForAdmitCard}
            onOpenChange={(open) =>
              !open && setSelectedStudentForAdmitCard(null)
            }
          >
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Student Admit Card Portal</DialogTitle>
                <DialogDescription>
                  Review student credentials and schedule details
                </DialogDescription>
              </DialogHeader>

              {admitCardLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : admitCardDetails && admitCardDetails.isEligible ? (
                <div
                  className="border p-6 rounded-xl bg-white space-y-4 text-slate-950 shadow-md"
                  id="printable-area"
                >
                  {/* Header info */}
                  <div className="flex justify-between items-start pb-4 border-b border-double border-slate-300">
                    <div className="space-y-0.5">
                      <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                        Apex Senior Secondary School
                      </h2>
                      <p className="text-xs text-muted-foreground font-semibold">
                        Official Academic Hall Ticket / Admit Card
                      </p>
                      <h3 className="text-sm font-bold text-indigo-600 mt-1 uppercase">
                        {admitCardDetails.exam?.name}
                      </h3>
                    </div>
                    <div className="w-14 h-14 bg-indigo-50 border rounded-lg flex items-center justify-center font-bold text-indigo-600">
                      Apex
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border">
                    <div>
                      <span className="text-slate-400 block">Student Name</span>
                      <strong className="font-bold text-slate-900">
                        {admitCardDetails.student?.name}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Class & Sec</span>
                      <strong className="font-bold text-slate-900">
                        {admitCardDetails.student?.className} -{" "}
                        {admitCardDetails.student?.section}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">
                        Admission Number
                      </span>
                      <strong className="font-bold text-slate-900">
                        {admitCardDetails.student?.admissionNo}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Roll Number</span>
                      <strong className="font-bold text-slate-900">
                        {admitCardDetails.student?.rollNumber || "N/A"}
                      </strong>
                    </div>
                  </div>

                  {/* Exam schedule details */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Exam Schedules
                    </span>
                    <div className="border rounded-lg overflow-hidden text-xs">
                      <Table>
                        <TableHeader className="bg-slate-100">
                          <TableRow>
                            <TableHead className="py-1">Subject</TableHead>
                            <TableHead className="py-1">Date</TableHead>
                            <TableHead className="py-1">Time</TableHead>
                            <TableHead className="py-1">Room</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {admitCardDetails.schedule?.map(
                            (sch: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell className="py-1.5 font-semibold">
                                  {sch.subjectName} ({sch.componentName})
                                </TableCell>
                                <TableCell className="py-1.5">
                                  {new Date(sch.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="py-1.5">
                                  {sch.startTime} - {sch.endTime}
                                </TableCell>
                                <TableCell className="py-1.5">
                                  {sch.room || "Hall 1"}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                          {(!admitCardDetails.schedule ||
                            admitCardDetails.schedule.length === 0) && (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center text-muted-foreground p-3"
                              >
                                No exams scheduled for this student.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="text-[10px] space-y-1.5 pt-3 border-t text-slate-600">
                    <span className="font-bold text-slate-800 block uppercase">
                      Important Candidate Instructions
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>
                        Please bring a printed hardcopy of this admit card to
                        the examination hall.
                      </li>
                      <li>
                        Be present in the assigned room 15 minutes prior to the
                        start time.
                      </li>
                      <li>
                        Calculators, phone devices, and electronic wearables are
                        strictly prohibited.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-500 mx-auto" />
                  <span className="font-bold text-rose-800 dark:text-rose-400 block text-sm">
                    Admit Card Printing Blocked
                  </span>
                  <p className="text-xs text-rose-700 dark:text-rose-500 max-w-md mx-auto">
                    This candidate is currently ineligible due to unmet fee clearance requirements.
                  </p>
                  {admitCardDetails?.reasons && admitCardDetails.reasons.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-rose-200/50 dark:border-rose-900/30 text-left max-w-sm mx-auto">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                        Outstanding Issues:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-rose-600 dark:text-rose-400">
                        {admitCardDetails.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudentForAdmitCard(null)}
                >
                  Close
                </Button>
                <Button
                  disabled={!admitCardDetails || !admitCardDetails.isEligible}
                  onClick={() => {
                    const printContents =
                      document.getElementById("printable-area")?.innerHTML;
                    if (printContents) {
                      let iframe = document.getElementById(
                        "print-iframe",
                      ) as HTMLIFrameElement;
                      if (!iframe) {
                        iframe = document.createElement("iframe");
                        iframe.id = "print-iframe";
                        iframe.style.position = "absolute";
                        iframe.style.width = "0px";
                        iframe.style.height = "0px";
                        iframe.style.border = "none";
                        document.body.appendChild(iframe);
                      }

                      const doc =
                        iframe.contentDocument ||
                        iframe.contentWindow?.document;
                      if (doc) {
                        doc.open();
                        let stylesHtml = "";
                        document
                          .querySelectorAll('link[rel="stylesheet"], style')
                          .forEach((styleNode) => {
                            stylesHtml += styleNode.outerHTML;
                          });
                        doc.write(`
                          <html>
                            <head>
                              <title>Admit Card - ${admitCardDetails?.student?.name || ""}</title>
                              ${stylesHtml}
                              <style>
                                body { padding: 20px; background: white !important; color: black !important; }
                              </style>
                            </head>
                            <body>
                              ${printContents}
                            </body>
                          </html>
                        `);
                        doc.close();

                        setTimeout(() => {
                          iframe.contentWindow?.focus();
                          iframe.contentWindow?.print();
                        }, 500);
                      }
                    }
                  }}
                  className="gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
