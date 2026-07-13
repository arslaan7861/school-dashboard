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
    <div className="space-y-6 pt-6">
      {/* Route Details Card */}
      <Card className="overflow-hidden bg-white border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{route.name}</h1>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="flex items-center justify-center bg-gray-100 rounded-full p-1">
                  <Bus className="w-3.5 h-3.5 text-gray-600" />
                </span>
                <span className="font-medium text-gray-700">
                  {route.vehicleNumber || "No vehicle assigned"}
                </span>
              </div>
            </div>
            <Link href={`/transport/routes/${routeId}/edit`}>
              <Button variant="outline" size="sm" className="gap-2 shadow-sm border-gray-200 hover:bg-gray-50">
                <Edit className="w-4 h-4" />
                Edit Route
              </Button>
            </Link>
          </div>
        </div>

        <CardContent className="p-6 bg-gray-50/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Session Info */}
            <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session</p>
                <p className="font-semibold text-gray-900">{route.sessionId}</p>
              </div>
            </div>

            {/* Stops Count */}
            <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stops</p>
                <p className="font-semibold text-gray-900">{totalStops}</p>
              </div>
            </div>

            {/* Students Count */}
            <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Students</p>
                <p className="font-semibold text-gray-900">{totalStudents}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="p-2 bg-amber-50 rounded-lg shrink-0">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Disabled</p>
                <p className="font-semibold text-gray-900">
                  {disabledMonthsCount} {disabledMonthsCount === 1 ? "month" : "months"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="pb-1">
        <div className="flex gap-2 bg-gray-100/80 p-1 rounded-xl w-fit">
          <Link href={`/transport/routes/${routeId}`}>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "stops"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              <div className="flex items-center gap-2">
                Stops
                {totalStops > 0 && (
                  <Badge variant={activeTab === "stops" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                    {totalStops}
                  </Badge>
                )}
              </div>
            </button>
          </Link>

          <Link href={`/transport/routes/${routeId}/students`}>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "students"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              <div className="flex items-center gap-2">
                Students
                {totalStudents > 0 && (
                  <Badge variant={activeTab === "students" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                    {totalStudents}
                  </Badge>
                )}
              </div>
            </button>
          </Link>

          <Link href={`/transport/routes/${routeId}/disabled`}>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "disabled"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              <div className="flex items-center gap-2">
                Disabled Months
                {disabledMonthsCount > 0 && (
                  <Badge variant={activeTab === "disabled" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                    {disabledMonthsCount}
                  </Badge>
                )}
              </div>
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
