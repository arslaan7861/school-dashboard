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
    start_date: "",
    end_date: "",
    is_active: false,
  };

  const updateDefaults: any = {
    name: initial?.name ?? "",
    start_date: initial?.start_date ? initial.start_date.slice(0, 10) : "",
    end_date: initial?.end_date ? initial.end_date.slice(0, 10) : "",
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
  }, [initial]);

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
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* START DATE */}
            <FormField
              control={control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* END DATE */}
            <FormField
              control={control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ACTIVE */}
            {!isEdit && (
              <FormField
                control={control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
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
