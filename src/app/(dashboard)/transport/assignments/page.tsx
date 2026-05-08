"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transport Assignments</h1>
        <p className="text-gray-500 mt-1">
          View and manage all student transport assignments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Transport Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            This page is under construction. Student transport assignments will
            be listed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
