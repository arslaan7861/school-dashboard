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

import { useUpdateRoute, TransportRoute } from "@/features/transport";

const editRouteSchema = z.object({
  name: z
    .string()
    .min(2, "Route name must be at least 2 characters")
    .max(100)
    .optional(),
  vehicleNumber: z.string().optional().nullable(),
});

type EditRouteForm = z.infer<typeof editRouteSchema>;

interface EditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: TransportRoute | null;
  onSuccess?: () => void;
}

export function EditRouteModal({
  isOpen,
  onClose,
  route,
  onSuccess,
}: EditRouteModalProps) {
  const updateRoute = useUpdateRoute();

  const form = useForm<EditRouteForm>({
    resolver: zodResolver(editRouteSchema),
    defaultValues: {
      name: "",
      vehicleNumber: "",
    },
  });

  useEffect(() => {
    if (route && isOpen) {
      form.reset({
        name: route.name,
        vehicleNumber: route.vehicleNumber || "",
      });
    }
  }, [route, isOpen, form]);

  const onSubmit = async (data: EditRouteForm) => {
    if (!route) return;

    try {
      await updateRoute.mutateAsync({ id: route.id, data });
      toast.success("Route updated successfully");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update route");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Route</DialogTitle>
          <DialogDescription>
            Update route information. Leave fields empty to keep current values.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., North Route"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., KA-01-AB-1234"
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
              <Button type="submit" disabled={updateRoute.isPending}>
                {updateRoute.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
