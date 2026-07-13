"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateHomework } from "@/features/homework";
import {
  closeCreateHomeworkModal,
  useHomeworkModalStore,
} from "@/store/modals/homework.modal.store";
import { useSubjectsByClass } from "@/features/subjects/hooks.subject";
import {
  ApiErrorResponse,
  CreateHomeworkFormData,
  createHomeworkSchema,
} from "@/features/homework/schema.homework";
import { useClasses } from "@/features/class/hooks.class";

export function CreateHomeworkModal() {
  const { isOpen, classId, sessionId, onSuccess, defaultValues } =
    useHomeworkModalStore((state) => state.createHomeworkModal);

  const [selectedClassId, setSelectedClassId] = useState<number | null>(classId || null);

  useEffect(() => {
    if (isOpen) {
      setSelectedClassId(classId || null);
    }
  }, [isOpen, classId]);

  const { data: classesData, isLoading: classesLoading } = useClasses(
    isOpen && sessionId ? sessionId : undefined
  );
  const classes = classesData?.data || [];

  const { data: subjects, isLoading: subjectsLoading } = useSubjectsByClass(
    selectedClassId || 0,
    { includeDetails: true, enabled: isOpen && !!selectedClassId },
  );

  const createHomework = useCreateHomework();

  const form = useForm<CreateHomeworkFormData & { classId?: number }>({
    resolver: zodResolver(createHomeworkSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      dueDate: defaultValues?.dueDate || "",
      subjectId: defaultValues?.subjectId,
      classId: classId || undefined,
      files: [],
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedClassId(null);
    }
  }, [isOpen, form]);

  const onSubmit = async (values: CreateHomeworkFormData & { classId?: number }) => {
    const finalClassId = classId || selectedClassId;
    if (!finalClassId || !sessionId) {
      toast.error("Please select a class");
      return;
    }

    await createHomework.mutateAsync(
      {
        ...values,
        classId: finalClassId,
        sessionId,
      },
      {
        onError: (error: any) => {
          const apiError = error as ApiErrorResponse;
          toast.error(apiError.message || "Failed to create homework");

          if (apiError.errors && apiError.errors.length) {
            apiError.errors.forEach(({ field, message }) => {
              form.setError(field as keyof CreateHomeworkFormData, { message });
            });
          }
        },
        onSuccess: (response) => {
          toast.success(response.message || "Homework created successfully");
          onSuccess?.();
          closeCreateHomeworkModal();
        },
      },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentFiles = form.getValues("files") || [];
    form.setValue("files", [...currentFiles, ...files]);
  };

  const removeFile = (index: number) => {
    const currentFiles = form.getValues("files") || [];
    form.setValue(
      "files",
      currentFiles.filter((_, i) => i !== index),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeCreateHomeworkModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Create Homework</DialogTitle>
          <DialogDescription>
            Assign homework to students. You can attach multiple files.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col overflow-hidden flex-1">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Algebra Practice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the homework assignment..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditionally render class dropdown if classId is not provided */}
            {!classId && (
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class *</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        const newClassId = Number(val);
                        field.onChange(newClassId);
                        setSelectedClassId(newClassId);
                        form.setValue("subjectId", 0); // reset subject
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          classes.map((cls) => (
                            <SelectItem
                              key={cls.id}
                              value={cls.id.toString()}
                            >
                              {cls.name} {cls.section}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjectsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          subjects?.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={subject.id.toString()}
                            >
                              {subject.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <FormLabel>Attachments</FormLabel>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Click to upload files
                  </span>
                </label>
              </div>

              {(form.watch("files")?.length ?? 0) > 0 && (
                <div className="space-y-1 mt-2">
                  {(form.watch("files") || []).map(
                    (file: File, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm truncate flex-1">
                          {file.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            </div>

            <DialogFooter className="px-6 py-4 border-t bg-gray-50/50 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateHomeworkModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createHomework.isPending}>
                {createHomework.isPending ? "Creating..." : "Create Homework"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
