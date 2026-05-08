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

import { useAddDisabledMonth } from "@/features/transport";

const addDisabledMonthSchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
  reason: z.string().optional().nullable(),
});

type AddDisabledMonthForm = z.infer<typeof addDisabledMonthSchema>;

interface AddDisabledMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: number;
  onSuccess?: () => void;
}

export function AddDisabledMonthModal({
  isOpen,
  onClose,
  routeId,
  onSuccess,
}: AddDisabledMonthModalProps) {
  const addDisabledMonth = useAddDisabledMonth();

  const form = useForm<AddDisabledMonthForm>({
    resolver: zodResolver(addDisabledMonthSchema),
    defaultValues: {
      yearMonth: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (data: AddDisabledMonthForm) => {
    try {
      await addDisabledMonth.mutateAsync({
        routeId,
        yearMonth: data.yearMonth,
        reason: data.reason,
      });
      toast.success(`Route disabled for ${data.yearMonth}`);
      form.reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add disabled month");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Disable Route for Month</DialogTitle>
          <DialogDescription>
            The route will not be active during this month. No transport fees
            will be charged.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="yearMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month *</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Summer Vacation"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={addDisabledMonth.isPending}>
                {addDisabledMonth.isPending
                  ? "Adding..."
                  : "Add Disabled Month"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
