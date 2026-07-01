"use client";

import { useEffect, useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { ExamType } from "@/features/exam/types.exam";
import {
  createExamSchema,
  CreateExamSchemaType,
} from "@/features/exam/validators.exam";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: any;
  onCreate: (data: CreateExamSchemaType, form: UseFormReturn<any>) => void;
  onUpdate: (id: number, data: any, form: UseFormReturn<any>) => void;
};

export function ExamFormDialog({
  open,
  onOpenChange,
  initial,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = !!initial;

  const createDefaults = {
    name: "",
    type: ExamType.MID_TERM,
    startDate: "",
    endDate: "",
    includeInFinalResult: true,
    weightage: 100,
  };

  const updateDefaults = useMemo(() => ({
    name: initial?.name ?? "",
    type: initial?.type ?? ExamType.MID_TERM,
    startDate: initial?.startDate ? initial.startDate.slice(0, 10) : "",
    endDate: initial?.endDate ? initial.endDate.slice(0, 10) : "",
    includeInFinalResult: initial?.includeInFinalResult ?? true,
    weightage: initial?.weightage ?? 100,
  }), [initial]);

  const form = useForm<CreateExamSchemaType>({
    resolver: zodResolver(createExamSchema) as any,
    defaultValues: (isEdit ? updateDefaults : createDefaults) as CreateExamSchemaType,
  });

  const { reset, handleSubmit, control, formState } = form;
  const { isSubmitting } = formState;

  useEffect(() => {
    if (open) {
      if (isEdit) {
        reset(updateDefaults);
      } else {
        reset(createDefaults);
      }
    }
  }, [open, initial, isEdit, reset, updateDefaults]);

  const submit = async (data: any) => {
    if (isEdit) {
      onUpdate(initial.id, data, form);
    } else {
      onCreate(data, form);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Update Exam Parameters" : "Initiate New Examination"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(submit)} className="space-y-4 mt-2">
            {/* NAME */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Mid-Term Assessment"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TYPE */}
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select examination type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ExamType.UNIT_TEST}>Unit Test</SelectItem>
                      <SelectItem value={ExamType.MID_TERM}>Mid-Term</SelectItem>
                      <SelectItem value={ExamType.FINAL}>Final Exam</SelectItem>
                      <SelectItem value={ExamType.OTHER}>Other / Special</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DATES GRID */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* INCLUDE IN FINAL RESULT */}
            <FormField
              control={control}
              name="includeInFinalResult"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Final Result Compilation</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Include this exam in overall cumulative grades
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* WEIGHTAGE */}
            <FormField
              control={control}
              name="weightage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weightage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEdit ? "Update" : "Initiate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
