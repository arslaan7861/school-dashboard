"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  Calendar,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  School,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useClasses, useClassCrud } from "@/features/class/hooks.class";
import { useSessions } from "@/features/session/hooks.session";
import { ClassType } from "@/features/class/types.class";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export default function ClassesPage() {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingClass, setDeletingClass] = useState<ClassType | null>(null);
  const [search, setSearch] = useState("");
  const activeSessionId = useAuthStore((s) => s.activeSessionId);
  const [selectedSession, setSelectedSession] = useState<string>("");

  // Fetch sessions for dropdown
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const sessions = sessionsData?.data || [];

  // Set default session to active session or first session
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(
        activeSessionId
          ? activeSessionId.toString()
          : sessions[0].id.toString(),
      );
    }
  }, [sessions, activeSessionId]);

  // Fetch classes for selected session
  const { data, isLoading } = useClasses(
    selectedSession ? Number(selectedSession) : undefined,
    search,
  );
  const { deleteClassMutation } = useClassCrud(
    selectedSession ? Number(selectedSession) : undefined,
  );

  const classes: ClassType[] = data?.data || [];

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(search.toLowerCase()) ||
      cls.section.toLowerCase().includes(search.toLowerCase()) ||
      cls.classTeacher?.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalClasses = classes.length;
  const totalSubjects = classes.reduce(
    (acc, cls) => acc + (cls.subjects?.length || 0),
    0,
  );

  const handleDelete = async () => {
    if (!deletingClass) return;
    try {
      await deleteClassMutation.mutateAsync(deletingClass.id);
      toast.success("Class deleted successfully");
      setOpenDeleteDialog(false);
      setDeletingClass(null);
    } catch (error) {
      toast.error("Failed to delete class");
    }
  };

  if (sessionsLoading) {
    return (
      <div className="space-y-6 pt-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[250px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Class Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage classes, sections, and subjects
            </p>
          </div>

          <Link href="/classes/create">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Classes
                </p>
                <p className="text-3xl font-bold">{totalClasses}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <School className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Subjects
                </p>
                <p className="text-3xl font-bold">{totalSubjects}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Session
                </p>
                <p className="text-3xl font-bold">
                  {sessions.find(
                    (s: any) => s.id.toString() === selectedSession,
                  )?.name || "N/A"}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Classes Directory</CardTitle>
              <CardDescription>
                Browse and manage classes for the selected academic session
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedSession}
                onValueChange={(value) => setSelectedSession(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session: any) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.name}
                      {session.isActive && (
                        <Badge variant="default" className="ml-2">
                          Active
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search classes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={openDeleteDialog}
            onOpenChange={setOpenDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  class "{deletingClass?.name} - {deletingClass?.section}" and
                  all associated subjects and student records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Classes Grid */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[250px]" />
              ))}
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No classes found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {search
                  ? "No classes match your search criteria"
                  : "Get started by creating your first class"}
              </p>
              {!search && (
                <Link href="/classes/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Class
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((cls) => {
                const initials = `${cls.name[0]}${cls.section[0]}`;

                return (
                  <Card
                    key={cls.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-200 group border hover:border-primary/50 hover:bg-primary/10 relative cursor-pointer"
                    onClick={() => router.push(`/classes/${cls.id}`)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg">
                              {cls.name} - {cls.section}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Class Teacher:{" "}
                              {cls.classTeacher?.name || "Not assigned"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>

                      {/* Subjects Preview */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Subjects</span>
                          <Badge variant="outline" className="ml-auto">
                            {cls.subjects?.length || 0}
                          </Badge>
                        </div>
                        {cls.subjects && cls.subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {cls.subjects.slice(0, 3).map((subject) => (
                              <Badge
                                key={subject.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {subject.name}
                              </Badge>
                            ))}
                            {cls.subjects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{cls.subjects.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No subjects
                          </p>
                        )}
                      </div>

                      {/* Actions Dropdown */}
                      <div className="absolute bottom-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/classes/${cls.id}`);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/classes/${cls.id}/edit`);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingClass(cls);
                                setOpenDeleteDialog(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
