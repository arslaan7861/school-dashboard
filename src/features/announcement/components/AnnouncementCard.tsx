import React from "react";
import { format } from "date-fns";
import { AnnouncementCardProps, AnnouncementAudience } from "../types.announcement";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar, Users, Pencil, Trash2, Paperclip } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
  onMarkRead,
  showReadStatus,
}: AnnouncementCardProps) {
  const isClassAudience = announcement.audienceType === AnnouncementAudience.CLASS;
  const isRead = 'isRead' in announcement ? announcement.isRead : true;

  return (
    <Card className={`relative transition-all hover:shadow-md ${!isRead && showReadStatus ? 'border-primary/50 bg-primary/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {!isRead && showReadStatus && (
                <span className="flex h-2 w-2 rounded-full bg-primary" />
              )}
              <CardTitle className="text-xl leading-tight line-clamp-2">
                {announcement.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(announcement.createdAt), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {announcement.creator?.name || 'Admin'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isClassAudience ? "secondary" : "default"}>
              {isClassAudience ? "Specific Classes" : "All Students"}
            </Badge>

            {(onEdit || onDelete || (showReadStatus && !isRead && onMarkRead)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {showReadStatus && !isRead && onMarkRead && (
                    <DropdownMenuItem onClick={() => onMarkRead(announcement.id)}>
                      Mark as Read
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(announcement)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {(onEdit || (showReadStatus && !isRead && onMarkRead)) && onDelete && <DropdownMenuSeparator />}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(announcement)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-4">
          {announcement.message}
        </p>

        {isClassAudience && announcement.classLinks && announcement.classLinks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {announcement.classLinks.map((link) => (
                <Badge key={link.id} variant="outline" className="text-xs font-normal">
                  {link.class?.name} - {link.class?.section}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" />
              Attachments ({announcement.attachments.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {announcement.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-muted/30 hover:bg-muted/60 transition-colors text-xs text-foreground/80"
                >
                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate max-w-[150px]">
                    {attachment.fileName || "Attachment"}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
