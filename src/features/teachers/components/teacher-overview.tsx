"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherDetail } from "@/features/teachers/type.teacher";
import { format } from "date-fns";
import { Mail, Phone, Briefcase, Calendar, GraduationCap } from "lucide-react";

export function TeacherOverview({ teacher }: { teacher: TeacherDetail }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{teacher.email}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{teacher.phone}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>Employee Code: {teacher.employeeCode}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>Qualification: {teacher.qualification}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Joining Date:{" "}
              {teacher.joiningDate
                ? format(new Date(teacher.joiningDate), "PPP")
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Class Teacher Duties</CardTitle>
        </CardHeader>
        <CardContent>
          {teacher.classTeacherOf && teacher.classTeacherOf.length > 0 ? (
            <ul className="space-y-2">
              {teacher.classTeacherOf.map((cls) => (
                <li
                  key={cls.id}
                  className="rounded-md border p-3 text-sm font-medium"
                >
                  {cls.displayName || `${cls.name} - ${cls.section}`}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Not assigned as a class teacher.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
