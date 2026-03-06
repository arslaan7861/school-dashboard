"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Calendar,
  School,
  CheckCircle,
  Clock,
  ChevronRight,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";

import { useSessions, useSessionCrud } from "@/features/session/hooks.session";
import { Session } from "@/features/session/types.session";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";
import { SessionFormDialog } from "@/components/modal/session.form";
import { format, differenceInDays, isWithinInterval } from "date-fns";

export default function SessionsPage() {
  const { data, isLoading, isError, refetch } = useSessions();
  const {
    createSessionMutation,
    updateSessionMutation,
    deleteSessionMutation,
    toggleSessionActiveMutation,
  } = useSessionCrud();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const sessions: Session[] = data?.data ?? [];
  const activeSession = sessions.find((s) => s.isActive); // Changed

  // Calculate progress for sessions
  const calculateProgress = (session: Session) => {
    const start = new Date(session.startDate); // Changed
    const end = new Date(session.endDate); // Changed
    const today = new Date();
    console.log({ end, start, today });

    if (today < start) return 0;
    if (today > end) return 100;

    const totalDays = differenceInDays(end, start);
    const daysPassed = differenceInDays(today, start);
    console.log({ totalDays, daysPassed });

    return Math.floor((daysPassed / totalDays) * 100);
  };

  // Filter sessions based on tab
  const filteredSessions = sessions.filter((session) => {
    if (activeTab === "active") return session.isActive; // Changed
    if (activeTab === "upcoming")
      return new Date(session.startDate) > new Date(); // Changed
    if (activeTab === "completed")
      return new Date(session.endDate) < new Date(); // Changed
    return true;
  });

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">
                  Failed to load sessions
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  There was an error loading academic sessions
                </p>
              </div>
              <Button onClick={() => refetch()} className="w-full">
                Retry Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- ACTIONS ---------- */
  const handleCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (session: Session) => {
    setEditing(session);
    setOpen(true);
  };

  const handleDelete = (session: Session) => {
    deleteSessionMutation.mutate(session.id, {
      onSuccess: () => toast.success("Session deleted"),
    });
  };

  /* ---------- LOADING STATE ---------- */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Academic Sessions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage academic terms, set active sessions, and track progress
          </p>
        </div>

        <Button onClick={handleCreate} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sessions
                </p>
                <p className="text-3xl font-bold">{sessions.length}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <School className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </p>
                <p className="text-3xl font-bold">
                  {
                    sessions.filter((s) => new Date(s.startDate) > new Date()) // Changed
                      .length
                  }
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-3xl font-bold">
                  {
                    sessions.filter((s) => new Date(s.endDate) < new Date()) // Changed
                      .length
                  }
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CURRENT SESSION HIGHLIGHT */}
      {activeSession && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600 hover:bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Currently Active
                  </Badge>
                  <Badge variant="outline" className="border-primary/30">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(
                      new Date(activeSession.startDate), // Changed
                      "MMM yyyy",
                    )}{" "}
                    - {format(new Date(activeSession.endDate), "MMM yyyy")}{" "}
                    {/* Changed */}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-bold">{activeSession.name}</h3>
                  <p className="text-muted-foreground mt-1">
                    Academic session in progress
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Session Progress</span>
                    <span className="font-medium">
                      {calculateProgress(activeSession)}%
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(activeSession)}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleEdit(activeSession)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Session
                </Button>
                <Button size="lg" className="gap-2">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SESSIONS LIST */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Academic Sessions</CardTitle>
              <CardDescription>
                Manage and organize all academic terms and sessions
              </CardDescription>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="md:w-100 w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="mb-6" />

          {/* FORM DIALOG */}
          <SessionFormDialog
            open={open}
            onOpenChange={(v) => {
              if (!v) setTimeout(() => setEditing(null), 100);
              setOpen(v);
            }}
            initial={editing}
            onCreate={(data) =>
              createSessionMutation.mutate(data, {
                onSuccess: () => {
                  toast.success("Session created successfully");
                  setOpen(false);
                },
              })
            }
            onUpdate={(id, data) =>
              updateSessionMutation.mutate(
                { sessionId: String(id), ...data },
                {
                  onSuccess: () => {
                    toast.success("Session updated successfully");
                    setOpen(false);
                  },
                },
              )
            }
          />

          {/* SESSIONS GRID */}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No sessions found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {activeTab === "all"
                  ? "Get started by creating your first academic session"
                  : `No ${activeTab} sessions available`}
              </p>
              {activeTab === "all" && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Session
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSessions.map((session) => {
                const progress = calculateProgress(session);
                const isCurrent = isWithinInterval(new Date(), {
                  start: new Date(session.startDate), // Changed
                  end: new Date(session.endDate), // Changed
                });

                return (
                  <Card
                    key={session.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {session.name}
                            {session.isActive && ( // Changed
                              <Badge className="bg-green-600 hover:bg-green-600">
                                Active
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {format(
                              new Date(session.startDate), // Changed
                              "MMM dd, yyyy",
                            )}{" "}
                            -{" "}
                            {format(new Date(session.endDate), "MMM dd, yyyy")}{" "}
                            {/* Changed */}
                          </CardDescription>
                        </div>

                        {!session.isActive &&
                          isCurrent && ( // Changed
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleSessionActiveMutation.mutate({
                                  sessionId: String(session.id),
                                  active: true, // Changed from 'active' to 'isActive'
                                })
                              }
                              disabled={toggleSessionActiveMutation.isPending}
                            >
                              Set Active
                            </Button>
                          )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* PROGRESS BAR */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-2"
                          indicatorClassName={
                            progress === 100 ? "bg-green-500" : "bg-primary"
                          }
                        />
                      </div>

                      {/* STATUS BADGES */}
                      <div className="flex flex-wrap gap-2">
                        {progress === 100 && (
                          <Badge
                            variant="outline"
                            className="border-green-500/30 text-green-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {isCurrent &&
                          !session.isActive && ( // Changed
                            <Badge
                              variant="outline"
                              className="border-blue-500/30 text-blue-600"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        {isCurrent &&
                          session.isActive && ( // Changed
                            <Badge
                              variant="outline"
                              className="border-green-500/30 text-green-600"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        {new Date(session.startDate) > new Date() && ( // Changed
                          <Badge
                            variant="outline"
                            className="border-amber-500/30 text-amber-600"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Upcoming
                          </Badge>
                        )}
                      </div>

                      <Separator />

                      {/* ACTIONS */}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(session)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                  <AlertTriangle className="w-5 h-5" />
                                  Delete Academic Session?
                                </AlertDialogTitle>

                                <AlertDialogDescription className="space-y-2">
                                  <p>
                                    This action is <b>permanent</b> and cannot
                                    be undone.
                                  </p>
                                  <p className="font-medium text-destructive">
                                    Deleting this session will also remove:
                                  </p>
                                  <ul className="list-disc ml-5 text-destructive">
                                    <li>All Classes</li>
                                    <li>All Marks / Results</li>
                                    <li>All Attendance Records</li>
                                  </ul>
                                  <p>
                                    Are you absolutely sure you want to
                                    continue?
                                  </p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(session)}
                                >
                                  Yes, Delete Everything
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        <Button variant="ghost" size="sm" className="gap-1">
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
