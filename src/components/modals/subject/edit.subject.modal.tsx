"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useSubject, useSubjectCrud } from "@/features/subjects/hooks.subject";
import { useTeachers } from "@/features/teachers/hooks.teacher";
import { UpdateSubjectData } from "@/features/subjects/types.subject";
import {
  closeEditSubjectModal,
  useSubjectModalStore,
} from "@/store/modals/subject.modal.store";

export function EditSubjectModal() {
  const { isOpen, classId, subjectId, onSuccess } = useSubjectModalStore(
    (state) => state.editSubjectModal,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: subject,
    isLoading,
    error,
  } = useSubject(subjectId ?? undefined);
  const { updateAsync, isUpdating } = useSubjectCrud();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers();

  const teachers = teachersData?.data?.teachers || [];

  const form = useForm<UpdateSubjectData>({
    defaultValues: {
      name: "",
      marksType: "number",
      isOptional: false,
      isElective: false,
      components: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  // Populate form when subject data is loaded
  useEffect(() => {
    if (subject && isOpen) {
      form.reset({
        name: subject.name,
        marksType: subject.marksType,
        isOptional: subject.isOptional,
        isElective: subject.isElective,
        components:
          subject.components?.map((comp) => ({
            id: comp.id,
            name: comp.name,
            type: comp.type,
            displayOrder: comp.displayOrder,
            includeInResult: comp.includeInResult,
            batches: comp.batches.map((batch) => ({
              id: batch.id,
              name: batch.name,
              capacity: batch.capacity,
              teacherId: batch.teacherId,
            })),
          })) || [],
      });
    } else if (!isOpen) {
      form.reset();
    }
  }, [subject, isOpen, form]);

  const addComponent = () => {
    append({
      name: "",
      type: "theory",
      displayOrder: fields.length,
      includeInResult: true,
      batches: [
        {
          name: "Batch A",
          capacity: 30,
          teacherId: 0,
        },
      ],
    });
  };

  const addBatch = (componentIndex: number) => {
    const batches = form.getValues(`components.${componentIndex}.batches`);
    const nextLetter = String.fromCharCode(65 + (batches?.length || 0));
    form.setValue(`components.${componentIndex}.batches`, [
      ...(batches || []),
      {
        name: `Batch ${nextLetter}`,
        capacity: 30,
        teacherId: 0,
      },
    ]);
  };

  const removeComponent = (index: number) => {
    const component = form.getValues(`components.${index}`);
    if (component?.id) {
      form.setValue(`components.${index}._delete`, true);
    } else {
      remove(index);
    }
  };

  const removeBatch = (componentIndex: number, batchIndex: number) => {
    const batches = form.getValues(`components.${componentIndex}.batches`);
    const batch = batches?.[batchIndex];

    if (batch?.id) {
      form.setValue(
        `components.${componentIndex}.batches.${batchIndex}._delete`,
        true,
      );
    } else {
      const updatedBatches = batches?.filter((_, i) => i !== batchIndex);
      form.setValue(`components.${componentIndex}.batches`, updatedBatches);
    }
  };

  const onSubmit = async (data: UpdateSubjectData) => {
    if (!subjectId) return;

    try {
      setIsSubmitting(true);

      const cleanedData: UpdateSubjectData = {
        name: data.name,
        marksType: data.marksType,
        isOptional: data.isOptional,
        isElective: data.isElective,
        components: data.components
          ?.filter((comp) => !comp._delete)
          .map((comp) => ({
            ...comp,
            batches: comp.batches?.filter((batch) => !batch._delete),
          })),
      };

      await updateAsync({
        subjectId,
        data: cleanedData,
      });

      toast.success("Subject updated successfully");
      onSuccess?.();
      closeEditSubjectModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formErrors = form.formState.errors;

  return (
    <Dialog open={isOpen} onOpenChange={closeEditSubjectModal}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            {subject
              ? `Editing ${subject.name} for ${subject.class?.name} - Section ${subject.class?.section}`
              : "Edit subject details"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error || !subject ? (
          <div className="flex flex-col items-center justify-center h-40">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <p className="text-muted-foreground">Subject not found.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Mathematics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marksType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marks Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select marks type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="grade">Grade</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="flex gap-6">
                    <FormField
                      control={form.control}
                      name="isOptional"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">
                            Optional Subject
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isElective"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">
                            Elective Subject
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Components Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Components & Batches
                  </h2>
                  <Button type="button" onClick={addComponent} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Component
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No components yet. Add one to get started.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, componentIndex) => {
                      const component = form.watch(
                        `components.${componentIndex}`,
                      );
                      const isDeleted = component?._delete;

                      if (isDeleted) return null;

                      return (
                        <Card
                          key={field.id}
                          className={cn(
                            "relative",
                            component?.id
                              ? "border-l-4 border-l-primary"
                              : "border-l-4 border-l-muted-foreground",
                          )}
                        >
                          {component?.id && (
                            <div className="absolute -left-2 -top-2">
                              <Badge className="bg-primary text-primary-foreground text-xs">
                                ID: {component.id}
                              </Badge>
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                  {componentIndex + 1}
                                </div>
                                <CardTitle className="text-base">
                                  {component?.name ||
                                    `Component ${componentIndex + 1}`}
                                </CardTitle>
                                {!component?.id && (
                                  <Badge variant="secondary">New</Badge>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeComponent(componentIndex)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`components.${componentIndex}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Component Name *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Theory"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`components.${componentIndex}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Component Type *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="theory">
                                          Theory
                                        </SelectItem>
                                        <SelectItem value="practical">
                                          Practical
                                        </SelectItem>
                                        <SelectItem value="internal">
                                          Internal
                                        </SelectItem>
                                        <SelectItem value="project">
                                          Project
                                        </SelectItem>
                                        <SelectItem value="viva">
                                          Viva
                                        </SelectItem>
                                        <SelectItem value="other">
                                          Other
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`components.${componentIndex}.displayOrder`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Display Order</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseInt(e.target.value) || 0,
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`components.${componentIndex}.includeInResult`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2 mt-8">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="!mt-0">
                                      Include in Result
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Separator />

                            {/* Batches */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Batches</h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addBatch(componentIndex)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Batch
                                </Button>
                              </div>

                              {form
                                .watch(`components.${componentIndex}.batches`)
                                ?.map((batch, batchIndex) => {
                                  const isBatchDeleted = batch?._delete;
                                  if (isBatchDeleted) return null;

                                  return (
                                    <div
                                      key={batchIndex}
                                      className={cn(
                                        "flex items-start gap-3 p-3 border rounded-lg",
                                        batch.id
                                          ? "bg-muted/20"
                                          : "bg-secondary/20",
                                      )}
                                    >
                                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <FormField
                                          control={form.control}
                                          name={`components.${componentIndex}.batches.${batchIndex}.name`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-xs">
                                                Batch Name
                                              </FormLabel>
                                              <FormControl>
                                                <Input
                                                  placeholder="Batch A"
                                                  {...field}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <FormField
                                          control={form.control}
                                          name={`components.${componentIndex}.batches.${batchIndex}.capacity`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-xs">
                                                Capacity
                                              </FormLabel>
                                              <FormControl>
                                                <Input
                                                  type="number"
                                                  placeholder="30"
                                                  {...field}
                                                  value={field.value || ""}
                                                  onChange={(e) =>
                                                    field.onChange(
                                                      e.target.value
                                                        ? parseInt(
                                                            e.target.value,
                                                          )
                                                        : undefined,
                                                    )
                                                  }
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <FormField
                                          control={form.control}
                                          name={`components.${componentIndex}.batches.${batchIndex}.teacherId`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-xs">
                                                Teacher *
                                              </FormLabel>
                                              <Select
                                                onValueChange={(value) =>
                                                  field.onChange(
                                                    parseInt(value),
                                                  )
                                                }
                                                value={field.value?.toString()}
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select teacher" />
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
                                                    teachers.map(
                                                      (teacher: any) => (
                                                        <SelectItem
                                                          key={teacher.id}
                                                          value={teacher.id.toString()}
                                                        >
                                                          <div className="flex items-center gap-2">
                                                            <Avatar className="h-5 w-5">
                                                              <AvatarImage
                                                                src={
                                                                  teacher.profilePic
                                                                }
                                                              />
                                                              <AvatarFallback>
                                                                {
                                                                  teacher
                                                                    .name[0]
                                                                }
                                                              </AvatarFallback>
                                                            </Avatar>
                                                            <span>
                                                              {teacher.name}
                                                            </span>
                                                          </div>
                                                        </SelectItem>
                                                      ),
                                                    )
                                                  )}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      {(form.watch(
                                        `components.${componentIndex}.batches`,
                                      )?.length || 0) > 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="mt-6"
                                          onClick={() =>
                                            removeBatch(
                                              componentIndex,
                                              batchIndex,
                                            )
                                          }
                                        >
                                          <Trash2 className="w-3 h-3 text-destructive" />
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {Object.keys(formErrors).length > 0 && (
                <Card className="border-destructive">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">
                        Please fix the following errors:
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                      {Object.entries(formErrors).map(([key, error]) => (
                        <li key={key}>
                          {key}: {error.message as string}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              </div>

              <DialogFooter className="px-6 py-4 border-t shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditSubjectModal}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUpdating}>
                  {isSubmitting || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
