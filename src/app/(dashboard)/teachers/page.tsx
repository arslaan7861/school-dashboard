"use client";

import { useState } from "react";
import {
  Plus,
  Mail,
  Phone,
  GraduationCap,
  Search,
  Filter,
  Users,
  Award,
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
  Power,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useTeacherCrud, useTeachers } from "@/features/teachers/hooks.teacher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TeacherFormDialog } from "@/components/modal/teacher.form";
import { Teacher } from "@/features/teachers/type.teacher";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function TeachersPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useTeachers();
  const {
    createTeacherMutation,
    updateTeacherMutation,
    deleteTeacherMutation,
    toggleTeacherStatusMutation,
  } = useTeacherCrud();

  const [open, setOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [search, setSearch] = useState("");

  const teachers: Teacher[] = data?.data.teachers ?? [];

  // Parse education string into array
  const parseEducation = (education: string) => {
    return education
      .split(",")
      .map((edu) => edu.trim())
      .filter((edu) => edu.length > 0);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.toLowerCase()) ||
      teacher.phone?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.qualification?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.employeeCode?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.isActive).length;

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setOpen(true);
  };

  const handleDelete = async (teacher: Teacher) => {
    await deleteTeacherMutation.mutateAsync(teacher.id);
    setDeletingTeacher(null);
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    await toggleTeacherStatusMutation.mutateAsync({
      teacherId: teacher.id,
      isActive: !teacher.isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-4 border-b">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Faculty Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage teachers, qualifications, and faculty information
          </p>
        </div>

        <Button onClick={() => setOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </Button>
      </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Teachers
                </p>
                <p className="text-3xl font-bold">{totalTeachers}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Teachers
                </p>
                <p className="text-3xl font-bold">{activeTeachers}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  With Profile Images
                </p>
                <p className="text-3xl font-bold">
                  {teachers.filter((t) => t.profilePic).length}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TEACHERS LIST SECTION */}
      <Card className="min-h-[65vh]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Faculty Directory</CardTitle>
              <CardDescription>
                Browse and manage teaching staff
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search teachers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-[350px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* CREATE/EDIT DIALOG */}
          <TeacherFormDialog
            open={open}
            onOpenChange={(state) => {
              setOpen(state);
              if (!state) setEditingTeacher(null);
            }}
            initial={editingTeacher}
            onCreate={async (data, form) => {
              await createTeacherMutation.mutateAsync(data);
              setOpen(false);
            }}
            onUpdate={async (id, data, form) => {
              await updateTeacherMutation.mutateAsync({
                teacherId: Number(id),
                ...data,
              });
              setOpen(false);
            }}
            isCreatePending={createTeacherMutation.isPending}
            isUpdatePending={updateTeacherMutation.isPending}
          />

          {/* DELETE CONFIRMATION DIALOG */}
          <AlertDialog
            open={!!deletingTeacher}
            onOpenChange={() => setDeletingTeacher(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  teacher "{deletingTeacher?.name}" and remove all associated
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant={"destructive"}
                  onClick={() =>
                    deletingTeacher && handleDelete(deletingTeacher)
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* TEACHERS GRID */}
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No teachers found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {search
                  ? "No teachers match your search criteria"
                  : "Get started by adding your first teacher"}
              </p>
              {!search && (
                <Button onClick={() => setOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Teacher
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredTeachers.map((teacher) => {
                const initials = teacher.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const educationList = teacher.qualification
                  ? parseEducation(teacher.qualification)
                  : [];

                return (
                  <Card
                    key={teacher.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-200 group border hover:border-primary/20 relative cursor-pointer"
                    onClick={() => router.push(`/teachers/${teacher.id}`)}
                  >
                    <CardContent className="">
                      {/* TEACHER HEADER */}
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                          <AvatarImage src={teacher.profilePic || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                            {teacher.name}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {teacher.employeeCode}
                          </p>
                          {teacher.classCount! > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs mt-1"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Class Teacher of {teacher.classCount}{" "}
                              {teacher.classCount === 1 ? "class" : "classes"}
                            </Badge>
                          )}
                        </div>

                        {/* Chevron that appears on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ChevronRight className="w-5 h-5 text-primary" />
                        </div>
                      </div>

                      {/* CONTACT INFO */}
                      <div className="mt-4 space-y-2 relative">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </div>

                        {teacher.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{teacher.phone}</span>
                          </div>
                        )}

                        <div className="absolute bottom-0 gap-1 right-0 flex items-center">
                          <Badge
                            variant={teacher.isActive ? "default" : "secondary"}
                          >
                            {teacher.isActive ? "Active" : "Inactive"}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()} // Prevent card click
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  handleEdit(teacher);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  handleToggleStatus(teacher);
                                }}
                              >
                                <Power className="w-4 h-4 mr-2" />
                                {teacher.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  setDeletingTeacher(teacher);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* QUALIFICATIONS */}
                      {educationList.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex flex-wrap gap-2">
                            {educationList.slice(0, 2).map((edu, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="px-2 py-0.5 text-xs"
                              >
                                {edu}
                              </Badge>
                            ))}
                            {educationList.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{educationList.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
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
