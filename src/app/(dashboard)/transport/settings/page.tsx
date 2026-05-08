"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransportSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transport Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure global transport settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Transport settings configuration will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
