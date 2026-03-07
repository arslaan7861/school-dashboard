"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  Users,
  Heart,
  Edit,
  Loader2,
  BookOpen,
  Clock,
  Award,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuthStore } from "@/store/authStore";
import { useStudent } from "@/features/students/hooks.student";
import { StudentSubjectsTab } from "@/components/pages/student/StudentSubjectsTab";

// Helper to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not provided";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Number(params.studentId);
  const { user } = useAuthStore();
  const sessionId = useAuthStore((s) => s.activeSessionId);

  const [activeTab, setActiveTab] = useState("overview");

  // Fetch student data
  const { data: student, isLoading } = useStudent(studentId, Number(sessionId));

  const isAdmin = user?.role === "admin";

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full w-full space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        <Separator />

        {/* Profile Card Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Student not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/students")}
            >
              Go back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/students")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {student.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {student.admissionNo} • Joined{" "}
              {formatDate(student.createdAt).split(",")[0]}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/students/${studentId}/edit`)}
          >
            <Edit className="h-3 w-3 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Separator />

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 border-2 border-muted">
              <AvatarImage src={student.user?.profilePic || undefined} />
              <AvatarFallback className="bg-primary/5 text-primary text-lg">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>

            {/* Basic Info Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </p>
                <p className="text-sm font-medium truncate">
                  {student.user?.email || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </p>
                <p className="text-sm font-medium">
                  {student.user?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date of Birth
                </p>
                <p className="text-sm font-medium">
                  {formatDate(student.dob).split(",")[0]}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Gender
                </p>
                <p className="text-sm font-medium capitalize">
                  {student.gender || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-xs sm:text-sm">
            Subjects
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="exams" className="text-xs sm:text-sm">
            Exams
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Personal Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Admission No
                    </p>
                    <p className="text-sm font-medium">{student.admissionNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="text-sm font-medium capitalize">
                      {student.gender || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(student.dob)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="text-sm font-medium">
                      {student.dob
                        ? new Date().getFullYear() -
                          new Date(student.dob).getFullYear()
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">
                      {student.user?.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">
                      {student.user?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Father's Details */}
            {(student.fatherName || student.fatherPhone) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Father's Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {student.fatherName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm font-medium">
                          {student.fatherName}
                        </p>
                      </div>
                    )}
                    {student.fatherPhone && (
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">
                          {student.fatherPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mother's Details */}
            {(student.motherName || student.motherPhone) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Mother's Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {student.motherName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm font-medium">
                          {student.motherName}
                        </p>
                      </div>
                    )}
                    {student.motherPhone && (
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">
                          {student.motherPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guardian's Details */}
            {(student.guardianName || student.guardianPhone) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Guardian's Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {student.guardianName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm font-medium">
                          {student.guardianName}
                        </p>
                      </div>
                    )}
                    {student.guardianPhone && (
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">
                          {student.guardianPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <StudentSubjectsTab
            studentId={studentId}
            classStudentId={student.classRelation?.id}
            isAdmin={isAdmin}
          />
        </TabsContent>

        {/* Attendance Tab - Empty for now */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Attendance Records
              </CardTitle>
              <CardDescription>
                Student's attendance history and statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm font-medium mb-1">
                No attendance records
              </h3>
              <p className="text-xs text-muted-foreground max-w-[300px]">
                Attendance tracking will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab - Empty for now */}
        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                Exam Results
              </CardTitle>
              <CardDescription>
                Student's exam performance and grades
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm font-medium mb-1">No exam records</h3>
              <p className="text-xs text-muted-foreground max-w-[300px]">
                Exam management will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
