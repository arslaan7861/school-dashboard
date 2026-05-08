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

import { useCreateStop } from "@/features/transport";

// Use string types for form values to avoid coercion issues
const createStopSchema = z.object({
  name: z.string().min(2, "Stop name must be at least 2 characters").max(100),
  monthlyFee: z.string().min(1, "Monthly fee is required"),
  stopOrder: z.string().optional(),
});

type CreateStopForm = z.infer<typeof createStopSchema>;

interface CreateStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: number;
  onSuccess?: () => void;
}

export function CreateStopModal({
  isOpen,
  onClose,
  routeId,
  onSuccess,
}: CreateStopModalProps) {
  const createStop = useCreateStop();

  const form = useForm<CreateStopForm>({
    resolver: zodResolver(createStopSchema),
    defaultValues: {
      name: "",
      monthlyFee: "",
      stopOrder: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        monthlyFee: "",
        stopOrder: "",
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: CreateStopForm) => {
    try {
      // Convert string values to numbers before sending to API
      const payload = {
        name: data.name,
        monthlyFee: parseFloat(data.monthlyFee),
        stopOrder: data.stopOrder ? parseInt(data.stopOrder) : undefined,
        routeId,
      };

      await createStop.mutateAsync(payload);
      toast.success("Stop created successfully");
      form.reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create stop");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Stop</DialogTitle>
          <DialogDescription>
            Add a new stop to this route. The stop order determines the
            sequence.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Name *</FormLabel>
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
                  <FormLabel>Monthly Fee (₹) *</FormLabel>
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
                    <Input
                      type="number"
                      placeholder="Auto-assigned if empty"
                      {...field}
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
              <Button type="submit" disabled={createStop.isPending}>
                {createStop.isPending ? "Creating..." : "Create Stop"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
