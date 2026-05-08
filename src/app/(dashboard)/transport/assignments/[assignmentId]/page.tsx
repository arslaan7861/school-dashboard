"use client";

import { useParams, useRouter } from "next/navigation";
import { useStudentTransportHistory } from "@/features/transport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Bus,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export default function AssignmentHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = parseInt(params.assignmentId as string);

  const { data, isLoading, error } = useStudentTransportHistory(assignmentId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load student transport history</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { student, history, summary } = data;
  const currentAssignment = summary.currentAssignment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-gray-500 mt-1">
            Admission No: {student.admissionNo} | Class Student ID:{" "}
            {student.classStudentId}
          </p>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Status
            </CardTitle>
            <Bus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={currentAssignment ? "default" : "secondary"}
              className="text-sm"
            >
              {currentAssignment ? "Active Transport" : "No Active Transport"}
            </Badge>
            {currentAssignment && (
              <p className="text-xs text-gray-500 mt-2">
                Since{" "}
                {format(new Date(currentAssignment.startDate), "dd MMM yyyy")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAssignments}</div>
            <p className="text-xs text-gray-500">
              {summary.activeAssignments} active, {summary.inactiveAssignments}{" "}
              inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Route</CardTitle>
            <MapPin className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-medium">
              {currentAssignment?.routeName || "N/A"}
            </div>
            <p className="text-xs text-gray-500">
              {currentAssignment?.stopName || "No stop assigned"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Fee</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{currentAssignment?.monthlyFee?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-500">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignment Details */}
      {currentAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>Current Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Route:</span>
                  <span className="font-medium">
                    {currentAssignment.routeName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Stop:</span>
                  <span className="font-medium">
                    {currentAssignment.stopName}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Started:</span>
                  <span className="font-medium">
                    {format(
                      new Date(currentAssignment.startDate),
                      "dd MMM yyyy",
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Monthly Fee:</span>
                  <span className="font-medium">
                    ₹{currentAssignment.monthlyFee.toLocaleString()}
                  </span>
                </div>
              </div>
              {currentAssignment.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Notes:</p>
                  <p className="text-sm">{currentAssignment.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
          <p className="text-sm text-gray-500">
            Complete history of all transport assignments for this student
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transport history found</p>
            </div>
          ) : (
            <div className="rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Stop</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((assignment) => (
                    <TableRow
                      key={assignment.id}
                      className={assignment.isActive ? "bg-green-50" : ""}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {format(
                              new Date(assignment.startDate),
                              "dd MMM yyyy",
                            )}
                          </div>
                          {assignment.endDate && (
                            <div className="text-xs text-gray-500">
                              to{" "}
                              {format(
                                new Date(assignment.endDate),
                                "dd MMM yyyy",
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{assignment.routeName}</TableCell>
                      <TableCell>{assignment.stopName}</TableCell>
                      <TableCell>
                        ₹{assignment.monthlyFee.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.isActive ? "default" : "secondary"
                          }
                        >
                          {assignment.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <Accordion type="single" collapsible className="w-full">
                          {assignment.notes && assignment.notes.length > 50 ? (
                            <AccordionItem value="notes" className="border-0">
                              <AccordionTrigger className="py-0 text-xs text-blue-500 hover:no-underline">
                                View Notes
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-gray-600 pb-0">
                                {assignment.notes}
                              </AccordionContent>
                            </AccordionItem>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {assignment.notes || "-"}
                            </span>
                          )}
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline View (Alternative display) */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
              {history.map((assignment, index) => (
                <div key={assignment.id} className="relative">
                  <div className="absolute -left-[29px] mt-1">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        assignment.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        variant={assignment.isActive ? "default" : "outline"}
                      >
                        {assignment.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm font-medium">
                        {format(new Date(assignment.startDate), "dd MMM yyyy")}
                      </span>
                      {assignment.endDate && (
                        <>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm">
                            {format(
                              new Date(assignment.endDate),
                              "dd MMM yyyy",
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="font-medium">{assignment.routeName}</p>
                      <p className="text-sm text-gray-500">
                        {assignment.stopName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Fee: ₹{assignment.monthlyFee.toLocaleString()}/month
                      </p>
                      {assignment.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">
                          "{assignment.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
