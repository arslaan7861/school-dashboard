"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  useStudents,
  useStudentMutations,
} from "@/features/students/hooks.student";
import { useAuthStore } from "@/store/authStore";
import {
  StudentFilterForm,
  StudentListItem,
} from "@/features/students/types.student";

// Helper to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function StudentsPage() {
  const router = useRouter();
  const { user, activeSessionId } = useAuthStore();

  // Filter state
  const [filters, setFilters] = useState<StudentFilterForm>({
    classId: "",
    showUnenrolled: false,
    search: "",
  });
  const [page, setPage] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] =
    useState<StudentListItem | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch students data
  const { data, isLoading, isFetching, refetch } = useStudents({
    sessionId: Number(activeSessionId),
    classId: filters.classId ? Number(filters.classId) : undefined,
    showUnenrolled: filters.showUnenrolled,
    search: filters.search || undefined,
    page,
    limit: 10,
  });

  const { deleteStudentAsync, isDeleting } = useStudentMutations();

  const students = data?.students || [];
  const classes = data?.classes || [];
  const pagination = data?.pagination;

  // Handle filter changes
  const handleFilterChange = (key: keyof StudentFilterForm, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({
      classId: "",
      showUnenrolled: false,
      search: "",
    });
    setPage(1);
  };

  // Handle search with debounce
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange("search", searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle selection
  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  // Handle delete
  const handleDeleteClick = (student: StudentListItem) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudentAsync(studentToDelete.id);
      toast.success(`${studentToDelete.name} deleted successfully`);
      setSelectedStudents((prev) =>
        prev.filter((id) => id !== studentToDelete.id),
      );
    } catch (error) {
      // Error handled in mutation
    } finally {
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedStudents.map((id) => deleteStudentAsync(id)));
      toast.success(`${selectedStudents.length} students deleted successfully`);
      setSelectedStudents([]);
    } catch (error) {
      // Error handled in mutation
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (!activeSessionId) {
    return (
      <div className="h-full w-full">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto mb-6 flex items-center justify-center">
                <Users className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-semibold text-amber-800 mb-3">
                No Active Session
              </h2>
              <p className="text-amber-600/80 mb-6">
                Please select an active academic session to view and manage
                students.
              </p>
              <Button
                onClick={() => router.push("/dashboard/sessions")}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Go to Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              {pagination && (
                <Badge variant="outline" className="ml-2">
                  {pagination.totalRecords} Total
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Manage student records and class assignments
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => router.push("/students/create")}
            className="shrink-0"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden"
            >
              {isFilterOpen ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent
          className={cn("space-y-4", !isFilterOpen && "hidden lg:block")}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission no, email, phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-20"
              />
              {searchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => {
                    setSearchInput("");
                    handleFilterChange("search", "");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Class Filter */}
            <Select
              value={filters.classId}
              onValueChange={(value) =>
                handleFilterChange("classId", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Unenrolled Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showUnenrolled"
                checked={filters.showUnenrolled}
                onCheckedChange={(checked) =>
                  handleFilterChange("showUnenrolled", checked === true)
                }
              />
              <Label htmlFor="showUnenrolled">
                Show unenrolled students only
              </Label>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>

          {/* Active Filters Display */}
          {(filters.classId || filters.search || filters.showUnenrolled) && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {filters.classId && (
                <Badge variant="secondary" className="gap-1">
                  Class:{" "}
                  {
                    classes.find((c) => c.id.toString() === filters.classId)
                      ?.displayName
                  }
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => handleFilterChange("classId", "")}
                  />
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{filters.search}"
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => {
                      setSearchInput("");
                      handleFilterChange("search", "");
                    }}
                  />
                </Badge>
              )}
              {filters.showUnenrolled && (
                <Badge variant="secondary" className="gap-1">
                  Unenrolled only
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => handleFilterChange("showUnenrolled", false)}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results count and refresh */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {students.length} of {pagination?.totalRecords || 0}{" "}
              students
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={cn("w-4 h-4", isFetching && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && isAdmin && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedStudents.length} student
            {selectedStudents.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStudents([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {isAdmin && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedStudents.length === students.length &&
                          students.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {isAdmin && (
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 8 : 7}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No students found
                        </p>
                        {(filters.classId ||
                          filters.search ||
                          filters.showUnenrolled) && (
                          <Button
                            variant="link"
                            onClick={handleClearFilters}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow
                      key={student.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/students/${student.id}`)}
                    >
                      {isAdmin && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() =>
                              handleSelectStudent(student.id)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarImage
                              src={student.user?.profilePic || undefined}
                            />
                            <AvatarFallback className="bg-primary/5 text-primary">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {student.admissionNo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.class ? (
                          <div>
                            <p className="text-sm">
                              {student.class.name} - {student.class.section}
                            </p>
                          </div>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700"
                          >
                            Not Assigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.classRelation?.rollNumber || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {student.user?.phone && (
                            <p className="text-xs">{student.user.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.user?.isActive ? "default" : "secondary"
                          }
                          className={cn(
                            student.user?.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                          )}
                        >
                          {student.user?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/students/${student.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/students/${student.id}/edit`)
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(student)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum = i + 1;
                      if (pagination.totalPages > 5) {
                        if (page > 3) {
                          pageNum = page - 3 + i;
                        }
                        if (page > pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        }
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8"
                          onClick={() => setPage(pageNum)}
                          disabled={isFetching}
                        >
                          {pageNum}
                        </Button>
                      );
                    },
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pagination.totalPages || isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete {selectedStudents.length > 1 ? "Students" : "Student"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {selectedStudents.length > 1 ? (
                <p>
                  Are you sure you want to delete {selectedStudents.length}{" "}
                  students? This action cannot be undone.
                </p>
              ) : studentToDelete ? (
                <>
                  <p>
                    Are you sure you want to delete {studentToDelete.name}? This
                    action cannot be undone.
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(studentToDelete.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{studentToDelete.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {studentToDelete.admissionNo}
                        </p>
                      </div>
                    </div>
                    {studentToDelete.class && (
                      <p className="text-xs text-muted-foreground">
                        {studentToDelete.class.name} -{" "}
                        {studentToDelete.class.section}
                        {studentToDelete.classRelation &&
                          ` (Roll: ${studentToDelete.classRelation.rollNumber})`}
                      </p>
                    )}
                  </div>
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                selectedStudents.length > 1
                  ? handleBulkDelete
                  : handleDeleteConfirm
              }
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
