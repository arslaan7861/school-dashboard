"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  useSubjectsByClass,
  useSubjectCrud,
} from "@/features/subjects/hooks.subject";
import { useClass } from "@/features/class/hooks.class";
import { useAuthStore } from "@/store/authStore";
import {
  openCreateSubjectModal,
  openEditSubjectModal,
} from "@/store/modals/subject.modal.store";

export default function SubjectsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.id);
  const sessionId = useAuthStore((s) => s.activeSessionId);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<
    "all" | "core" | "optional" | "elective"
  >("all");

  const { data: classData, isLoading: isLoadingClass } = useClass(
    classId,
  );
  const { data: subjects = [], isLoading: isLoadingSubjects } =
    useSubjectsByClass(classId, {
      includeDetails: true,
      // Remove search from API call - we'll filter on frontend
    });
  const { deleteAsync, isDeleting } = useSubjectCrud();

  const isLoading = isLoadingClass || isLoadingSubjects;

  // Frontend filtering
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        subject.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType =
        typeFilter === "all"
          ? true
          : typeFilter === "core"
            ? !subject.isOptional && !subject.isElective
            : typeFilter === "optional"
              ? subject.isOptional
              : typeFilter === "elective"
                ? subject.isElective
                : true;

      return matchesSearch && matchesType;
    });
  }, [subjects, searchTerm, typeFilter]);

  const handleDelete = async (subjectId: number) => {
    try {
      await deleteAsync(subjectId);
      toast.success("Subject deleted successfully");
      setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
    } catch (error) {
      toast.error("Failed to delete subject");
    } finally {
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedSubjects.map((id) => deleteAsync(id)));
      toast.success(`${selectedSubjects.length} subjects deleted successfully`);
      setSelectedSubjects([]);
    } catch (error) {
      toast.error("Failed to delete some subjects");
    }
  };

  const handleSelectAll = () => {
    if (selectedSubjects.length === filteredSubjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(filteredSubjects.map((s) => s.id));
    }
  };

  const handleSelect = (subjectId: number) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
  };

  const getMarksTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      number: "default",
      grade: "secondary",
      none: "outline",
    };
    return variants[type] || "outline";
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const classInfo = classData?.data;
  const hasActiveFilters = searchTerm !== "" || typeFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-4 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {classInfo ? (
              <>
                {classInfo.name} - Section {classInfo.section}
                {classInfo.classTeacher && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Class Teacher: {classInfo.classTeacher.name}
                  </span>
                )}
              </>
            ) : (
              "Manage subjects for this class"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedSubjects.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete {selectedSubjects.length} selected
            </Button>
          )}
          <Button
            onClick={() =>
              openCreateSubjectModal({
                classId,
                sessionId: Number(sessionId),
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {typeFilter !== "all" && (
                  <Badge variant="secondary" className="ml-1 rounded-sm px-1">
                    {typeFilter}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                All Subjects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("core")}>
                Core Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("optional")}>
                Optional Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("elective")}>
                Elective Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchTerm}"
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => setSearchTerm("")}
                />
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 capitalize">
                Type: {typeFilter}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => setTypeFilter("all")}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </p>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedSubjects.length === filteredSubjects.length &&
                      filteredSubjects.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Marks Type</TableHead>
                <TableHead>Components</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <BookOpen className="w-8 h-8 mb-2" />
                      <p>No subjects found</p>
                      {hasActiveFilters ? (
                        <Button variant="link" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      ) : (
                        <Button
                          variant="link"
                          onClick={() =>
                            openCreateSubjectModal({
                              classId,
                              sessionId: Number(sessionId),
                            })
                          }
                        >
                          Add your first subject
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((subject) => (
                  <TableRow
                    key={subject.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      router.push(`/classes/${classId}/subjects/${subject.id}`)
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => handleSelect(subject.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        {subject.name}
                        {(subject.isOptional || subject.isElective) && (
                          <div className="flex gap-1 mt-1">
                            {subject.isOptional && (
                              <Badge variant="outline" className="text-xs">
                                Optional
                              </Badge>
                            )}
                            {subject.isElective && (
                              <Badge variant="outline" className="text-xs">
                                Elective
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getMarksTypeBadgeVariant(subject.marksType)}
                        className="font-normal"
                      >
                        {subject.marksType}
                      </Badge>
                    </TableCell>
                    <TableCell>{subject.components?.length || 0}</TableCell>
                    <TableCell>
                      {subject.components?.reduce(
                        (acc, comp) => acc + (comp.batches?.length || 0),
                        0,
                      ) || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {(() => {
                          // Get unique teachers from all batches
                          const uniqueTeachers =
                            subject.components
                              ?.flatMap((comp) =>
                                comp.batches
                                  ?.map((batch) => batch.teacher)
                                  .filter(Boolean),
                              )
                              .filter(
                                (teacher, index, self) =>
                                  // Filter unique teachers by ID
                                  index ===
                                  self.findIndex((t) => t?.id === teacher?.id),
                              ) || [];

                          if (uniqueTeachers.length === 0) {
                            return (
                              <span className="text-xs text-muted-foreground">
                                No teachers
                              </span>
                            );
                          }

                          return (
                            <>
                              <div className="flex items-center gap-1 text-xs font-medium">
                                <span>{uniqueTeachers.length}</span>
                                <span className="text-muted-foreground">
                                  teacher
                                  {uniqueTeachers.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {subject.isOptional
                        ? "Optional"
                        : subject.isElective
                          ? "Elective"
                          : "Core"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/classes/${classId}/subjects/${subject.id}`,
                              )
                            }
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              openEditSubjectModal({
                                classId,
                                subjectId: subject.id,
                              })
                            }
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSubjectToDelete(subject.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {subjectToDelete
                ? "This will permanently delete this subject and all its components and batches."
                : `This will permanently delete ${selectedSubjects.length} subjects and all their components and batches.`}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (subjectToDelete) {
                  handleDelete(subjectToDelete);
                } else {
                  handleBulkDelete();
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
