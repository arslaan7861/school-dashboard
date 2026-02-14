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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
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

import {
  createAdminSchema,
  updateAdminSchema,
} from "@/features/admin/validators.admin";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/user";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: any;
  onCreate: (data: any, form: formType) => Promise<any> | void;
  onUpdate: (id: string, data: any, form: formType) => Promise<any> | void;
};
type formType = UseFormReturn<
  any,
  unknown,
  | {
      name: string;
      email: string;
      phone: string;
      password: string;
      role: UserRole;
    }
  | {
      name?: string | undefined;
      email?: string | undefined;
      phone?: string | undefined;
      password?: string | undefined;
      role?: UserRole | undefined;
    }
>;

export function AdminFormDialog({
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
    role: "admin",
    is_active: true,
  };

  const updateDefaults: any = {
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    role: initial?.role ?? "admin",
  };

  const schema = useMemo(
    () => (isEdit ? updateAdminSchema : createAdminSchema),
    [isEdit],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? updateDefaults : createDefaults,
  });

  const { reset, handleSubmit, control, formState } = form;
  const { isSubmitting } = formState;
  useEffect(() => {
    console.log(formState.errors);
  }, [formState.errors]);

  useEffect(() => {
    if (isEdit) {
      setTimeout(() => reset(updateDefaults), 100);
    } else {
      setTimeout(() => reset(createDefaults), 100);
    }
  }, [initial, isEdit, reset]);

  const submit = async (data: any) => {
    try {
      console.log("triggered");

      if (isEdit) {
        await onUpdate(initial.id, data, form);
      } else {
        await onCreate(data, form);
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state);

        // if (!state) setTimeout(() => reset(createDefaults), 100);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Admin" : "Create Admin"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(submit)} className="space-y-4 mt-2">
            {/* NAME */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name"
                      {...field}
                      disabled={isSubmitting}
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
                      placeholder="Enter email"
                      {...field}
                      disabled={isSubmitting}
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
                      placeholder="Enter phone number"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PASSWORD CREATE ONLY */}
            {!isEdit && (
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter password"
                        type="password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
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
                disabled={isSubmitting || !form.formState.isDirty}
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
