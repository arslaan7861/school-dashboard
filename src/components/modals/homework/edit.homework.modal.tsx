"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

import { useUpdateHomework } from "@/features/homework";
import {
  closeEditHomeworkModal,
  useHomeworkModalStore,
} from "@/store/modals/homework.modal.store";
import {
  UpdateHomeworkFormData,
  updateHomeworkSchema,
} from "@/features/homework/schema.homework";

export function EditHomeworkModal() {
  const { isOpen, homework, onSuccess } = useHomeworkModalStore(
    (state) => state.editHomeworkModal,
  );

  const updateHomework = useUpdateHomework();

  const form = useForm<UpdateHomeworkFormData>({
    resolver: zodResolver(updateHomeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (homework && isOpen) {
      form.reset({
        title: homework.title,
        description: homework.description,
        dueDate: homework.dueDate,
      });
    }
  }, [homework, isOpen, form]);

  const onSubmit = async (values: UpdateHomeworkFormData) => {
    if (!homework) return;

    await updateHomework.mutateAsync(
      { id: homework.id, data: values },
      {
        onError: (error) => {
          const apiError = error;
          toast.error(apiError.message || "Failed to update homework");

          if (apiError.errors && apiError.errors.length) {
            apiError.errors.forEach(({ field, message }) => {
              form.setError(field as keyof UpdateHomeworkFormData, { message });
            });
          }
        },
        onSuccess: (response) => {
          toast.success(response.message || "Homework updated successfully");
          onSuccess?.();
          closeEditHomeworkModal();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeEditHomeworkModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Homework</DialogTitle>
          <DialogDescription>Update homework details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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
                  <FormLabel>Description</FormLabel>
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

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditHomeworkModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateHomework.isPending}>
                {updateHomework.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
