"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";

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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useSubjectCrud } from "@/features/subjects/hooks.subject";
import { useTeachers } from "@/features/teachers/hooks.teacher";
import { useClass } from "@/features/class/hooks.class";
import { CreateMultipleSubjectsPayload } from "@/features/subjects/validator.subject";
import { useAuthStore } from "@/store/authStore";

// Define the form data type (without classId and sessionId)
type FormData = {
  subjects: Array<{
    name: string;
    marksType: "number" | "grade" | "none";
    isOptional: boolean;
    isElective: boolean;
    components: Array<{
      name: string;
      type: string;
      displayOrder: number;
      includeInResult: boolean;
      batches: Array<{
        name: string;
        capacity?: number;
        teacherId: string;
      }>;
    }>;
  }>;
};

// Create a schema for the form with proper defaults
const formSchema = z.object({
  subjects: z
    .array(
      z.object({
        name: z.string().min(1, "Subject name is required"),
        marksType: z.enum(["number", "grade", "none"]),
        isOptional: z.boolean(),
        isElective: z.boolean(),
        components: z
          .array(
            z.object({
              name: z.string().min(1, "Component name is required"),
              type: z.string(),
              displayOrder: z.number().min(0),
              includeInResult: z.boolean(),
              batches: z
                .array(
                  z.object({
                    name: z.string().min(1, "Batch name is required"),
                    capacity: z.number().positive().optional(),
                    teacherId: z.string().min(1, "Teacher is required"),
                  }),
                )
                .min(1, "At least one batch is required"),
            }),
          )
          .min(1, "At least one component is required"),
      }),
    )
    .min(1, "At least one subject is required"),
});

export default function CreateSubjectsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = Number(params.id);
  const sessionId = useAuthStore((s) => s.activeSessionId);

  const [activeSubject, setActiveSubject] = useState(0);

  const { data: classData, isLoading: isLoadingClass } = useClass(
    String(classId),
  );
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers();
  const { createMultipleAsync, isCreating } = useSubjectCrud();

  const teachers = teachersData?.data?.teachers || [];
  const classInfo = classData?.data;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjects: [
        {
          name: "",
          marksType: "number",
          isOptional: false,
          isElective: false,
          components: [
            {
              name: "Theory",
              type: "theory",
              displayOrder: 0,
              includeInResult: true,
              batches: [
                {
                  name: "Batch A",
                  capacity: 30,
                  teacherId: "",
                },
              ],
            },
          ],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const addSubject = () => {
    append({
      name: "",
      marksType: "number",
      isOptional: false,
      isElective: false,
      components: [
        {
          name: "Theory",
          type: "theory",
          displayOrder: 0,
          includeInResult: true,
          batches: [
            {
              name: "Batch A",
              capacity: 30,
              teacherId: "",
            },
          ],
        },
      ],
    });
    setActiveSubject(fields.length);
  };

  const addComponent = (subjectIndex: number) => {
    const components =
      form.getValues(`subjects.${subjectIndex}.components`) || [];
    form.setValue(`subjects.${subjectIndex}.components`, [
      ...components,
      {
        name: `Component ${components.length + 1}`,
        type: "other",
        displayOrder: components.length,
        includeInResult: true,
        batches: [
          {
            name: "Batch A",
            capacity: 30,
            teacherId: "",
          },
        ],
      },
    ]);
  };

  const addBatch = (subjectIndex: number, componentIndex: number) => {
    const batches =
      form.getValues(
        `subjects.${subjectIndex}.components.${componentIndex}.batches`,
      ) || [];
    const nextLetter = String.fromCharCode(65 + batches.length);
    form.setValue(
      `subjects.${subjectIndex}.components.${componentIndex}.batches`,
      [
        ...batches,
        {
          name: `Batch ${nextLetter}`,
          capacity: 30,
          teacherId: "",
        },
      ],
    );
  };

  const removeSubject = (index: number) => {
    remove(index);
    if (activeSubject === index && fields.length > 1) {
      setActiveSubject(Math.max(0, index - 1));
    } else if (fields.length === 1) {
      setActiveSubject(0);
    }
  };

  const removeComponent = (subjectIndex: number, componentIndex: number) => {
    const components = form.getValues(`subjects.${subjectIndex}.components`);
    if (components.length > 1) {
      form.setValue(
        `subjects.${subjectIndex}.components`,
        components.filter((_, i) => i !== componentIndex),
      );
    }
  };

  const removeBatch = (
    subjectIndex: number,
    componentIndex: number,
    batchIndex: number,
  ) => {
    const batches = form.getValues(
      `subjects.${subjectIndex}.components.${componentIndex}.batches`,
    );
    if (batches.length > 1) {
      form.setValue(
        `subjects.${subjectIndex}.components.${componentIndex}.batches`,
        batches.filter((_, i) => i !== batchIndex),
      );
    }
  };

  const getSelectedTeacher = (teacherId: string) => {
    return teachers.find((t: any) => t.id.toString() === teacherId);
  };

  const onSubmit = async (data: FormData) => {
    if (!sessionId && !classInfo?.sessionId) {
      toast.error("Session ID is required");
      return;
    }
    console.log({ classData });

    if (!classInfo?.id) {
      toast.error("Class information not found");
      return;
    }

    try {
      // Transform form data to match API payload by adding classId and sessionId
      const payload = {
        subjects: data.subjects.map((subject) => ({
          name: subject.name,
          classId: classId,
          sessionId: Number(sessionId) || Number(classInfo.sessionId),
          marksType: subject.marksType,
          isOptional: subject.isOptional,
          isElective: subject.isElective,
          components: subject.components.map((comp) => ({
            name: comp.name,
            type: comp.type as
              | "theory"
              | "practical"
              | "internal"
              | "project"
              | "viva"
              | "other",
            displayOrder: comp.displayOrder,
            includeInResult: comp.includeInResult,
            batches: comp.batches.map((batch) => ({
              name: batch.name,
              capacity: batch.capacity,
              teacherId: parseInt(batch.teacherId, 10),
            })),
          })),
        })),
      } satisfies CreateMultipleSubjectsPayload; // Use 'satisfies' operator to ensure type match

      await createMultipleAsync(payload);
      toast.success("Subjects created successfully");
      router.push(`/classes/${classId}/subjects`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create subjects",
      );
    }
  };

  const formErrors = form.formState.errors;

  if (isLoadingClass) {
    return (
      <div className="flex items-center justify-center h-64 pt-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="space-y-6 p-6 max-w-6xl mx-auto pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/classes/${classId}/subjects`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create Subjects
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {classInfo?.name} - Section {classInfo?.section}
              </p>
            </div>
          </div>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isCreating}
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Subjects"
            )}
          </Button>
        </div>

        {/* Subject Cards (No Tabs) */}
        <div className="space-y-6">
          {fields.map((field, subjectIndex) => (
            <Card key={field.id} className="relative">
              {subjectIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10"
                  onClick={() => removeSubject(subjectIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {subjectIndex + 1}
                  </div>
                  <CardTitle>Subject {subjectIndex + 1}</CardTitle>
                </div>
                <CardDescription>
                  Enter the details for this subject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`subjects.${subjectIndex}.name`}
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
                    name={`subjects.${subjectIndex}.marksType`}
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

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name={`subjects.${subjectIndex}.isOptional`}
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
                    name={`subjects.${subjectIndex}.isElective`}
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

                <Separator />

                {/* Components */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Components</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addComponent(subjectIndex)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Component
                    </Button>
                  </div>

                  {form
                    .watch(`subjects.${subjectIndex}.components`)
                    ?.map((_, componentIndex) => (
                      <Card
                        key={componentIndex}
                        className="border-l-4 border-l-primary"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="rounded-full">
                                C{componentIndex + 1}
                              </Badge>
                              <CardTitle className="text-base">
                                Component {componentIndex + 1}
                              </CardTitle>
                            </div>
                            {form.watch(`subjects.${subjectIndex}.components`)
                              .length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeComponent(subjectIndex, componentIndex)
                                }
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`subjects.${subjectIndex}.components.${componentIndex}.name`}
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
                              name={`subjects.${subjectIndex}.components.${componentIndex}.type`}
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
                                      <SelectItem value="viva">Viva</SelectItem>
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
                              name={`subjects.${subjectIndex}.components.${componentIndex}.displayOrder`}
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
                              name={`subjects.${subjectIndex}.components.${componentIndex}.includeInResult`}
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
                              <h4 className="text-sm font-medium">Batches</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  addBatch(subjectIndex, componentIndex)
                                }
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Batch
                              </Button>
                            </div>

                            {form
                              .watch(
                                `subjects.${subjectIndex}.components.${componentIndex}.batches`,
                              )
                              ?.map((_, batchIndex) => (
                                <div
                                  key={batchIndex}
                                  className="flex items-start gap-3 p-3 border rounded-lg bg-muted/20"
                                >
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <FormField
                                      control={form.control}
                                      name={`subjects.${subjectIndex}.components.${componentIndex}.batches.${batchIndex}.name`}
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
                                      name={`subjects.${subjectIndex}.components.${componentIndex}.batches.${batchIndex}.capacity`}
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
                                                    ? parseInt(e.target.value)
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
                                      name={`subjects.${subjectIndex}.components.${componentIndex}.batches.${batchIndex}.teacherId`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">
                                            Teacher *
                                          </FormLabel>
                                          <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
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
                                                teachers.map((teacher: any) => (
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
                                                          {teacher.name[0]}
                                                        </AvatarFallback>
                                                      </Avatar>
                                                      <span>
                                                        {teacher.name}
                                                      </span>
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
                                  </div>

                                  {form.watch(
                                    `subjects.${subjectIndex}.components.${componentIndex}.batches`,
                                  ).length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="mt-6"
                                      onClick={() =>
                                        removeBatch(
                                          subjectIndex,
                                          componentIndex,
                                          batchIndex,
                                        )
                                      }
                                    >
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {/* Add Component Button at bottom */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addComponent(subjectIndex)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Component
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Subject Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={addSubject}
              className="w-full max-w-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Subject
            </Button>
          </div>
        </div>

        {/* Form Errors */}
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
    </Form>
  );
}
