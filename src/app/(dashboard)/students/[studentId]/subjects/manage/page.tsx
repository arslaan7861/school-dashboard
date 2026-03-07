"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import { useStudent } from "@/features/students/hooks.student";
import { useSubjectsByClass } from "@/features/subjects/hooks.subject";
import {
  useEnrolledSubjects,
  useStudentSubjectMutations,
} from "@/features/studentSubject/hooks.studentSubject";
import {
  EnrolledSubject,
  ComponentSelection,
} from "@/features/studentSubject/types.studentSubject";

// Helper to get subject type badge
const getSubjectTypeBadge = (subject: EnrolledSubject | any) => {
  if (!subject.isOptional) {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Core</Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
      Optional
    </Badge>
  );
};

// Helper to get component type badge
const getComponentTypeBadge = (type: string) => {
  const variants: Record<string, string> = {
    theory: "bg-blue-50 text-blue-700 border-blue-200",
    practical: "bg-green-50 text-green-700 border-green-200",
    internal: "bg-purple-50 text-purple-700 border-purple-200",
    project: "bg-orange-50 text-orange-700 border-orange-200",
    viva: "bg-pink-50 text-pink-700 border-pink-200",
    other: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return variants[type] || "bg-gray-50 text-gray-700 border-gray-200";
};

// Helper to get teacher initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function ManageStudentSubjectsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Number(params.studentId);
  const sessionId = Number(useAuthStore((s) => s.activeSessionId));
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState("enrolled");
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [selectedSubjectForAdd, setSelectedSubjectForAdd] = useState<
    number | null
  >(null);
  const [componentSelections, setComponentSelections] = useState<
    Record<number, number>
  >({});
  const [expandedSubjects, setExpandedSubjects] = useState<
    Record<number, boolean>
  >({});

  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useStudent(
    studentId,
    sessionId,
  );
  const classStudentId = student?.classRelation?.id;
  const classId = student?.classRelation?.classId;

  // Fetch enrolled subjects
  const {
    data: enrolledData,
    isLoading: isLoadingEnrolled,
    refetch: refetchEnrolled,
  } = useEnrolledSubjects(classStudentId, !!classStudentId);

  // Fetch all subjects for the class with details
  const { data: allSubjects, isLoading: isLoadingSubjects } =
    useSubjectsByClass(classId, {
      includeDetails: true,
      enabled: !!classId && !!sessionId,
    });

  const {
    removeSubject,
    addOptionalSubject,
    changeBatch,
    isRemoving,
    isAdding,
    isChangingBatch,
  } = useStudentSubjectMutations(classStudentId);

  // Toggle subject expansion
  const toggleSubject = (subjectId: number) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  // Handle remove subject
  const handleRemoveSubject = async () => {
    if (!selectedSubject || !classStudentId) return;

    await removeSubject({
      classStudentId,
      subjectId: selectedSubject.subjectId,
    });
    setShowRemoveDialog(false);
    setSelectedSubject(null);
    refetchEnrolled();
  };

  // Handle add subject
  const handleAddSubject = async () => {
    if (!selectedSubjectForAdd || !classStudentId) return;

    // Convert component selections to array format
    const componentBatches: ComponentSelection[] = Object.entries(
      componentSelections,
    )
      .filter(([_, batchId]) => batchId)
      .map(([componentId, batchId]) => ({
        componentId: Number(componentId),
        batchId,
      }));

    await addOptionalSubject({
      classStudentId,
      subjectId: selectedSubjectForAdd,
      componentBatches,
    });

    setShowAddSubjectDialog(false);
    setSelectedSubjectForAdd(null);
    setComponentSelections({});
    refetchEnrolled();
  };

  // Handle batch change for a component
  const handleBatchChange = async (
    enrollmentId: number,
    newBatchId: number,
  ) => {
    await changeBatch({
      enrollmentId,
      data: { newBatchId, enrollmentId },
    });
    refetchEnrolled();
  };

  // Get available batches for a component from the subject data
  const getAvailableBatches = (subjectId: number, componentId: number) => {
    const subject = allSubjects?.find((s) => s.id === subjectId);
    const component = subject?.components?.find((c) => c.id === componentId);
    return component?.batches || [];
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have permission to manage subjects.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoadingStudent || isLoadingEnrolled || isLoadingSubjects) {
    return (
      <div className="h-full w-full space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // No class assignment
  if (!classStudentId || !classId) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Class Assignment</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This student needs to be assigned to a class before subjects can
              be managed.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrolledSubjects = enrolledData?.subjects || [];
  const allSubjectsList = allSubjects || [];

  // Filter out already enrolled subjects from available list
  const enrolledSubjectIds = new Set(enrolledSubjects.map((s) => s.subjectId));
  const notEnrolledSubjects = allSubjectsList.filter(
    (s) => !enrolledSubjectIds.has(s.id) && s.isOptional, // Only show optional subjects for adding
  );

  return (
    <div className="h-full w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Manage Subjects
            </h1>
            <p className="text-sm text-muted-foreground">
              {student?.name} • {student?.admissionNo}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddSubjectDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="enrolled">
            Enrolled Subjects ({enrolledSubjects.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available Subjects ({notEnrolledSubjects.length})
          </TabsTrigger>
        </TabsList>

        {/* Enrolled Subjects Tab */}
        <TabsContent value="enrolled" className="space-y-4">
          {enrolledSubjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Subjects Enrolled
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This student is not enrolled in any subjects yet.
                </p>
                <Button onClick={() => setShowAddSubjectDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {enrolledSubjects.map((subject) => (
                <Card key={subject.subjectId} className="overflow-hidden">
                  <CardHeader
                    className="py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSubject(subject.subjectId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-base">
                            {subject.subjectName}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            {getSubjectTypeBadge(subject)}
                            <Badge variant="outline" className="text-xs">
                              {subject.marksType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {subject.components.length} components
                        </Badge>
                        {expandedSubjects[subject.subjectId] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {expandedSubjects[subject.subjectId] && (
                    <CardContent className="p-0 border-t">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Component</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Current Batch</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead className="w-[250px]">
                              Change Batch
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subject.components.map((comp) => {
                            const availableBatches = getAvailableBatches(
                              subject.subjectId,
                              comp.componentId,
                            );

                            return (
                              <TableRow key={comp.componentId}>
                                <TableCell className="font-medium">
                                  {comp.componentName}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getComponentTypeBadge(
                                      comp.componentType,
                                    )}
                                  >
                                    {comp.componentType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className="font-mono"
                                  >
                                    {comp.selectedBatchName}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {comp.teacher ? (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={
                                            comp.teacher.profilePic || undefined
                                          }
                                        />
                                        <AvatarFallback className="text-xs">
                                          {getInitials(comp.teacher.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {comp.teacher.name}
                                      </span>
                                    </div>
                                  ) : (
                                    "Not assigned"
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Select
                                    onValueChange={(value) =>
                                      handleBatchChange(
                                        comp.enrollmentId,
                                        Number(value),
                                      )
                                    }
                                    disabled={isChangingBatch}
                                  >
                                    <SelectTrigger className="w-[230px]">
                                      <SelectValue placeholder="Change batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableBatches.map((batch) => (
                                        <SelectItem
                                          key={batch.id}
                                          value={batch.id.toString()}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span>{batch.name}</span>
                                            {batch.teacher && (
                                              <span className="text-xs text-muted-foreground">
                                                ({batch.teacher.name})
                                              </span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      ))}
                                      {availableBatches.length === 0 && (
                                        <div className="p-2 text-center text-sm text-muted-foreground">
                                          No batches available
                                        </div>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      {subject.isOptional && (
                        <div className="p-4 border-t bg-muted/20 flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedSubject(subject);
                              setShowRemoveDialog(true);
                            }}
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Subject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Subjects Tab */}
        <TabsContent value="available" className="space-y-4">
          {notEnrolledSubjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Available Subjects
                </h3>
                <p className="text-sm text-muted-foreground">
                  All optional subjects for this class have been enrolled.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notEnrolledSubjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {subject.name}
                        </CardTitle>
                        <div className="flex gap-2 mt-1">
                          {getSubjectTypeBadge(subject)}
                          <Badge variant="outline" className="text-xs">
                            {subject.marksType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {subject.components?.length || 0} components
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedSubjectForAdd(subject.id);
                        setShowAddSubjectDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subject
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={showAddSubjectDialog}
        onOpenChange={(open) => {
          setShowAddSubjectDialog(open);
          if (!open) {
            setSelectedSubjectForAdd(null);
            setComponentSelections({});
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Optional Subject</DialogTitle>
            <DialogDescription>
              Select a subject and choose batches for each component. Leave
              blank to auto-assign the first batch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Subject selector — shown when opened from header button */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={selectedSubjectForAdd?.toString() ?? ""}
                onValueChange={(value) => {
                  setSelectedSubjectForAdd(Number(value));
                  setComponentSelections({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {notEnrolledSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{subject.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {subject.marksType}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                  {notEnrolledSubjects.length === 0 && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No optional subjects available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Component batch selectors — shown once a subject is selected */}
            {selectedSubjectForAdd && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Batch Selection per Component
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Leave blank to auto-assign the first batch alphabetically.
                  </p>
                </div>
                <ScrollArea className="max-h-[300px] pr-4">
                  <div className="space-y-3">
                    {allSubjectsList
                      .find((s) => s.id === selectedSubjectForAdd)
                      ?.components?.map((component) => (
                        <div
                          key={component.id}
                          className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {component.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={`shrink-0 ${getComponentTypeBadge(component.type)}`}
                              >
                                {component.type}
                              </Badge>
                            </div>
                          </div>
                          <Select
                            onValueChange={(value) =>
                              setComponentSelections((prev) => ({
                                ...prev,
                                [component.id]: Number(value),
                              }))
                            }
                            value={
                              componentSelections[component.id]?.toString() ??
                              ""
                            }
                          >
                            <SelectTrigger className="w-[200px] shrink-0">
                              <SelectValue placeholder="Auto-select" />
                            </SelectTrigger>
                            <SelectContent>
                              {component.batches?.map((batch) => (
                                <SelectItem
                                  key={batch.id}
                                  value={batch.id.toString()}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{batch.name}</span>
                                    {batch.teacher && (
                                      <span className="text-xs text-muted-foreground">
                                        ({batch.teacher.name})
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                              {(!component.batches ||
                                component.batches.length === 0) && (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  No batches available
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddSubjectDialog(false);
                setSelectedSubjectForAdd(null);
                setComponentSelections({});
              }}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSubject}
              disabled={isAdding || !selectedSubjectForAdd}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Subject Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Subject</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to remove{" "}
                <span className="font-medium">
                  {selectedSubject?.subjectName}
                </span>
                ?
              </p>
              {selectedSubject && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This will remove all {selectedSubject.components.length}{" "}
                    components and their enrollments. This action cannot be
                    undone.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveSubject}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Subject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
