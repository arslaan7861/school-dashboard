"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  BookOpen,
  Share2,
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

// Helper to safely parse query param
const parseQueryParam = (param: string | null, defaultValue: any = "") => {
  if (!param) return defaultValue;

  if (defaultValue === false && param === "true") return true;
  if (defaultValue === true && param === "false") return false;
  if (typeof defaultValue === "number") return parseInt(param) || defaultValue;

  return param;
};

export default function StudentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, activeSessionId } = useAuthStore();

  // Initialize filters from URL
  const getInitialFilters = (): StudentFilterForm => ({
    classId: parseQueryParam(searchParams.get("classId"), ""),
    showUnenrolled: parseQueryParam(searchParams.get("showUnenrolled"), false),
    search: parseQueryParam(searchParams.get("search"), ""),
  });

  const getInitialPage = () => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam) : 1;
  };

  // Filter state
  const [filters, setFilters] = useState<StudentFilterForm>(getInitialFilters);
  const [page, setPage] = useState(getInitialPage);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] =
    useState<StudentListItem | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Update URL when filters or page change
  const updateUrlParams = useCallback(
    (newFilters: StudentFilterForm, newPage: number) => {
      const params = new URLSearchParams();

      if (newFilters.classId) {
        params.set("classId", newFilters.classId);
      }
      if (newFilters.showUnenrolled) {
        params.set("showUnenrolled", "true");
      }
      if (newFilters.search) {
        params.set("search", newFilters.search);
      }
      if (newPage > 1) {
        params.set("page", newPage.toString());
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Use replace to avoid adding to browser history for every filter change
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router],
  );

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
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const newPage = 1;
    setPage(newPage);
    updateUrlParams(newFilters, newPage);
  };

  const handleClearFilters = () => {
    const newFilters = {
      classId: "",
      showUnenrolled: false,
      search: "",
    };
    setFilters(newFilters);
    setSearchInput("");
    setPage(1);
    updateUrlParams(newFilters, 1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(filters, newPage);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        const newFilters = { ...filters, search: searchInput };
        setFilters(newFilters);
        const newPage = 1;
        setPage(newPage);
        updateUrlParams(newFilters, newPage);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, filters, updateUrlParams]);

  // Sync state with URL changes (for browser back/forward)
  useEffect(() => {
    const newFilters = getInitialFilters();
    const newPage = getInitialPage();

    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFilters(newFilters);
    }
    if (newPage !== page) {
      setPage(newPage);
    }
    if (newFilters.search !== searchInput) {
      setSearchInput(newFilters.search);
    }
  }, [searchParams]); // Re-run when URL changes

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
      // Refresh data after delete
      refetch();
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
      refetch();
    } catch (error) {
      // Error handled in mutation
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Share current view URL
  const handleShareView = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Current view URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Students
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage student records and class assignments
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleShareView}
            size="default"
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          {isAdmin && (
            <Button
              onClick={() => router.push("/students/create")}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Student</span>
            </Button>
          )}
        </div>
      </div>

      {/* Unified Filter Bar - Compact and always visible */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 py-3 border-b">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search - Full width on mobile */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, admission no, email, or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 h-10"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchInput("")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Filter Group */}
          <div className="flex flex-wrap gap-2">
            {/* Class Filter */}
            <Select
              value={filters.classId}
              onValueChange={(value) =>
                handleFilterChange("classId", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[140px] h-10">
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

            {/* Status Filter Dropdown */}
            <Select
              value={filters.showUnenrolled ? "unenrolled" : "all"}
              onValueChange={(value) =>
                handleFilterChange("showUnenrolled", value === "unenrolled")
              }
            >
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="unenrolled">Unenrolled Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count Badge */}
            <div className="hidden md:flex items-center px-3 h-10 rounded-md bg-muted/50 text-sm">
              <span className="font-medium">
                {pagination?.totalRecords || 0}
              </span>
              <span className="text-muted-foreground ml-1">students</span>
            </div>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isFetching}
              className="h-10 w-10"
              title="Refresh"
            >
              <RefreshCw
                className={cn("h-4 w-4", isFetching && "animate-spin")}
              />
            </Button>

            {/* Clear Filters Button - Only shows when filters are active */}
            {(filters.classId || filters.search || filters.showUnenrolled) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-10 gap-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar - Sleeker design */}
      {selectedStudents.length > 0 && isAdmin && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Checkbox className="w-4 h-4" checked />
            </div>
            <span className="text-sm font-medium">
              {selectedStudents.length} student
              {selectedStudents.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStudents([])}
            >
              Cancel
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
                  <TableHead>Aadhaar No.</TableHead>
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
                      <TableCell>{student.aadhaarNumber || "-"}</TableCell>
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
                          {!student.user?.phone && <p className="text-xs">-</p>}
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
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                      if (pageNum > pagination.totalPages || pageNum < 1) {
                        return null;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8"
                          onClick={() => handlePageChange(pageNum)}
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
                  onClick={() => handlePageChange(page + 1)}
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
