"use client";

import { TransportRoute } from "@/features/transport";
import { RouteCard } from "./RouteCard";
import { Loader2 } from "lucide-react";

interface RouteListProps {
  routes?: TransportRoute[];
  isLoading?: boolean;
  onEdit?: (route: TransportRoute) => void;
  onDelete?: (route: TransportRoute) => void;
}

export function RouteList({
  routes,
  isLoading,
  onEdit,
  onDelete,
}: RouteListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No routes found. Create your first route!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {routes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
