"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useSubject, useSubjectCrud } from "@/features/subjects/hooks.subject";
import { openEditSubjectModal } from "@/store/modals/subject.modal.store";

export default function SubjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.id);
  const subjectId = Number(params.subjectId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: subject, isLoading, error } = useSubject(subjectId);
  const { deleteAsync, isDeleting } = useSubjectCrud();

  const handleDelete = async () => {
    try {
      await deleteAsync(subjectId);
      toast.success("Subject deleted successfully");
      router.push(`/classes/${classId}/subjects`);
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  const getMarksTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      number: "default",
      grade: "secondary",
      none: "outline",
    };
    return variants[type] || "outline";
  };

  const getComponentTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      theory: "default",
      practical: "secondary",
      internal: "outline",
      project: "secondary",
      viva: "default",
      other: "outline",
    };
    return variants[type] || "secondary";
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Subject Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The subject you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => router.push(`/classes/${classId}/subjects`)}>
          Go Back to Subjects
        </Button>
      </div>
    );
  }

  const totalBatches =
    subject.components?.reduce(
      (acc, comp) => acc + (comp.batches?.length || 0),
      0,
    ) || 0;

  return (
    <div className="space-y-6 pt-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/classes/${classId}/subjects`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">
                {subject.name}
              </h1>
              <Badge
                variant={getMarksTypeBadgeVariant(subject.marksType)}
                className="capitalize"
              >
                {subject.marksType}
              </Badge>
              {subject.isOptional && (
                <Badge
                  variant="secondary"
                >
                  Optional
                </Badge>
              )}
              {subject.isElective && (
                <Badge
                  variant="secondary"
                >
                  Elective
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {subject.class?.name} - Section {subject.class?.section} •{" "}
              {subject.session?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              openEditSubjectModal({
                classId,
                subjectId,
              })
            }
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">{subject.class?.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Section {subject.class?.section}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">
                {subject.session?.name}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">
                {subject.components?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">{totalBatches}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Components & Batches</h2>

        {!subject.components || subject.components.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No components found</p>
              <p className="text-sm text-muted-foreground mt-1">
                This subject doesn't have any components yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {subject.components.map((component, index) => (
              <Card key={component.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle>{component.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant={getComponentTypeBadgeVariant(component.type)}
                            className="capitalize"
                          >
                            {component.type}
                          </Badge>
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="w-3 h-3" />
                            Order: {component.displayOrder}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        component.includeInResult ? "default" : "secondary"
                      }
                      className={cn(
                        component.includeInResult
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800",
                      )}
                    >
                      {component.includeInResult
                        ? "Included in Result"
                        : "Not Included"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium mb-3">Batches</h4>
                  {!component.batches || component.batches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No batches assigned
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {component.batches.map((batch) => (
                        <div
                          key={batch.id}
                          className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{batch.name}</span>
                            {batch.capacity && (
                              <Badge variant="outline" className="text-xs">
                                Cap: {batch.capacity}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={batch.teacher?.profilePic} />
                              <AvatarFallback className="text-xs">
                                {batch.teacher?.name?.charAt(0) || "T"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm truncate">
                              {batch.teacher?.name || "No teacher assigned"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Additional Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Subject Type</p>
              <p className="font-medium mt-1">
                {subject.isOptional
                  ? "Optional"
                  : subject.isElective
                    ? "Elective"
                    : "Core Subject"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Marks Type</p>
              <p className="font-medium mt-1 capitalize">{subject.marksType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium mt-1">
                {format(new Date(subject.createdAt), "PPP")}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(subject.createdAt), "p")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium mt-1">
                {format(new Date(subject.updatedAt), "PPP")}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(subject.updatedAt), "p")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{subject.name}" and all its
              components and batches. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
