"use client";

import React, { useState, useEffect } from "react";
import { Plus, Megaphone, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

import {
  useAnnouncements,
  useDeleteAnnouncement,
} from "@/features/announcement/hooks.announcement";
import {
  AnnouncementAudience,
  Announcement,
} from "@/features/announcement/types.announcement";
import { AnnouncementCard } from "@/features/announcement/components/AnnouncementCard";
import { useSessions } from "@/features/session/hooks.session";
import {
  openCreateAnnouncementModal,
  openDeleteAnnouncementModal,
} from "@/store/modals/announcement.modal.store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnnouncementsPage() {
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<string>("ALL");

  const activeSessionId = useAuthStore((s) => s.activeSessionId);

  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const sessions = sessionsData?.data || [];

  const getAudienceType = () => {
    if (audienceFilter === AnnouncementAudience.ALL)
      return AnnouncementAudience.ALL;
    if (audienceFilter === AnnouncementAudience.CLASS)
      return AnnouncementAudience.CLASS;
    return undefined;
  };

  const { data, isLoading } = useAnnouncements({
    sessionId: activeSessionId!,
    audienceType: getAudienceType(),
  });

  const announcements: Announcement[] = data || [];

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDeleteClick = (announcement: Announcement) => {
    openDeleteAnnouncementModal({ announcementData: announcement });
  };

  if (sessionsLoading) {
    return (
      <div className="space-y-6 pt-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground mt-1">
              Communicate important updates to students and classes
            </p>
          </div>

          <Button size="lg" onClick={() => openCreateAnnouncementModal()}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Filters Area */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Broadcasts</CardTitle>
              <CardDescription>
                View announcements published during the selected session
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Audiences</SelectItem>
                  <SelectItem value={AnnouncementAudience.ALL}>
                    School-Wide
                  </SelectItem>
                  <SelectItem value={AnnouncementAudience.CLASS}>
                    Specific Classes
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search announcements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-[220px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">
                No announcements found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {search
                  ? "No announcements match your current search and filters."
                  : "There are no announcements for this session yet."}
              </p>
              {!search && (
                <Button
                  variant="outline"
                  onClick={() => openCreateAnnouncementModal()}
                >
                  <Plus className="w-4 h-4 mr-2" /> Create One Now
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
