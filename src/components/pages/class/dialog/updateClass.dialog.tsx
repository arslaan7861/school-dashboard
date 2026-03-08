"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, School } from "lucide-react";
import { toast } from "sonner";

import { useClassCrud } from "@/features/class/hooks.class";
import { useTeachers } from "@/features/teachers/hooks.teacher";
import { useSessions } from "@/features/session/hooks.session";
import {
  updateClassSchema,
  updateClassSchemaType,
} from "@/features/class/validator.class";
import { ClassType } from "@/features/class/types.class";

interface UpdateClassDialogProps {
  classData: ClassType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function UpdateClassDialog({
  classData,
  open,
  onOpenChange,
  onSuccess,
}: UpdateClassDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateClassMutation } = useClassCrud();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers();
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions();

  const teachers = teachersData?.data?.teachers || [];
  const sessions = sessionsData?.data || [];

  const form = useForm<updateClassSchemaType>({
    resolver: zodResolver(updateClassSchema),
    defaultValues: {
      name: classData.name,
      section: classData.section,
      sessionId: Number(classData.sessionId),
      classTeacherId: classData.classTeacherId,
    },
  });

  // Reset form when classData changes
  useEffect(() => {
    if (classData) {
      form.reset({
        name: classData.name,
        section: classData.section,
        sessionId: Number(classData.sessionId),
        classTeacherId: classData.classTeacherId,
      });
    }
  }, [classData, form]);

  const getSelectedTeacher = (teacherId: string) => {
    return teachers.find((t) => t.id.toString() === teacherId);
  };

  const onSubmit = async (data: updateClassSchemaType) => {
    setIsSubmitting(true);
    try {
      await updateClassMutation.mutateAsync({
        classId: classData.id,
        ...data,
      });
      toast.success("Class updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <School className="w-5 h-5" />
            Update Class
          </DialogTitle>
          <DialogDescription>
            Make changes to {classData.name} - Section {classData.section}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* Class Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grade 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section */}
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Session */}
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isLoadingSessions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingSessions ? (
                        <div className="p-2 text-center">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </div>
                      ) : sessions.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No sessions available
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
                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class Teacher */}
            <FormField
              control={form.control}
              name="classTeacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Teacher</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isLoadingTeachers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher">
                          {field.value && field.value !== "" && (
                            <div className="flex items-center gap-2">
                              {getSelectedTeacher(field.value) && (
                                <>
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={
                                        getSelectedTeacher(field.value)
                                          ?.profilePic || undefined
                                      }
                                    />
                                    <AvatarFallback className="text-[8px]">
                                      {getInitials(
                                        getSelectedTeacher(field.value)?.name ||
                                          "",
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>
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
                        <div className="p-2 text-center">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </div>
                      ) : teachers.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No teachers available
                        </div>
                      ) : (
                        teachers.map((teacher) => (
                          <SelectItem
                            key={teacher.id}
                            value={teacher.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={teacher.profilePic ?? ""} />
                                <AvatarFallback className="text-[8px]">
                                  {getInitials(teacher.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{teacher.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
