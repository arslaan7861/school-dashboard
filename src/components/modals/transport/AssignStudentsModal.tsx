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
import { Badge } from "@/components/ui/badge";

import {
  useBulkAssignStudents,
  useRoutes,
  useStopsByRoute,
  useStudentsByRoute,
} from "@/features/transport";
import { useStudents } from "@/features/students/hooks.student";
import { useClasses } from "@/features/class/hooks.class";

// Use string types for form values to avoid coercion issues
const assignStudentsSchema = z.object({
  routeId: z.string().min(1, "Route is required"),
  stopId: z.string().min(1, "Stop is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  selectedStudentIds: z
    .array(z.string())
    .min(1, "At least one student must be selected"),
});

type AssignStudentsForm = z.infer<typeof assignStudentsSchema>;

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  defaultRouteId?: number;
  defaultStopId?: number;
  onSuccess?: () => void;
}

export function AssignStudentsModal({
  isOpen,
  onClose,
  sessionId,
  defaultRouteId,
  defaultStopId,
  onSuccess,
}: AssignStudentsModalProps) {
  const { data: routes } = useRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(
    defaultRouteId?.toString(),
  );
  const { data: stops } = useStopsByRoute(parseInt(selectedRouteId || "0"));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  const { data: classesData } = useClasses(sessionId);
  const classes = classesData?.data || [];

  const { data: routeStudents } = useStudentsByRoute(
    parseInt(selectedRouteId || "0"),
    true
  );

  const enrolledStudentIds = useMemo(() => {
    if (!routeStudents?.students) return new Set<string>();
    return new Set(
      routeStudents.students.map(
        (s: any) =>
          s.transportDetails?.classStudentId?.toString() || s.id?.toString(),
      ),
    );
  }, [routeStudents]);

  // Fetch students for selection
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    sessionId,
    showUnenrolled: false,
    classId: selectedClassId !== "all" ? parseInt(selectedClassId) : undefined,
    page: 1,
    limit: 500,
  });

  const bulkAssign = useBulkAssignStudents();

  const form = useForm<AssignStudentsForm>({
    resolver: zodResolver(assignStudentsSchema),
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

  // Filter students by search term and exclude enrolled
  const filteredStudents = useMemo(() => {
    let students = studentsData?.students || [];

    // Exclude students already enrolled in this route
    if (enrolledStudentIds.size > 0) {
      students = students.filter((student) => {
        const id = student.classRelation?.id?.toString() || student.id.toString();
        return !enrolledStudentIds.has(id);
      });
    }

    if (!searchTerm) return students;

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.class?.name &&
          student.class.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [studentsData?.students, searchTerm, enrolledStudentIds]);

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
      setSelectedClassId("all");
    }
  }, [isOpen, form, defaultRouteId, defaultStopId]);

  const onSubmit = async (data: AssignStudentsForm) => {
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
      if (result.data.failed > 0) {
        toast.error(
          `${result.data.failed} assignments failed. Some students might already be enrolled.`,
        );
        console.error("Bulk assign errors:", result.data.errors);
      } else {
        toast.success(`${result.data.created} students assigned successfully`);
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
      <DialogContent className="max-w-[95vw]! h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-white z-10">
          <DialogTitle className="text-xl">
            Assign Students to Transport
          </DialogTitle>
          <DialogDescription>
            Configure route settings and select students to assign them in bulk.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col overflow-hidden flex-1"
          >
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* LEFT SIDEBAR: Configuration */}
              <div className="w-[380px] shrink-0 border-r bg-gray-50 flex flex-col p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                      Transport Configuration
                    </h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="routeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-gray-700">
                              Route *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white">
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
                            <FormLabel className="font-medium text-gray-700">
                              Stop *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!selectedRouteId}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white">
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
                                    {stop.name} - ₹
                                    {stop.monthlyFee.toLocaleString()}/month
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
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                      Duration Settings
                    </h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-gray-700">
                              Start Date *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="bg-white"
                              />
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
                            <FormLabel className="font-medium text-gray-700">
                              End Date (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                className="bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT: Students Split View */}
              <div className="flex-1 flex flex-col min-w-0 bg-white p-6">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Student Selection
                  </h3>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-blue-600">
                      {selectedStudentIds.length}
                    </span>{" "}
                    students selected
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                  {/* LEFT PANE: Available Students */}
                  <div className="flex flex-col border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden min-h-0">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3 shrink-0">
                      <h4 className="font-medium text-gray-900">
                        Available Students
                      </h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name, admission no..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-white"
                        />
                      </div>
                      <Select
                        value={selectedClassId}
                        onValueChange={setSelectedClassId}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {classes.map((c: any) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name} {c.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filteredStudents.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <Checkbox
                            id="select-all"
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                          />
                          <label
                            htmlFor="select-all"
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Select All ({filteredStudents.length})
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white">
                      {studentsLoading ? (
                        <div className="flex justify-center items-center h-full py-12 text-gray-500">
                          Loading...
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="flex justify-center items-center h-full py-12 text-gray-500">
                          {searchTerm
                            ? "No matches found"
                            : "No students found"}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {filteredStudents.map((student) => {
                            const studentId =
                              student.classRelation?.id?.toString() ||
                              student.id.toString();
                            const isChecked =
                              selectedStudentIds.includes(studentId);
                            return (
                              <div
                                key={studentId}
                                className={`flex items-start gap-3 p-4 transition-colors ${
                                  isChecked
                                    ? "bg-blue-50/40"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <Checkbox
                                  id={`available-${studentId}`}
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
                                  htmlFor={`available-${studentId}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-semibold text-sm text-gray-900">
                                    {student.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {student.class?.name}{" "}
                                    {student.class?.section || ""} • Adm:{" "}
                                    {student.admissionNo}
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANE: Selected Students */}
                  <div className="flex flex-col border border-gray-200 rounded-xl shadow-sm bg-gray-50/30 overflow-hidden min-h-0">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shrink-0">
                      <h4 className="font-medium text-gray-900">
                        Selected Students
                      </h4>
                      {selectedStudentIds.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            form.setValue("selectedStudentIds", [])
                          }
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-transparent">
                      {selectedStudentIds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 text-sm font-medium">
                            No students selected
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Select students from the left panel
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {selectedStudentIds.map((id) => {
                            const student = studentsData?.students.find(
                              (s) =>
                                (s.classRelation?.id?.toString() ||
                                  s.id.toString()) === id,
                            );
                            if (!student) return null;

                            return (
                              <div
                                key={id}
                                className="flex items-center justify-between p-4 hover:bg-white transition-colors"
                              >
                                <div>
                                  <div className="font-semibold text-sm text-gray-900">
                                    {student.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {student.class?.name}{" "}
                                    {student.class?.section || ""}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    form.setValue(
                                      "selectedStudentIds",
                                      selectedStudentIds.filter(
                                        (sId) => sId !== id,
                                      ),
                                    );
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="selectedStudentIds"
                  render={() => (
                    <FormItem className="hidden">
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* FOOTER */}
            <DialogFooter className="px-6 py-4 border-t bg-gray-50/80 shrink-0 z-10 flex items-center justify-between">
              <p className="text-sm text-gray-500 hidden sm:block">
                Please ensure all settings are correct before assigning.
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    bulkAssign.isPending || selectedStudentIds.length === 0
                  }
                  className="min-w-[120px]"
                >
                  {bulkAssign.isPending
                    ? "Assigning..."
                    : `Assign ${selectedStudentIds.length} Student${selectedStudentIds.length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
