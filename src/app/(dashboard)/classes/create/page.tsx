"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  Calendar,
  User,
  ArrowLeft,
  AlertCircle,
  Loader2,
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
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useClassCrud } from "@/features/class/hooks.class";
import { useTeachers } from "@/features/teachers/hooks.teacher";
import { useSessions } from "@/features/session/hooks.session";
import {
  createClassSchema,
  createClassSchemaType,
} from "@/features/class/validator.class";
import { useAuthStore } from "@/store/authStore";

// Types
interface Teacher {
  id: number;
  name: string;
  employeeCode: string;
  profilePic?: string;
}

interface Session {
  id: number;
  name: string;
  year: string;
  isActive: boolean;
}

// Custom SelectItem with teacher avatar and name
const TeacherSelectItem = ({ teacher }: { teacher: Teacher }) => {
  const initials = teacher.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SelectItem value={teacher.id.toString()} className="py-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
          <AvatarImage src={teacher.profilePic || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] sm:text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm sm:text-base truncate">
            {teacher.name}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
            {teacher.employeeCode}
          </span>
        </div>
      </div>
    </SelectItem>
  );
};

export default function CreateClassPage() {
  const router = useRouter();
  const { createClassMutation } = useClassCrud();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers();
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions();

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const teachers = (teachersData?.data.teachers as Teacher[]) || [];
  const sessions = sessionsData?.data || [];

  const activeSessionId = useAuthStore((s) => s.activeSessionId);

  const form = useForm<createClassSchemaType>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: "",
      section: "",
      sessionId: activeSessionId ? Number(activeSessionId) : undefined,
      classTeacherId: "",
    },
    mode: "onChange",
  });

  const formValues = form.watch();
  const formErrors = form.formState.errors;

  // Mark field as touched when user interacts with it
  const handleFieldTouch = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  };

  const getSelectedTeacher = (teacherId: string) => {
    return teachers.find((t) => t.id.toString() === teacherId);
  };

  const isFormValid =
    form.formState.isValid &&
    !!form.getValues("name") &&
    !!form.getValues("section") &&
    !!form.getValues("sessionId") &&
    !!form.getValues("classTeacherId");

  const handleSubmit = async (data: createClassSchemaType) => {
    try {
      const response = await createClassMutation.mutateAsync(data);

      // Get the created class ID from response
      const classId = response.data.id;

      toast.success("Class created successfully!");

      // Redirect to create subjects page with the class ID
      router.push(`/classes/${classId}/subjects/create`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create class. Please try again.",
      );
    }
  };

  const isSubmitting = createClassMutation.isPending;

  return (
    <Form {...form}>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 sm:h-10 sm:w-10"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
              Create New Class
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Add a new class. You can add subjects after creating the class.
            </p>
          </div>
        </div>

        {/* MAIN FORM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Class Details
            </CardTitle>
            <CardDescription>
              Enter the basic information for the new class
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          placeholder="e.g., Grade 10"
                          className="h-10"
                          {...field}
                          onBlur={() => handleFieldTouch("name")}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Enter the class name (e.g., Grade 10, Class 5)
                      </FormDescription>
                      {touchedFields.has("name") && <FormMessage />}
                    </FormItem>
                  )}
                />

                {/* SECTION */}
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
                          placeholder="e.g., A"
                          className="h-10"
                          {...field}
                          onBlur={() => handleFieldTouch("section")}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Enter section name (e.g., A, B, C)
                      </FormDescription>
                      {touchedFields.has("section") && <FormMessage />}
                    </FormItem>
                  )}
                />

                {/* SESSION */}
                <FormField
                  control={form.control}
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Session *
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(parseInt(value, 10));
                          handleFieldTouch("sessionId");
                        }}
                        value={field.value?.toString()}
                        disabled={isLoadingSessions || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-10">
                            <SelectValue placeholder="Select session" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingSessions ? (
                            <div className="py-6 text-center">
                              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Loading...
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
                                <div className="flex items-center gap-2">
                                  <span>{session.name}</span>
                                  {session.isActive && (
                                    <Badge className="text-xs bg-green-100 text-green-800">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {touchedFields.has("sessionId") && <FormMessage />}
                    </FormItem>
                  )}
                />

                {/* CLASS TEACHER */}
                <FormField
                  control={form.control}
                  name="classTeacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Class Teacher *
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleFieldTouch("classTeacherId");
                        }}
                        value={field.value || ""}
                        disabled={isLoadingTeachers || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-10">
                            <SelectValue placeholder="Select teacher">
                              {field.value && field.value !== "" && (
                                <div className="flex items-center gap-2">
                                  {getSelectedTeacher(field.value) && (
                                    <>
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={
                                            getSelectedTeacher(field.value)
                                              ?.profilePic || undefined
                                          }
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                          {getSelectedTeacher(field.value)
                                            ?.name.split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="truncate">
                                        {getSelectedTeacher(field.value)?.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingTeachers ? (
                            <div className="py-6 text-center">
                              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Loading...
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
                              <TeacherSelectItem
                                key={teacher.id}
                                teacher={teacher}
                              />
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {touchedFields.has("classTeacherId") && <FormMessage />}
                    </FormItem>
                  )}
                />
              </div>

              {/* FORM ERRORS */}
              {Object.keys(formErrors).length > 0 && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">
                      Please fix the following errors:
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(formErrors).map(([key, error]) => (
                      <li key={key} className="text-sm text-destructive">
                        {error?.message as string}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SUMMARY CARD */}
              <div
                className={cn(
                  "p-4 rounded-lg border",
                  isFormValid
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isFormValid ? "bg-green-500" : "bg-amber-500",
                    )}
                  />
                  <p className="font-medium">
                    {isFormValid ? "Ready to create" : "Incomplete"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {!formValues.name
                    ? "Enter class name"
                    : !formValues.section
                      ? "Enter section"
                      : !formValues.sessionId
                        ? "Select session"
                        : !formValues.classTeacherId
                          ? "Select class teacher"
                          : "All requirements met. You can now create the class."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/classes")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={!isFormValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Class"
            )}
          </Button>
        </div>

        {/* HELPER TEXT */}
        <p className="text-sm text-muted-foreground text-center">
          After creating the class, you'll be redirected to add subjects.
        </p>
      </div>
    </Form>
  );
}
