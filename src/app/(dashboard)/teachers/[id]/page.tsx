"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import {
  useTeacher,
  useTeacherCrud,
  useTeachers,
} from "@/features/teachers/hooks.teacher";
import { Button } from "@/components/ui/button";
import { TeacherFormDialog } from "@/components/modal/teacher.form";
import { toast } from "sonner";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const teacherId = Number(id);

  const { data, isLoading } = useTeachers();
  const { updateTeacherMutation } = useTeacherCrud();

  const [open, setOpen] = useState(false);

  const teacher = data?.data.teachers.find((t) => t.id === Number(id));

  if (isLoading) return <div>Loading...</div>;
  if (!teacher) return <div>Not found</div>;

  return (
    <div className="space-y-6 pt-6 max-w-xl">
      <h1 className="text-xl font-semibold">Teacher Details</h1>

      <div className="space-y-2 text-sm">
        <p>
          <b>Name:</b> {teacher.name}
        </p>
        <p>
          <b>Email:</b> {teacher.email}
        </p>
        <p>
          <b>Phone:</b> {teacher.phone}
        </p>
        <p>
          <b>Employee Code:</b> {teacher.employeeCode}
        </p>
        <p>
          <b>Qualification:</b> {teacher.qualification}
        </p>
        <p>
          <b>Joining Date:</b>{" "}
          {new Date(teacher.joiningDate).toLocaleDateString()}
        </p>
      </div>

      <Button onClick={() => setOpen(true)}>Update Teacher</Button>

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
                toast.success("Teacher updated");
                setOpen(false);
              },
            },
          )
        }
      />
    </div>
  );
}
