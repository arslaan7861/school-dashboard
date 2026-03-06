"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Save,
  X,
  BookOpen,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  UpdateHomeworkType,
  updateHomeworkSchema,
  Homework,
} from "@/features/homework/types.homework";
import { Subject } from "@/features/subjects/types.subject";
import { useHomeworkMutations } from "@/features/homework/hooks.homework";

interface EditHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework: Homework | null;
  subjects: Subject[];
  classId: number;
  sessionId: string | null;
}

export function EditHomeworkDialog({
  open,
  onOpenChange,
  homework,
  subjects,
  classId,
  sessionId,
}: EditHomeworkDialogProps) {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateHomeworkType>({
    resolver: zodResolver(updateHomeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      subjectId: undefined,
    },
  });

  const { updateHomeworkMutation } = useHomeworkMutations(
    classId,
    sessionId || undefined,
  );

  // Reset form when homework changes
  useEffect(() => {
    if (homework) {
      form.reset({
        title: homework.title,
        description: homework.description,
        dueDate: homework.dueDate,
        subjectId: homework.subject.id,
      });
      setDate(homework.dueDate ? new Date(homework.dueDate) : undefined);
    }
  }, [homework, form]);

  const handleSubmit = async (data: UpdateHomeworkType) => {
    if (!homework) return;

    // Check if there are actual changes
    const hasChanges = Object.keys(data).some((key) => {
      const value = data[key as keyof UpdateHomeworkType];
      const originalValue = homework[key as keyof Homework]?.toString();
      return value?.toString() !== originalValue;
    });

    if (!hasChanges) {
      toast.info("No changes detected");
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateHomeworkMutation.mutateAsync({
        homeworkId: homework.id,
        data,
      });

      toast.success("Homework updated successfully", {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        description: `"${data.title || homework.title}" has been updated`,
      });

      onOpenChange(false);
      form.reset();
      setDate(undefined);
    } catch (error) {
      // Error handled in mutation
      console.error("Homework update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubjectId = form.watch("subjectId");
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  if (!homework) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col h-[90vh]">
        {/* Fixed Header */}
        <div className="flex-none bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Edit Homework
            </DialogTitle>
            <DialogDescription>
              Update homework for{" "}
              <span className="font-medium text-foreground">
                {homework.class.name} - Section {homework.class.section}
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Current Values Info */}
          <div className="bg-muted/50 p-4 rounded-lg mb-6 space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Current Values
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="font-medium truncate">{homework.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="font-medium">{homework.subject.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {format(new Date(homework.dueDate), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Attachments</p>
                <p className="font-medium">
                  {homework.attachments.length} file(s)
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              id="edit-homework-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Title{" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Chapter 5 Mathematics Exercises"
                        className="focus-visible:ring-primary"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Description{" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Update instructions, page numbers, or specific requirements..."
                        className="min-h-[100px] focus-visible:ring-primary resize-y"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Subject and Due Date - Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Subject Selection */}
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        Subject{" "}
                        <span className="text-xs text-muted-foreground">
                          (Optional)
                        </span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value ? field.value.toString() : ""}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={subject.id.toString()}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{subject.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        Due Date{" "}
                        <span className="text-xs text-muted-foreground">
                          (Optional)
                        </span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                              disabled={isSubmitting}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                              setDate(date);
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : "",
                              );
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subject Teacher Info */}
              {selectedSubjectId &&
                selectedSubjectId > 0 &&
                selectedSubject?.teacher && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/5 border-primary/20">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        New Subject Teacher
                      </p>
                      <p className="text-sm font-medium">
                        {selectedSubject.teacher.name}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-background">
                      Will be updated
                    </Badge>
                  </div>
                )}

              {/* No Teacher Warning */}
              {selectedSubjectId &&
                selectedSubjectId > 0 &&
                !selectedSubject?.teacher && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-amber-50 border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <p className="text-sm text-amber-600">
                      Selected subject has no teacher assigned
                    </p>
                  </div>
                )}
            </form>
          </Form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-none bg-background border-t px-6 py-4 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              form.reset();
              setDate(undefined);
            }}
            className="min-w-[80px]"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-homework-form"
            disabled={
              !form.formState.isValid ||
              isSubmitting ||
              updateHomeworkMutation.isPending
            }
            className="min-w-[120px]"
          >
            {isSubmitting || updateHomeworkMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
