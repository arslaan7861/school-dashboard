"use client";

import { useEffect, useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  createSessionSchema,
  updateSessionSchema,
  CreateSessionSchemaType,
  UpdateSessionSchemaType,
} from "@/features/session/validators.session";

import { Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: any;
  onCreate: (data: CreateSessionSchemaType, form: FormType) => void;
  onUpdate: (id: number, data: UpdateSessionSchemaType, form: FormType) => void;
};

type FormType = UseFormReturn<any>;

export function SessionFormDialog({
  open,
  onOpenChange,
  initial,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = !!initial;

  const schema = useMemo(
    () => (isEdit ? updateSessionSchema : createSessionSchema),
    [isEdit],
  );

  const createDefaults = {
    name: "",
    startDate: "", // Changed
    endDate: "", // Changed
    isActive: false, // Changed
  };

  const updateDefaults: any = {
    name: initial?.name ?? "",
    startDate: initial?.startDate ? initial.startDate.slice(0, 10) : "", // Changed
    endDate: initial?.endDate ? initial.endDate.slice(0, 10) : "", // Changed
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? updateDefaults : createDefaults,
  });

  const { reset, handleSubmit, control, formState } = form;
  const { isSubmitting } = formState;

  useEffect(() => {
    if (isEdit) reset(updateDefaults);
    else reset(createDefaults);
  }, [initial, isEdit, reset]); // Added dependencies

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
            {isEdit ? "Update Session" : "Create Session"}
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
                  <FormLabel>Session Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2024-2025"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* START DATE - Changed field name */}
            <FormField
              control={control}
              name="startDate" // Changed
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

            {/* END DATE - Changed field name */}
            <FormField
              control={control}
              name="endDate" // Changed
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

            {/* ACTIVE - Changed field name */}
            {!isEdit && (
              <FormField
                control={control}
                name="isActive" // Changed
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Set as Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Make this the current active session
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
            )}

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
                disabled={isSubmitting || !formState.isDirty}
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
