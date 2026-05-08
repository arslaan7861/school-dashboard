"use client";

import { Pencil, Trash2, Users, MapPin, Calendar, Bus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransportRoute } from "@/features/transport";
import { useRouter } from "next/navigation";

interface RouteCardProps {
  route: TransportRoute;
  onEdit?: (route: TransportRoute) => void;
  onDelete?: (route: TransportRoute) => void;
}

export function RouteCard({ route, onEdit, onDelete }: RouteCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/transport/routes/${route.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{route.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Bus className="w-3 h-3" />
              {route.vehicleNumber || "No vehicle assigned"}
            </CardDescription>
          </div>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(route)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(route)}
                className="h-8 w-8 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{route.stops?.length || 0} stops</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Active students: --</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Session: {route.sessionId}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* <Badge variant={route.isActive ? "default" : "secondary"}>
          {route.isActive ? "Active" : "Inactive"}
        </Badge> */}
        <Button variant="link" size="sm" onClick={handleClick}>
          View Details →
        </Button>
      </CardFooter>
    </Card>
  );
}
