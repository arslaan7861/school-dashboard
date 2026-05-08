"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Flag,
  CalendarX,
  Lock,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";

const legendItems = [
  {
    icon: Flag,
    label: "Holiday",
    description: "School holiday or non-working day",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    icon: CalendarX,
    label: "Event",
    description: "Special event or activity",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    icon: Lock,
    label: "Locked",
    description: "Attendance locked, cannot be modified",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    icon: CheckCircle2,
    label: "Complete",
    description: "All classes have attendance marked",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    icon: AlertCircle,
    label: "Partial",
    description: "Some classes have attendance marked",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
];

export function CalendarLegend() {
  return (
    <TooltipProvider>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 px-1 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Legend:
          </span>

          {/* Multiple indicators note */}
          <Badge variant="outline" className="text-[10px] bg-muted/50">
            <Layers className="h-2.5 w-2.5 mr-1" />
            Multiple indicators can appear
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {legendItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <div className={cn("p-1 rounded-md", item.color)}>
                    <item.icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {item.label}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{item.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Mobile view - show as badges */}
        <div className="flex sm:hidden flex-wrap gap-1 mt-1">
          {legendItems.map((item) => (
            <Badge
              key={item.label}
              variant="outline"
              className={cn("text-[10px] px-1.5", item.color)}
            >
              <item.icon className="h-2.5 w-2.5 mr-1" />
              {item.label}
            </Badge>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
