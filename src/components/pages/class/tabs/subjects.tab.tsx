"use client";

import { useRouter } from "next/navigation";
import { BookOpen, ArrowRight, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSubjectsByClass } from "@/features/subjects/hooks.subject";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SubjectsTab({ classId }: { classId: number }) {
  const router = useRouter();
  const { data, isLoading } = useSubjectsByClass(classId);

  const subjects = data || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!subjects.length) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Subjects
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/classes/${classId}/subjects`)}
          >
            Class Subjects Page
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No subjects found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          Subjects
        </CardTitle>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/classes/${classId}/subjects`)}
        >
          Class Subjects Page
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Teachers</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {subjects.map((subject) => {
              const type = subject.isOptional
                ? "Optional"
                : subject.isElective
                  ? "Elective"
                  : "Core";

              // Collect unique teachers
              const teachersMap = new Map();

              subject.components?.forEach((component) => {
                component.batches?.forEach((batch) => {
                  if (batch.teacher) {
                    teachersMap.set(batch.teacher.id, batch.teacher);
                  }
                });
              });

              const teachers = Array.from(teachersMap.values());

              return (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>

                  {/* Teachers */}

                  <TableCell>
                    {teachers.length ? (
                      <div className="flex items-center gap-2">
                        {teachers.slice(0, 3).map((teacher) => (
                          <Avatar key={teacher.id} className="h-7 w-7 border">
                            <AvatarImage src={teacher.profilePic} />
                            <AvatarFallback>
                              {getInitials(teacher.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}

                        <span className="text-sm text-muted-foreground">
                          {teachers.map((t) => t.name).join(", ")}
                        </span>

                        {teachers.length > 3 && (
                          <Badge variant="secondary">
                            +{teachers.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Not assigned
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{type}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{subject.marksType}</Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(
                          `/classes/${classId}/subjects/${subject.id}`,
                        )
                      }
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

export default SubjectsTab;
