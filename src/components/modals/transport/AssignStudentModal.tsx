"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useAssignStudent,
  useRoutes,
  useStopsByRoute,
} from "@/features/transport";
import { useStudents } from "@/features/students/hooks.student";

// Define the schema with proper types
const assignStudentSchema = z.object({
  classStudentId: z.string().min(1, "Please select a student"),
  routeId: z.string().min(1, "Please select a route"),
  stopId: z.string().min(1, "Please select a stop"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
});

type AssignStudentForm = z.infer<typeof assignStudentSchema>;

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  defaultRouteId?: number;
  defaultStopId?: number;
  onSuccess?: () => void;
}

export function AssignStudentModal({
  isOpen,
  onClose,
  sessionId,
  defaultRouteId,
  defaultStopId,
  onSuccess,
}: AssignStudentModalProps) {
  const { data: routes } = useRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState<number | undefined>(
    defaultRouteId,
  );
  const { data: stops } = useStopsByRoute(selectedRouteId || 0);

  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    sessionId,
    showUnenrolled: false,
    page: 1,
    limit: 100,
  });

  const assignStudent = useAssignStudent();

  const form = useForm<AssignStudentForm>({
    resolver: zodResolver(assignStudentSchema),
    defaultValues: {
      classStudentId: "",
      routeId: defaultRouteId?.toString() || "",
      stopId: defaultStopId?.toString() || "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
    },
  });

  const watchRouteId = form.watch("routeId");

  useEffect(() => {
    if (watchRouteId && watchRouteId !== selectedRouteId?.toString()) {
      setSelectedRouteId(parseInt(watchRouteId));
      form.setValue("stopId", "");
    }
  }, [watchRouteId, form, selectedRouteId]);

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        classStudentId: "",
        routeId: defaultRouteId?.toString() || "",
        stopId: defaultStopId?.toString() || "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
      });
      setSelectedRouteId(defaultRouteId);
    }
  }, [isOpen, form, defaultRouteId, defaultStopId]);

  const onSubmit = async (data: AssignStudentForm) => {
    try {
      // Convert string values to numbers before sending to API
      const payload = {
        classStudentId: parseInt(data.classStudentId),
        routeId: parseInt(data.routeId),
        stopId: parseInt(data.stopId),
        startDate: data.startDate,
        endDate: data.endDate || null,
      };
      await assignStudent.mutateAsync(payload);
      toast.success("Student assigned to transport successfully");
      form.reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign student");
    }
  };

  const students = studentsData?.students || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Assign Student to Transport</DialogTitle>
          <DialogDescription>
            Select a student and assign them to a route and stop.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classStudentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {studentsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading students...
                        </SelectItem>
                      ) : students.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No students found
                        </SelectItem>
                      ) : (
                        students.map((student) => (
                          <SelectItem
                            key={student.classRelation?.id || student.id}
                            value={
                              student.classRelation?.id?.toString() ||
                              student.id.toString()
                            }
                          >
                            {student.name} - {student.class?.name || "No Class"}{" "}
                            {student.class?.section || ""}
                            {student.admissionNo && ` (${student.admissionNo})`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="routeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a route" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {routes?.map((route) => (
                        <SelectItem key={route.id} value={route.id.toString()}>
                          {route.name}{" "}
                          {route.vehicleNumber && `(${route.vehicleNumber})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedRouteId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedRouteId
                              ? "Select route first"
                              : "Select a stop"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stops?.map((stop) => (
                        <SelectItem key={stop.id} value={stop.id.toString()}>
                          {stop.name} - ₹{stop.monthlyFee.toLocaleString()}
                          /month
                          {stop.stopOrder !== undefined &&
                            ` (Stop ${stop.stopOrder})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignStudent.isPending}>
                {assignStudent.isPending ? "Assigning..." : "Assign Student"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
