"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, UserX, Eye, RefreshCw } from "lucide-react";
import {
  useRoute,
  useStudentsByRoute,
  useDeactivateStudentTransport,
  useChangeStop,
  useStopsByRoute,
} from "@/features/transport";
import { useStudentByTransport } from "@/features/transport";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { AssignStudentModal } from "@/components/modals/transport/AssignStudentModal";
import { BulkAssignModal } from "@/components/modals/transport/BulkAssignModal";

export default function RouteStudentsTab() {
  const params = useParams();
  const routeId = parseInt(params.routeId as string);

  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [selectedTransportId, setSelectedTransportId] = useState<number | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Deactivate states
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deactivateData, setDeactivateData] = useState<{
    id: number;
    studentName: string;
  } | null>(null);

  // Stop change states
  const [isStopChangeDialogOpen, setIsStopChangeDialogOpen] = useState(false);
  const [stopChangeData, setStopChangeData] = useState<{
    transportId: number;
    currentStopId: number;
    currentStopName: string;
    studentName: string;
  } | null>(null);
  const [newStopId, setNewStopId] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [changeReason, setChangeReason] = useState<string>("");

  // Data fetching
  const { data: route, isLoading: routeLoading } = useRoute(routeId);
  const {
    data: studentsData,
    isLoading: studentsLoading,
    refetch,
    error,
  } = useStudentsByRoute(routeId);
  const { data: stops, refetch: refetchStops } = useStopsByRoute(routeId);
  const { data: selectedStudent, isLoading: studentLoading } =
    useStudentByTransport(selectedTransportId || 0);

  // Mutations
  const deactivateStudent = useDeactivateStudentTransport();
  const changeStop = useChangeStop();

  // Helper functions
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Don't proceed if no sessionId
  if (route && !route.sessionId) {
    return (
      <div className="text-center py-8 text-red-500">
        Route session information is missing. Please check route configuration.
      </div>
    );
  }

  // Handlers
  const handleViewStudent = (transportId: number) => {
    setSelectedTransportId(transportId);
    setIsViewModalOpen(true);
  };

  const handleDeactivateClick = (transportId: number, studentName: string) => {
    setDeactivateData({ id: transportId, studentName });
    setIsDeactivateDialogOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateData) return;

    try {
      await deactivateStudent.mutateAsync({
        id: deactivateData.id,
        data: { endDate: new Date().toISOString().split("T")[0] },
      });
      toast.success(
        `${deactivateData.studentName} has been deactivated from transport`,
      );
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate student");
    } finally {
      setIsDeactivateDialogOpen(false);
      setDeactivateData(null);
    }
  };

  const handleStopChangeClick = (
    transportId: number,
    studentName: string,
    currentStopId: number,
    currentStopName: string,
  ) => {
    setStopChangeData({
      transportId,
      currentStopId,
      currentStopName,
      studentName,
    });
    setNewStopId("");
    setEffectiveDate(getTomorrow());
    setChangeReason("");
    setIsStopChangeDialogOpen(true);
  };

  const handleConfirmStopChange = async () => {
    if (!stopChangeData || !newStopId || !effectiveDate) return;

    const selectedStop = stops?.find((s) => s.id.toString() === newStopId);

    try {
      await changeStop.mutateAsync({
        transportId: stopChangeData.transportId,
        data: {
          newStopId: parseInt(newStopId),
          effectiveDate,
          reason: changeReason || undefined,
        },
      });

      toast.success(
        `${stopChangeData.studentName} stop changed from ${stopChangeData.currentStopName} to ${selectedStop?.name} effective ${format(new Date(effectiveDate), "dd MMM yyyy")}`,
      );
      refetch();
      refetchStops();
    } catch (error: any) {
      toast.error(error.message || "Failed to change stop");
    } finally {
      setIsStopChangeDialogOpen(false);
      setStopChangeData(null);
      setNewStopId("");
      setEffectiveDate("");
      setChangeReason("");
    }
  };

  // Loading state
  if (routeLoading || studentsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load students. Please try again.
      </div>
    );
  }

  const students = studentsData?.students || [];
  const summary = studentsData?.summary;

  return (
    <div className="space-y-4">
      {/* Header with Summary */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Students on {route?.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage student transport assignments for this route
          </p>
          {summary && (
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-gray-600">
                Total:{" "}
                <span className="font-semibold">{summary.totalStudents}</span>
              </span>
              <span className="text-green-600">
                Active:{" "}
                <span className="font-semibold">{summary.activeStudents}</span>
              </span>
              <span className="text-gray-500">
                Inactive:{" "}
                <span className="font-semibold">
                  {summary.inactiveStudents}
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            size="sm"
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Assign Student
          </Button>
          <Button
            onClick={() => setIsBulkAssignModalOpen(true)}
            size="sm"
            variant="outline"
          >
            Bulk Assign
          </Button>
        </div>
      </div>

      {/* Students Table */}
      {students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No students assigned to this route yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.transportDetails.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.admissionNo}</TableCell>
                    <TableCell>{student.transportDetails.stopName}</TableCell>
                    <TableCell>
                      ₹{student.transportDetails.monthlyFee?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(student.transportDetails.startDate),
                        "dd MMM yyyy",
                      )}
                    </TableCell>
                    <TableCell>
                      {student.transportDetails.endDate
                        ? format(
                            new Date(student.transportDetails.endDate),
                            "dd MMM yyyy",
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.transportDetails.isActive
                            ? "default"
                            : "secondary"
                        }
                      >
                        {student.transportDetails.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleViewStudent(student.transportDetails.id)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {student.transportDetails.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-700"
                            onClick={() =>
                              handleStopChangeClick(
                                student.transportDetails.id,
                                student.name,
                                student.transportDetails.stopId,
                                student.transportDetails.stopName,
                              )
                            }
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() =>
                            handleDeactivateClick(
                              student.transportDetails.id,
                              student.name,
                            )
                          }
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Assign Student Modal */}
      {route?.sessionId && (
        <>
          <AssignStudentModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            sessionId={route.sessionId}
            defaultRouteId={routeId}
            onSuccess={() => refetch()}
          />
          <BulkAssignModal
            isOpen={isBulkAssignModalOpen}
            onClose={() => setIsBulkAssignModalOpen(false)}
            sessionId={route.sessionId}
            defaultRouteId={routeId}
            onSuccess={() => refetch()}
          />
        </>
      )}

      {/* View Student Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Student Transport Details</DialogTitle>
          </DialogHeader>
          {studentLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : selectedStudent ? (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-semibold text-lg">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Admission No: {selectedStudent.admissionNo}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium">
                    {selectedStudent.transportDetails.routeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stop</p>
                  <p className="font-medium">
                    {selectedStudent.transportDetails.stopName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Fee</p>
                  <p className="font-medium">
                    ₹
                    {selectedStudent.transportDetails.monthlyFee?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    variant={
                      selectedStudent.transportDetails.isActive
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedStudent.transportDetails.isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedStudent.transportDetails.startDate),
                      "dd MMM yyyy",
                    )}
                  </p>
                </div>
                {selectedStudent.transportDetails.endDate && (
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedStudent.transportDetails.endDate),
                        "dd MMM yyyy",
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Parent / Guardian Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Father</p>
                    <p>{selectedStudent.fatherName || "N/A"}</p>
                    <p className="text-xs text-gray-500">
                      {selectedStudent.fatherPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mother</p>
                    <p>{selectedStudent.motherName || "N/A"}</p>
                    <p className="text-xs text-gray-500">
                      {selectedStudent.motherPhone}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {selectedStudent.user.email || "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-500">Phone:</span>{" "}
                    {selectedStudent.user.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No student data found
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Transport Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate transport for{" "}
              <span className="font-semibold">
                {deactivateData?.studentName}
              </span>
              ? This will set the end date to today and mark the assignment as
              inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeactivate}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Change Dialog */}
      <Dialog
        open={isStopChangeDialogOpen}
        onOpenChange={setIsStopChangeDialogOpen}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              Change Stop for {stopChangeData?.studentName}
            </DialogTitle>
            <DialogDescription>
              Change the stop from{" "}
              <span className="font-semibold">
                {stopChangeData?.currentStopName}
              </span>{" "}
              to a new stop. The current assignment will be deactivated and a
              new one will be created from the effective date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newStop">Select New Stop *</Label>
              <Select value={newStopId} onValueChange={setNewStopId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stop" />
                </SelectTrigger>
                <SelectContent>
                  {stops
                    ?.filter(
                      (stop) =>
                        stop.id.toString() !==
                        stopChangeData?.currentStopId.toString(),
                    )
                    .map((stop) => (
                      <SelectItem key={stop.id} value={stop.id.toString()}>
                        {stop.name} - ₹{stop.monthlyFee.toLocaleString()}/month
                        {stop.stopOrder && ` (Stop ${stop.stopOrder})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <input
                type="date"
                id="effectiveDate"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                min={getTomorrow()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                The change will take effect from this date. Must be in the
                future.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Student moved to new location, Route optimization, etc."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStopChangeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStopChange}
              disabled={!newStopId || !effectiveDate}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
