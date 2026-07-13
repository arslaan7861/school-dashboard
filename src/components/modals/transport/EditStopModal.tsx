"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";

import { useUpdateStop, RouteStop } from "@/features/transport";

// Use string types for form values to avoid coercion issues
const editStopSchema = z.object({
  name: z
    .string()
    .min(2, "Stop name must be at least 2 characters")
    .max(100)
    .optional(),
  monthlyFee: z.string().optional(),
  stopOrder: z.string().optional(),
});

type EditStopForm = z.infer<typeof editStopSchema>;

interface EditStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stop: RouteStop | null;
  onSuccess?: () => void;
}

export function EditStopModal({
  isOpen,
  onClose,
  stop,
  onSuccess,
}: EditStopModalProps) {
  const updateStop = useUpdateStop();

  const form = useForm<EditStopForm>({
    resolver: zodResolver(editStopSchema),
    defaultValues: {
      name: "",
      monthlyFee: "",
      stopOrder: "",
    },
  });

  useEffect(() => {
    if (stop && isOpen) {
      form.reset({
        name: stop.name,
        monthlyFee: stop.monthlyFee?.toString() || "",
        stopOrder: stop.stopOrder?.toString() || "",
      });
    }
  }, [stop, isOpen, form]);

  const onSubmit = async (data: EditStopForm) => {
    if (!stop) return;

    // Build payload with only provided values
    const payload: any = {};

    if (data.name && data.name !== stop.name) {
      payload.name = data.name;
    }

    if (data.monthlyFee && data.monthlyFee !== stop.monthlyFee?.toString()) {
      payload.monthlyFee = parseFloat(data.monthlyFee);
    }

    if (data.stopOrder && data.stopOrder !== stop.stopOrder?.toString()) {
      payload.stopOrder = parseInt(data.stopOrder);
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save");
      onClose();
      return;
    }

    try {
      await updateStop.mutateAsync({ id: stop.id, data: payload });
      toast.success("Stop updated successfully");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update stop");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Edit Stop</DialogTitle>
          <DialogDescription>
            Update stop information. Leave fields empty to keep current values.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col overflow-hidden flex-1">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., City Center" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Fee (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stopOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Order</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            </div>

            <DialogFooter className="px-6 py-4 border-t bg-gray-50/50 shrink-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStop.isPending}>
                {updateStop.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
