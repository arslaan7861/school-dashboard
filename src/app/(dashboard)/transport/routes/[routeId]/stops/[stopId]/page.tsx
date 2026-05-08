"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useRoute,
  useStopsByRoute,
  useStudentsByStop,
} from "@/features/transport";
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
import { ArrowLeft, MapPin, DollarSign, Users, Edit } from "lucide-react";
import { format } from "date-fns";

export default function StopDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = parseInt(params.routeId as string);
  const stopId = parseInt(params.stopId as string);

  const { data: route, isLoading: routeLoading } = useRoute(routeId);
  const { data: stops, isLoading: stopsLoading } = useStopsByRoute(routeId);
  const { data: studentsData, isLoading: studentsLoading } =
    useStudentsByStop(stopId);

  const stop = stops?.find((s) => s.id === stopId);
  const stopOrder = stops?.findIndex((s) => s.id === stopId) || 0;

  if (routeLoading || stopsLoading || studentsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Stop not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const students = studentsData?.students || [];
  const summary = studentsData?.summary;
  const activeStudents = students.filter((s) => s.transportDetails.isActive);
  const inactiveStudents = students.filter((s) => !s.transportDetails.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{stop.name}</h1>
          <p className="text-gray-500 mt-1">
            Stop #{stop.stopOrder || stopOrder + 1} on {route?.name}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1"
          onClick={() =>
            router.push(`/transport/routes/${routeId}/stops/${stopId}/edit`)
          }
        >
          <Edit className="h-4 w-4" />
          Edit Stop
        </Button>
      </div>

      {/* Stop Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stop Order</CardTitle>
            <MapPin className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stop.stopOrder || stopOrder + 1}
            </div>
            <p className="text-xs text-gray-500">Sequence on route</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Fee</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stop.monthlyFee.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Per student per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalStudents || 0}
            </div>
            <p className="text-xs text-gray-500">
              {summary?.activeStudents || 0} active,{" "}
              {summary?.inactiveStudents || 0} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{summary?.totalMonthlyRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500">From active students</p>
          </CardContent>
        </Card>
      </div>

      {/* Students assigned to this stop */}
      <Card>
        <CardHeader>
          <CardTitle>Students at this Stop</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {activeStudents.length} active, {inactiveStudents.length} inactive
            students
          </p>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No students assigned to this stop yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Student Name</TableHead>
                    <TableHead className="w-[20%]">Admission No</TableHead>
                    <TableHead className="w-[20%]">Route</TableHead>
                    <TableHead className="w-[15%]">Start Date</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow
                      key={student.transportDetails.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        router.push(
                          `/transport/assignments/${student.classStudentId}`,
                        )
                      }
                    >
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.admissionNo}</TableCell>
                      <TableCell>
                        {student.transportDetails.routeName}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(student.transportDetails.startDate),
                          "dd MMM yyyy",
                        )}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active vs Inactive Summary */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeStudents.slice(0, 5).map((student) => (
                  <div
                    key={student.transportDetails.id}
                    className="flex justify-between items-center py-1 border-b last:border-0"
                  >
                    <span>{student.name}</span>
                    <Badge variant="outline" className="text-green-600">
                      Since{" "}
                      {format(
                        new Date(student.transportDetails.startDate),
                        "MMM yyyy",
                      )}
                    </Badge>
                  </div>
                ))}
                {activeStudents.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No active students
                  </p>
                )}
                {activeStudents.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{activeStudents.length - 5} more active students
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recently Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inactiveStudents.slice(0, 5).map((student) => (
                  <div
                    key={student.transportDetails.id}
                    className="flex justify-between items-center py-1 border-b last:border-0"
                  >
                    <span>{student.name}</span>
                    {student.transportDetails.endDate && (
                      <Badge variant="secondary" className="text-gray-500">
                        Ended{" "}
                        {format(
                          new Date(student.transportDetails.endDate),
                          "MMM yyyy",
                        )}
                      </Badge>
                    )}
                  </div>
                ))}
                {inactiveStudents.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No inactive students
                  </p>
                )}
                {inactiveStudents.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{inactiveStudents.length - 5} more inactive students
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
