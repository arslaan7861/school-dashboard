"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, RefreshCw, AlertCircle, User, Plus } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnrolledSubject } from "@/features/studentSubject/types.studentSubject";
import { useEnrolledSubjects } from "@/features/studentSubject/hooks.studentSubject";

interface StudentSubjectsTabProps {
  studentId: number;
  classStudentId?: number;
  isAdmin?: boolean;
}

// Helper to get subject type badge
const getSubjectTypeBadge = (subject: EnrolledSubject) => {
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

export function StudentSubjectsTab({
  studentId,
  classStudentId,
  isAdmin = false,
}: StudentSubjectsTabProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch enrollments
  const {
    data: enrollments,
    isLoading,
    refetch,
  } = useEnrolledSubjects(classStudentId, !!classStudentId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleManageSubjects = () => {
    router.push(`/students/${studentId}/subjects/manage`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Enrolled Subjects
          </CardTitle>
          <CardDescription>Loading enrolled subjects...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No class student ID
  if (!classStudentId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Enrolled Subjects
          </CardTitle>
          <CardDescription>
            Student is not enrolled in any class for the current session
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-sm font-medium mb-1">No Class Assignment</h3>
          <p className="text-xs text-muted-foreground max-w-[300px]">
            This student needs to be assigned to a class before subjects can be
            viewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No enrollments
  if (!enrollments?.subjects || enrollments.subjects.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Enrolled Subjects
            </CardTitle>
            <CardDescription>
              Subjects the student is currently enrolled in
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button size="sm" onClick={handleManageSubjects}>
              <Plus className="h-4 w-4 mr-2" />
              Manage Subjects
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-sm font-medium mb-1">No subjects yet</h3>
          <p className="text-xs text-muted-foreground max-w-[300px]">
            This student is not enrolled in any subjects. Click the 'Manage
            Subjects' button to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { subjects, summary } = enrollments;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{summary.totalSubjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Core Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-blue-600">
              {summary.coreSubjects}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Optional Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-amber-600">
              {summary.optionalSubjects}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Subjects Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Enrolled Subjects
            </CardTitle>
            <CardDescription>
              {subjects.length} subjects with {summary.totalComponents}{" "}
              components
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button size="sm" onClick={handleManageSubjects}>
              <Plus className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {subjects.map((subject) => (
              <Card
                key={subject.subjectId}
                className="border-l-4 border-l-primary overflow-hidden"
              >
                <CardHeader className="py-3 bg-muted/20">
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
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/10">
                        <TableHead className="w-[200px]">Component</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="w-[120px]">Batch</TableHead>
                        <TableHead>Teacher</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subject.components.map((comp) => (
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
                            <Badge variant="secondary" className="font-mono">
                              {comp.selectedBatchName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {comp.teacher ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={comp.teacher.profilePic || undefined}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(comp.teacher.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {comp.teacher.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {comp.teacher.email}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Not assigned
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
