"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Calendar, MapPin, Users, Clock, Edit } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useRoute } from "@/features/transport";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RouteDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const routeId = parseInt(params.routeId as string);

  const { data: route, isLoading, error } = useRoute(routeId);

  // Determine active tab based on URL path
  const getActiveTab = () => {
    if (pathname.includes("/students")) return "students";
    if (pathname.includes("/disabled")) return "disabled";
    return "stops";
  };

  const activeTab = getActiveTab();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for route details card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skeleton for tabs */}
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load route details</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Calculate stats
  const totalStops = route.stops?.length || 0;
  const totalStudents = route.activeStudentsCount;
  const disabledMonthsCount = route.disabledMonths?.length || 0;

  return (
    <div className="space-y-6">
      {/* Route Details Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{route.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Bus className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  Vehicle: {route.vehicleNumber || "Not assigned"}
                </span>
              </div>
            </div>
            <Link href={`/transport/routes/${routeId}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Route
              </Button>
            </Link>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Session Info */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Academic Session</p>
                <p className="font-medium">Session {route.sessionId}</p>
              </div>
            </div>

            {/* Stops Count */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Stops</p>
                <p className="font-medium">{totalStops} stops</p>
              </div>
            </div>

            {/* Students Count */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned Students</p>
                <p className="font-medium">{totalStudents} students</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Disabled Months</p>
                <p className="font-medium">
                  {disabledMonthsCount} month
                  {disabledMonthsCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="border-b">
        <div className="flex gap-6">
          <Link href={`/transport/routes/${routeId}`}>
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "stops"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Stops
              {totalStops > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {totalStops}
                </Badge>
              )}
            </button>
          </Link>

          <Link href={`/transport/routes/${routeId}/students`}>
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "students"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Students
              {totalStudents > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {totalStudents}
                </Badge>
              )}
            </button>
          </Link>

          <Link href={`/transport/routes/${routeId}/disabled`}>
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "disabled"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Disabled Months
              {disabledMonthsCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {disabledMonthsCount}
                </Badge>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
