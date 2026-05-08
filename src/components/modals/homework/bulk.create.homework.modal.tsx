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

import { useBulkCreateHomework } from "@/features/homework";
import { useSubjectsByClass } from "@/features/subjects/hooks.subject";
import {
  closeBulkCreateHomeworkModal,
  useHomeworkModalStore,
} from "@/store/modals/homework.modal.store";
import {
  ApiErrorResponse,
  BulkCreateHomeworkFormData,
  bulkCreateHomeworkSchema,
} from "@/features/homework/schema.homework";

export function BulkCreateHomeworkModal() {
  const { isOpen, classId, sessionId, onSuccess } = useHomeworkModalStore(
    (state) => state.bulkCreateHomeworkModal,
  );

  const { data: subjects, isLoading: subjectsLoading } = useSubjectsByClass(
    classId || 0,
    { includeDetails: true },
  );

  const bulkCreate = useBulkCreateHomework();

  const form = useForm<BulkCreateHomeworkFormData>({
    resolver: zodResolver(bulkCreateHomeworkSchema),
    defaultValues: {
      assignments: [
        {
          title: "",
          description: "",
          dueDate: "",
          subjectId: undefined,
          files: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assignments",
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        assignments: [
          {
            title: "",
            description: "",
            dueDate: "",
            subjectId: undefined,
            files: [],
          },
        ],
      });
    }
  }, [isOpen, form]);

  const handleFileChange = (
    assignmentIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    const currentFiles =
      form.getValues(`assignments.${assignmentIndex}.files`) || [];
    form.setValue(`assignments.${assignmentIndex}.files`, [
      ...currentFiles,
      ...files,
    ]);
  };

  const removeFile = (assignmentIndex: number, fileIndex: number) => {
    const currentFiles =
      form.getValues(`assignments.${assignmentIndex}.files`) || [];
    form.setValue(
      `assignments.${assignmentIndex}.files`,
      currentFiles.filter((_, i) => i !== fileIndex),
    );
  };

  const onSubmit = async (values: BulkCreateHomeworkFormData) => {
    if (!classId || !sessionId) return;

    // Transform files to the format expected by API
    const files = values.assignments.map(
      (assignment) => assignment.files || [],
    );

    await bulkCreate.mutateAsync(
      {
        assignments: values.assignments.map(({ files: _, ...rest }) => rest),
        classId,
        sessionId,
        files,
      },
      {
        onError: (error) => {
          const apiError = error;
          toast.error(apiError.message || "Failed to create homework");

          if (apiError.errors && apiError.errors.length) {
            apiError.errors.forEach(({ field, message }) => {
              // Parse field like "assignments.0.title"
              if (field.includes("assignments")) {
                const [_, index, subField] = field.split(".");
                form.setError(`assignments.${index}.${subField}` as any, {
                  message,
                });
              } else {
                form.setError(field as any, { message });
              }
            });
          }
        },
        onSuccess: (response) => {
          toast.success(response.message || "Homework created successfully");
          onSuccess?.();
          closeBulkCreateHomeworkModal();
        },
      },
    );
  };

  const addAssignment = () => {
    append({
      title: "",
      description: "",
      dueDate: "",
      subjectId: subjects![0].id,
      files: [],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeBulkCreateHomeworkModal}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Create Homework</DialogTitle>
          <DialogDescription>
            Create multiple homework assignments for different subjects at once.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assignments</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAssignment}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Assignment
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Assignment #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`assignments.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Algebra Practice"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`assignments.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the homework assignment..."
                            className="min-h-[80px]"
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
                      name={`assignments.${index}.subjectId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject *</FormLabel>
                          <Select
                            onValueChange={(val) =>
                              field.onChange(parseInt(val))
                            }
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
                      name={`assignments.${index}.dueDate`}
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
                    <div className="border-2 border-dashed rounded-lg p-3 text-center">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileChange(index, e)}
                        className="hidden"
                        id={`file-upload-${index}`}
                      />
                      <label
                        htmlFor={`file-upload-${index}`}
                        className="cursor-pointer flex flex-col items-center gap-1"
                      >
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Click to upload files
                        </span>
                      </label>
                    </div>

                    {(form.watch(`assignments.${index}.files`)?.length ?? 0) >
                      0 && (
                      <div className="space-y-1 mt-2">
                        {(form.watch(`assignments.${index}.files`) || []).map(
                          (file: File, fileIndex: number) => (
                            <div
                              key={fileIndex}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                            >
                              <span className="truncate flex-1">
                                {file.name}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index, fileIndex)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeBulkCreateHomeworkModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={bulkCreate.isPending}>
                {bulkCreate.isPending ? "Creating..." : "Create All"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
