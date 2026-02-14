"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  User,
  ArrowLeft,
  AlertCircle,
  Trash2,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClassCrud } from "@/features/class/hooks.class";
import { useTeachers } from "@/features/teachers/hooks.teacher";
import { useSessions } from "@/features/session/hooks.session";
import {
  createClassSchema,
  createClassSchemaType,
} from "@/features/class/validator.class";

export default function CreateClassPage() {
  const router = useRouter();
  const { createClassMutation } = useClassCrud();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers();
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const teachers = teachersData?.data || [];
  const sessions = sessionsData?.data || [];

  const form = useForm<createClassSchemaType>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: "",
      section: "",
      subjects: [],
    },
  });

  const subjects = form.watch("subjects");

  const handleSubmit = async (data: createClassSchemaType) => {
    try {
      setIsSubmitting(true);
      await createClassMutation.mutateAsync(data);
      toast.success("Class created successfully!");
      router.push("/classes");
    } catch (error) {
      toast.error("Failed to create class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSubject = () => {
    const currentSubjects = form.getValues("subjects");
    form.setValue("subjects", [
      ...currentSubjects,
      { name: "", teacher_id: 0 },
    ]);
  };

  const removeSubject = (index: number) => {
    const currentSubjects = form.getValues("subjects");
    form.setValue(
      "subjects",
      currentSubjects.filter((_, i) => i !== index),
    );
  };

  const getAvailableTeachers = (currentIndex: number) => {
    const selectedTeachers = subjects
      .map((s, i) => (i === currentIndex ? null : s.teacher_id))
      .filter((id): id is number => id !== null && id !== 0);

    return teachers.filter((teacher) => !selectedTeachers.includes(teacher.id));
  };

  const isFormValid = form.formState.isValid && subjects.length > 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Create New Class
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a new class with subjects and assign teachers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/classes")}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={!isFormValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </>
            )}
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE - FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* FORM TABS */}
          <div className="flex gap-4 border-b pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "basic"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Basic Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subjects")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "subjects"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Subjects
              <Badge variant="outline" className="ml-2">
                {subjects.length}
              </Badge>
            </button>
          </div>

          {/* BASIC INFORMATION TAB */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Class Details
                  </CardTitle>
                  <CardDescription>
                    Enter the basic information for the new class
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CLASS NAME */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Class Name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Grade 10, Senior KG, etc."
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the class name (Grade/Standard)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* SECTION - Changed from Select to Input */}
                        <FormField
                          control={form.control}
                          name="section"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Section *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., A, B, Science, Commerce"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter section name or identifier
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SESSION */}
                        <FormField
                          control={form.control}
                          name="session_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Academic Session *
                              </FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(parseInt(value))
                                }
                                defaultValue={field.value?.toString()}
                                disabled={isLoadingSessions}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select session" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingSessions ? (
                                    <div className="py-6 text-center">
                                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                      <p className="text-sm text-muted-foreground">
                                        Loading sessions...
                                      </p>
                                    </div>
                                  ) : sessions.length === 0 ? (
                                    <div className="py-6 text-center">
                                      <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                      <p className="text-sm text-muted-foreground">
                                        No sessions available
                                      </p>
                                    </div>
                                  ) : (
                                    sessions.map((session) => (
                                      <SelectItem
                                        key={session.id}
                                        value={session.id.toString()}
                                      >
                                        {session.name}
                                        {session.is_active && (
                                          <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                                            Active
                                          </Badge>
                                        )}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Select the academic session
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* CLASS TEACHER */}
                        <FormField
                          control={form.control}
                          name="class_teacher_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Class Teacher *
                              </FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(parseInt(value))
                                }
                                defaultValue={field.value?.toString()}
                                disabled={isLoadingTeachers}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select class teacher" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingTeachers ? (
                                    <div className="py-6 text-center">
                                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                      <p className="text-sm text-muted-foreground">
                                        Loading teachers...
                                      </p>
                                    </div>
                                  ) : teachers.length === 0 ? (
                                    <div className="py-6 text-center">
                                      <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                      <p className="text-sm text-muted-foreground">
                                        No teachers available
                                      </p>
                                    </div>
                                  ) : (
                                    teachers.map((teacher) => (
                                      <SelectItem
                                        key={teacher.id}
                                        value={teacher.id.toString()}
                                      >
                                        {teacher.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Primary teacher responsible for this class
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </Form>
                </CardContent>
              </Card>

              {/* NAVIGATION BUTTON */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setActiveTab("subjects")}
                  disabled={
                    !form.getValues("name") ||
                    !form.getValues("section") ||
                    !form.getValues("session_id") ||
                    !form.getValues("class_teacher_id")
                  }
                >
                  Next: Add Subjects
                  <BookOpen className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* SUBJECTS TAB */}
          {activeTab === "subjects" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Subjects & Teachers
                      </CardTitle>
                      <CardDescription>
                        Add subjects and assign teachers to each subject
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSubject}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subject
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {subjects.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">
                        No subjects added yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add at least one subject to continue
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={addSubject}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Subject
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {subjects.map((_, index) => {
                        const availableTeachers = getAvailableTeachers(index);

                        return (
                          <div
                            key={index}
                            className="p-5 border rounded-xl bg-gradient-to-br from-white to-muted/30 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                  {index + 1}
                                </div>
                                <span className="font-semibold text-lg">
                                  Subject {index + 1}
                                </span>
                              </div>
                              {subjects.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSubject(index)}
                                  className="text-destructive hover:text-destructive/90"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* SUBJECT NAME */}
                              <FormField
                                control={form.control}
                                name={`subjects.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Subject Name *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Mathematics, Science, etc."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* TEACHER ASSIGNMENT */}
                              <FormField
                                control={form.control}
                                name={`subjects.${index}.teacher_id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Subject Teacher *</FormLabel>
                                    <Select
                                      onValueChange={(value) =>
                                        field.onChange(parseInt(value))
                                      }
                                      value={field.value?.toString() || ""}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {availableTeachers.length === 0 ? (
                                          <div className="py-6 text-center">
                                            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                              No available teachers
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              All teachers have been assigned
                                            </p>
                                          </div>
                                        ) : (
                                          availableTeachers.map((teacher) => (
                                            <SelectItem
                                              key={teacher.id}
                                              value={teacher.id.toString()}
                                            >
                                              {teacher.name}
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* DUPLICATE SUBJECT WARNING */}
                      {form.formState.errors.subjects?.message && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-4 rounded-lg">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{form.formState.errors.subjects.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Basic Info
                </Button>
                <Button type="button" onClick={addSubject} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Subject
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - SUMMARY */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Overview of the new class</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Class Name</p>
                  <p className="font-medium">
                    {form.watch("name") || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">
                    {form.watch("section") || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Session</p>
                  <p className="font-medium">
                    {sessions.find((s) => s.id === form.watch("session_id"))
                      ?.name || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Class Teacher</p>
                  <p className="font-medium">
                    {teachers.find(
                      (t) => t.id === form.watch("class_teacher_id"),
                    )?.name || "Not selected"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <Badge variant="outline">{subjects.length}</Badge>
                </div>
                {subjects.length > 0 ? (
                  <div className="space-y-2">
                    {subjects.slice(0, 3).map((subject, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">
                          {subject.name || "Unnamed"}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {teachers.find((t) => t.id === subject.teacher_id)
                            ?.name || "No teacher"}
                        </span>
                      </div>
                    ))}
                    {subjects.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{subjects.length - 3} more subjects
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No subjects added
                  </p>
                )}
              </div>

              <Separator />

              {/* STATUS INDICATOR */}
              <div
                className={`p-3 rounded-lg ${isFormValid ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isFormValid ? "bg-green-500" : "bg-amber-500"}`}
                  />
                  <p className="text-sm font-medium">
                    {isFormValid ? "Ready to create" : "Incomplete"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {!form.getValues("name")
                    ? "Enter class name"
                    : !form.getValues("section")
                      ? "Enter section"
                      : !form.getValues("session_id")
                        ? "Select session"
                        : !form.getValues("class_teacher_id")
                          ? "Select class teacher"
                          : subjects.length === 0
                            ? "Add at least one subject"
                            : "All requirements met"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* HELPER CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                  1
                </div>
                <p>Ensure subject names are unique</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                  2
                </div>
                <p>One teacher can teach multiple subjects</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                  3
                </div>
                <p>Class teacher can also teach subjects</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
