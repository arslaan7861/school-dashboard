"use client";

import { useEffect } from "react";
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

export function CreateHomeworkModal() {
  const { isOpen, classId, sessionId, onSuccess, defaultValues } =
    useHomeworkModalStore((state) => state.createHomeworkModal);

  const { data: subjects, isLoading: subjectsLoading } = useSubjectsByClass(
    classId || 0,
    { includeDetails: true },
  );

  const createHomework = useCreateHomework();

  const form = useForm<CreateHomeworkFormData>({
    resolver: zodResolver(createHomeworkSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      dueDate: defaultValues?.dueDate || "",
      subjectId: defaultValues?.subjectId,
      files: [],
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: CreateHomeworkFormData) => {
    if (!classId || !sessionId) return;

    await createHomework.mutateAsync(
      {
        ...values,
        classId,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Homework</DialogTitle>
          <DialogDescription>
            Assign homework to students. You can attach multiple files.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <DialogFooter>
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
