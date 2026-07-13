"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  useTeacher,
  useTeacherCrud,
} from "@/features/teachers/hooks.teacher";
import { Button } from "@/components/ui/button";
import { TeacherFormDialog } from "@/components/modal/teacher.form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, ShieldBan, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherOverview } from "@/features/teachers/components/teacher-overview";
import { TeacherSubjects } from "@/features/teachers/components/teacher-subjects";
import { TeacherTimetable } from "@/features/teachers/components/teacher-timetable";
import { TeacherExams } from "@/features/teachers/components/teacher-exams";
import { PageHeader } from "@/components/ui/page-header";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const teacherId = Number(id);

  const { data, isLoading } = useTeacher(teacherId);
  const { updateTeacherMutation, toggleTeacherStatusMutation } = useTeacherCrud();

  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-muted-foreground animate-pulse">Loading teacher details...</div>
      </div>
    );
  }

  const teacher = data?.data;

  if (!teacher) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 p-8">
        <div className="text-xl font-semibold">Teacher not found</div>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const toggleStatus = () => {
    toggleTeacherStatusMutation.mutate({
      teacherId,
      isActive: !teacher.isActive,
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader title="Teacher Details" description="View and manage teacher profile and assignments." />
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
            <AvatarImage src={teacher.profilePic || undefined} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{teacher.name}</h2>
              <Badge variant={teacher.isActive ? "default" : "destructive"}>
                {teacher.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{teacher.email}</p>
            <div className="flex gap-2 pt-1">
              <Badge variant="outline" className="text-xs">
                {teacher.employeeCode}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {teacher.role}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={toggleStatus}>
            {teacher.isActive ? (
              <>
                <ShieldBan className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        value={currentTab} 
        onValueChange={(val) => router.push(`?tab=${val}`, { scroll: false })} 
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="exams">Exam Duties</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-0">
          <TeacherOverview teacher={teacher} />
        </TabsContent>
        <TabsContent value="timetable" className="mt-0">
          <TeacherTimetable teacherId={teacherId} />
        </TabsContent>
        <TabsContent value="subjects" className="mt-0">
          <TeacherSubjects teacherId={teacherId} />
        </TabsContent>
        <TabsContent value="exams" className="mt-0">
          <TeacherExams teacherId={teacherId} />
        </TabsContent>
      </Tabs>

      <TeacherFormDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={() => {}}
        initial={teacher}
        onUpdate={(id, formData) =>
          updateTeacherMutation.mutate(
            { teacherId: Number(id), ...formData },
            {
              onSuccess: () => {
                setOpen(false);
              },
            },
          )
        }
        isUpdatePending={updateTeacherMutation.isPending}
      />
    </div>
  );
}
