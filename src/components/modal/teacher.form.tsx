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

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Loader2, User2 } from "lucide-react";
import { toast } from "sonner";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "@/features/teachers/validator.teacher";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: any;
  onCreate: (data: any, form: FormType) => Promise<any> | void;
  onUpdate: (id: string, data: any, form: FormType) => Promise<any> | void;
};

type FormType = UseFormReturn<any>;

export function TeacherFormDialog({
  open,
  onOpenChange,
  initial,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = !!initial;

  const createDefaults: any = {
    name: "",
    email: "",
    phone: "",
    password: "",
    employee_code: "",
    joining_date: "",
    qualification: "",
  };

  const updateDefaults: any = {
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    employee_code: initial?.employee_code ?? "",
    joining_date: initial?.joining_date ?? "",
    qualification: initial?.qualification ?? "",
  };

  const schema = useMemo(
    () => (isEdit ? updateTeacherSchema : createTeacherSchema),
    [isEdit],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? updateDefaults : createDefaults,
  });

  const { reset, handleSubmit, control, formState } = form;
  const { isSubmitting } = formState;

  useEffect(() => {
    if (isEdit) reset(updateDefaults);
    else reset(createDefaults);
  }, [initial, isEdit, reset]);

  const submit = async (data: any) => {
    try {
      if (isEdit) {
        await onUpdate(initial.id, data, form);
        toast.success("Teacher updated");
      } else {
        await onCreate(data, form);
        toast.success("Teacher created");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-5 border-b bg-muted/40">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <User2 className="w-5 h-5 text-primary" />
            </div>
            {isEdit ? "Update Teacher" : "Create Teacher"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details below to {isEdit ? "update" : "add"} a teacher
            profile.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(submit)} className="px-6 py-6 space-y-6">
            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* NAME */}
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMAIL */}
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PHONE */}
              <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMPLOYEE CODE */}
              <FormField
                control={control}
                name="employee_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PASSWORD */}
              {!isEdit && (
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* JOINING DATE */}
              <FormField
                control={control}
                name="joining_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joining Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* QUALIFICATION */}
              <FormField
                control={control}
                name="qualification"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ACTION FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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
                disabled={isSubmitting || !form.formState.isDirty}
                className="min-w-[120px]"
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
