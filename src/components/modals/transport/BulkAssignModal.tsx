"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import {
  useBulkAssignStudents,
  useRoutes,
  useStopsByRoute,
} from "@/features/transport";
import { useStudents } from "@/features/students/hooks.student";

// Use string types for form values to avoid coercion issues
const bulkAssignmentSchema = z.object({
  routeId: z.string().min(1, "Route is required"),
  stopId: z.string().min(1, "Stop is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  selectedStudentIds: z
    .array(z.string())
    .min(1, "At least one student must be selected"),
});

type BulkAssignmentForm = z.infer<typeof bulkAssignmentSchema>;

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  defaultRouteId?: number;
  defaultStopId?: number;
  onSuccess?: () => void;
}

export function BulkAssignModal({
  isOpen,
  onClose,
  sessionId,
  defaultRouteId,
  defaultStopId,
  onSuccess,
}: BulkAssignModalProps) {
  const { data: routes } = useRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(
    defaultRouteId?.toString(),
  );
  const { data: stops } = useStopsByRoute(parseInt(selectedRouteId || "0"));
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch students for selection
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    sessionId,
    showUnenrolled: false,
    page: 1,
    limit: 500,
  });

  const bulkAssign = useBulkAssignStudents();

  const form = useForm<BulkAssignmentForm>({
    resolver: zodResolver(bulkAssignmentSchema),
    defaultValues: {
      routeId: defaultRouteId?.toString() || "",
      stopId: defaultStopId?.toString() || "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
      selectedStudentIds: [],
    },
  });

  const watchRouteId = form.watch("routeId");
  const selectedStudentIds = form.watch("selectedStudentIds");

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    const students = studentsData?.students || [];
    if (!searchTerm) return students;

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.class?.name &&
          student.class.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [studentsData?.students, searchTerm]);

  // Handle select all - use useCallback to prevent recreation
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allStudentIds = filteredStudents.map(
          (student) =>
            student.classRelation?.id?.toString() || student.id.toString(),
        );
        form.setValue("selectedStudentIds", allStudentIds);
      } else {
        form.setValue("selectedStudentIds", []);
      }
    },
    [filteredStudents, form],
  );

  // Check if all filtered students are selected
  const isAllSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    const allIds = filteredStudents.map(
      (student) =>
        student.classRelation?.id?.toString() || student.id.toString(),
    );
    return allIds.every((id) => selectedStudentIds.includes(id));
  }, [filteredStudents, selectedStudentIds]);

  useEffect(() => {
    if (watchRouteId && watchRouteId !== selectedRouteId) {
      setSelectedRouteId(watchRouteId);
      form.setValue("stopId", "");
    }
  }, [watchRouteId, form, selectedRouteId]);

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        routeId: defaultRouteId?.toString() || "",
        stopId: defaultStopId?.toString() || "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
        selectedStudentIds: [],
      });
      setSelectedRouteId(defaultRouteId?.toString());
      setSearchTerm("");
    }
  }, [isOpen, form, defaultRouteId, defaultStopId]);

  const onSubmit = async (data: BulkAssignmentForm) => {
    try {
      // Transform data to match API expected format
      const assignments = data.selectedStudentIds.map((studentId) => ({
        classStudentId: parseInt(studentId),
        routeId: parseInt(data.routeId),
        stopId: parseInt(data.stopId),
        startDate: data.startDate,
        endDate: data.endDate || null,
      }));

      const result = await bulkAssign.mutateAsync({ assignments });
      toast.success(`${result.data.created} students assigned successfully`);

      if (result.data.failed > 0) {
        toast.warning(
          `${result.data.failed} assignments failed. Check console for details.`,
        );
        console.error("Bulk assign errors:", result.data.errors);
      }

      form.reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign students");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Assign Students to Transport</DialogTitle>
          <DialogDescription>
            Select students and assign them to the same route and stop at once.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Common Settings Section */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
              <h4 className="font-medium text-gray-900">
                Common Settings for All Students
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="routeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a route" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routes?.map((route) => (
                            <SelectItem
                              key={route.id}
                              value={route.id.toString()}
                            >
                              {route.name}{" "}
                              {route.vehicleNumber &&
                                `(${route.vehicleNumber})`}
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
                            <SelectItem
                              key={stop.id}
                              value={stop.id.toString()}
                            >
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
              </div>

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
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Students Selection Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">
                  Select Students to Assign
                </h4>
                <Badge variant="outline" className="text-sm">
                  {selectedStudentIds.length} student
                  {selectedStudentIds.length !== 1 ? "s" : ""} selected
                </Badge>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, admission number, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Select All Checkbox */}
              {filteredStudents.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All ({filteredStudents.length} students)
                  </label>
                </div>
              )}

              {/* Students List with Checkboxes */}
              <ScrollArea className="h-[400px] border rounded-md">
                {studentsLoading ? (
                  <div className="flex justify-center items-center h-full py-8">
                    <p className="text-gray-500">Loading students...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No students match your search"
                        : "No students found"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredStudents.map((student) => {
                      const studentId =
                        student.classRelation?.id?.toString() ||
                        student.id.toString();
                      const isChecked = selectedStudentIds.includes(studentId);

                      return (
                        <div
                          key={studentId}
                          className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id={`student-${studentId}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                form.setValue("selectedStudentIds", [
                                  ...selectedStudentIds,
                                  studentId,
                                ]);
                              } else {
                                form.setValue(
                                  "selectedStudentIds",
                                  selectedStudentIds.filter(
                                    (id) => id !== studentId,
                                  ),
                                );
                              }
                            }}
                            className="mt-1"
                          />
                          <label
                            htmlFor={`student-${studentId}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              Admission: {student.admissionNo}
                            </div>
                            <div className="text-sm text-gray-500">
                              Class: {student.class?.name}{" "}
                              {student.class?.section || ""}
                            </div>
                            {student.user?.email && (
                              <div className="text-xs text-gray-400">
                                Email: {student.user.email}
                              </div>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              <FormField
                control={form.control}
                name="selectedStudentIds"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  bulkAssign.isPending || selectedStudentIds.length === 0
                }
              >
                {bulkAssign.isPending
                  ? "Assigning..."
                  : `Assign ${selectedStudentIds.length} Student${selectedStudentIds.length !== 1 ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
