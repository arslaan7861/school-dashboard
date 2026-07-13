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
      className="cursor-pointer bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 border-gray-200 group"
      onClick={handleClick}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold group-hover:text-blue-700 transition-colors">{route.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <span className="flex items-center justify-center bg-gray-100 rounded-full p-1">
                <Bus className="w-3 h-3 text-gray-600" />
              </span>
              <span className="font-medium text-gray-700">{route.vehicleNumber || "No vehicle assigned"}</span>
            </CardDescription>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(route)}
                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(route)}
                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Stops</span>
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <MapPin className="w-4 h-4" />
              </div>
              <span>{route.stops?.length || 0}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Session</span>
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                <Calendar className="w-4 h-4" />
              </div>
              <span>{route.sessionId}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t border-gray-100 bg-gray-50/50 rounded-b-lg flex justify-end">
        <Button variant="link" size="sm" onClick={handleClick} className="text-blue-600 group-hover:text-blue-700 px-0 h-auto font-medium">
          View Details →
        </Button>
      </CardFooter>
    </Card>
  );
}
