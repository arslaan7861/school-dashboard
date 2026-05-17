"use client";

import { useRouter } from "next/navigation";
import { Users, ArrowRight, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useStudentsByClass } from "@/features/students/hooks.student";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StudentsTab({ classId }: { classId: string }) {
  const router = useRouter();

  const { data, isLoading } = useStudentsByClass({
    classId: Number(classId),
    page: 1,
    limit: 10,
  });

  const students = data?.students || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!students.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No students found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}

      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Students
        </CardTitle>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/classes/${classId}/students`)}
        >
          Class Students Page
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Aadhaar No</TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead>Father</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students.map((student) => {
              const rollNo = student.classRelation?.rollNumber || "—";

              return (
                <TableRow key={student.id}>
                  {/* Student */}

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={student.user?.profilePic || undefined}
                        />
                        <AvatarFallback>
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>

                        <span className="text-xs text-muted-foreground">
                          {student.user?.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Roll */}

                  <TableCell>{rollNo}</TableCell>
                  <TableCell>{student.aadhaarNumber}</TableCell>

                  {/* Admission */}

                  <TableCell>{student.admissionNo}</TableCell>

                  {/* Father */}

                  <TableCell>{student.fatherName || "—"}</TableCell>

                  {/* Phone */}

                  <TableCell>{student.fatherPhone || "—"}</TableCell>

                  {/* Action */}

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/students/${student.id}`)}
                    >
                      View
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default StudentsTab;
