"use client";

import { useState } from "react";
import {
  Plus,
  Mail,
  Phone,
  GraduationCap,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  Users,
  Award,
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
import { toast } from "sonner";
import { Teacher } from "@/features/teachers/type.teacher";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TeachersPage() {
  const router = useRouter();
  const { data, isLoading } = useTeachers();
  const { createTeacherMutation } = useTeacherCrud();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const teachers: Teacher[] = data?.data?.teachers ?? [];

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
      teacher.qualification?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalTeachers = teachers.length;
  const qualifiedTeachers = teachers.filter(
    (t) => t.qualification && t.qualification.trim().length > 0,
  ).length;

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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <div className="space-y-6 pt-4">
      {/* HEADER SECTION */}
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
                  Qualified Faculty
                </p>
                <p className="text-3xl font-bold">{qualifiedTeachers}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Award className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Experience
                </p>
                <p className="text-3xl font-bold">-</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TEACHERS LIST SECTION */}
      <Card className="min-h-[60vh]">
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
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* CREATE DIALOG */}
          <TeacherFormDialog
            open={open}
            onOpenChange={setOpen}
            onCreate={(data) =>
              createTeacherMutation.mutate(data, {
                onSuccess: () => {
                  toast.success("Teacher added successfully!");
                  setOpen(false);
                },
              })
            }
            onUpdate={() => {}}
          />

          {/* VIEW DETAILS DIALOG */}

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
                    className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group border hover:border-primary/20"
                    onClick={() => router.push(`/teachers/${teacher.id}`)}
                  >
                    <CardContent className="p-6">
                      {/* TEACHER HEADER WITH BETTER LAYOUT */}
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                          {/* <AvatarImage src={teacher.avatar} /> */}
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                                {teacher.name}
                              </h3>

                              {/* QUALIFICATION BADGE BESIDE NAME */}
                              {teacher.qualification && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs border-green-500/30 text-green-600 bg-green-50"
                                >
                                  <GraduationCap className="w-3 h-3 mr-1" />
                                  Qualified
                                </Badge>
                              )}
                            </div>

                            {/* VIEW BUTTON - ONLY VISIBLE ON HOVER */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-all duration-200 -mt-1 -mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/teachers/${teacher.id}`);
                              }}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* CONTACT INFO WITH ICONS */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2 min-w-0">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {teacher.email}
                                </span>
                              </div>
                            </div>

                            {teacher.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{teacher.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* QUALIFICATIONS SECTION - BETTER VISUAL HIERARCHY */}
                      {educationList.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Education
                            </span>
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs"
                            >
                              {educationList.length}{" "}
                              {educationList.length === 1
                                ? "degree"
                                : "degrees"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {educationList.slice(0, 3).map((edu, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-100"
                              >
                                {edu}
                              </Badge>
                            ))}
                            {educationList.length > 3 && (
                              <Badge
                                variant="outline"
                                className="px-3 py-1 text-xs border-dashed"
                              >
                                +{educationList.length - 3} more
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
