"use client";

import { Users, MoreVertical, Edit, Trash2, GraduationCap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { TimetableEntry } from "../types.timetable";
import { getSubjectColor } from "../utils.timetable";
import { CSS } from "@dnd-kit/utilities";

export const EntryItem = ({
  entry,
  onEdit,
  onDelete,
  onView,
  compact = false,
}: {
  entry: TimetableEntry;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  compact?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `entry-${entry.id}`,
    data: {
      type: "entry",
      entry,
    },
  });

  const colors = getSubjectColor(entry.subject!.id, entry.subject!.name);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
    cursor: isDragging ? "grabbing" : "grab",
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg border hover:shadow-sm transition-all",
          colors.bg,
          colors.border,
        )}
        onClick={(e) => {
          if (!isDragging && onView) {
            onView();
          }
        }}
      >
        <div className={cn("w-1 h-8 rounded-full", colors.badge)} />
        <div className="flex-1 min-w-0 pointer-events-none">
          <div className="flex items-center gap-1">
            <span className={cn("text-xs font-medium truncate", colors.text)}>
              {entry.subject!.name}
            </span>
            <Badge variant="outline" className="h-4 text-[9px] px-1">
              {entry.component!.type}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-3 h-3" />
            <span className="truncate">{entry.batch?.name || entry.batch?.name}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <GraduationCap className="w-3 h-3" />
            <span className="truncate">{entry.teacher!.name.split(" ")[0]}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-3 h-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("p-3 rounded-lg border", colors.bg, colors.border)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 pointer-events-none">
          <div className={cn("w-1.5 h-12 rounded-full", colors.badge)} />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("font-medium", colors.text)}>
                {entry.subject!.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {entry.component!.type}
              </Badge>
              {/* @ts-ignore */}
              {entry.subject.code && (
                <span className="text-xs text-muted-foreground">
                  {/* @ts-ignore */}
                  {entry.subject.code}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Layers className="w-3 h-3" />
                <span>{entry.component!.name}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{entry.batch!.name}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                <GraduationCap className="w-3 h-3" />
                <span>{entry.teacher!.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-1 cursor-default">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit entry</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete entry</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
