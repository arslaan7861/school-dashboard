"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useUpdateExamComponent, useDeleteExamComponent } from "../hooks.exam";
import { MarksType } from "@/features/exam/types.exam";
import { AddComponentDialog } from "./AddComponentDialog";

interface MappedHierarchyProps {
  examClasses: any[];
}

export function MappedHierarchy({ examClasses }: MappedHierarchyProps) {
  const updateMutation = useUpdateExamComponent();
  const deleteMutation = useDeleteExamComponent();

  const [editingComponent, setEditingComponent] = useState<{
    id: number;
    subjectName: string;
    componentName: string;
    componentType: string;
    maxMarks: number;
    passingMarks: number;
    marksType: MarksType;
  } | null>(null);

  const [deletingComponent, setDeletingComponent] = useState<{
    id: number;
    componentName: string;
  } | null>(null);

  const handleConfirmEdit = async (maxMarks: number, passingMarks: number, marksType: MarksType) => {
    if (!editingComponent) return;
    try {
      await updateMutation.mutateAsync({
        examComponentId: editingComponent.id,
        data: { maxMarks, passingMarks, marksType },
      });
      setEditingComponent(null);
    } catch (err) {
      // Handled by react-query
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingComponent) return;
    try {
      await deleteMutation.mutateAsync(deletingComponent.id);
      setDeletingComponent(null);
    } catch (err) {
      // Handled by react-query
    }
  };

  return (
    <>
      <Card className="md:col-span-2 border-slate-200 h-[calc(100vh-220px)] min-h-[550px] flex flex-col">
        <CardHeader>
          <CardTitle>Assigned Subjects & Component Rubrics</CardTitle>
          <CardDescription>
            Structure of scheduled components for mapped classes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto flex-1 pr-2 scrollbar-thin">
          {examClasses?.map((ec) => (
            <div
              key={ec.id}
              className="space-y-3 p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/20 border-slate-100"
            >
              <div className="flex justify-between items-center border-b pb-1.5 border-slate-200/50">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Class: {ec.class?.name} {ec.class?.section}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ec.subjects?.map((es: any) => (
                  <div
                    key={es.id}
                    className="p-3.5 bg-white dark:bg-slate-900 border rounded-xl space-y-3 border-slate-100 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center border-b pb-1.5 border-slate-100 mb-2">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {es.subject?.name}
                        </span>
                      </div>

                      {/* Components list */}
                      <div className="space-y-2">
                        {es.components?.map((comp: any) => (
                          <div
                            key={comp.id}
                            className="flex items-center justify-between text-xs p-2.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100"
                          >
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                              {comp.subjectComponent?.name} ({comp.subjectComponent?.type})
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-muted-foreground">
                                  Max:{" "}
                                  <strong className="font-semibold text-slate-800 dark:text-slate-100">
                                    {comp.maxMarks}
                                  </strong>
                                </span>
                                <span className="text-muted-foreground">
                                  Pass:{" "}
                                  <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {comp.passingMarks}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-1 border-l pl-2 border-slate-200 dark:border-slate-800">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                  onClick={() =>
                                    setEditingComponent({
                                      id: comp.id,
                                      subjectName: es.subject?.name,
                                      componentName: comp.subjectComponent?.name,
                                      componentType: comp.subjectComponent?.type,
                                      maxMarks: comp.maxMarks,
                                      passingMarks: comp.passingMarks,
                                      marksType: comp.marksType,
                                    })
                                  }
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                                  onClick={() =>
                                    setDeletingComponent({
                                      id: comp.id,
                                      componentName: `${es.subject?.name} - ${comp.subjectComponent?.name}`,
                                    })
                                  }
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!es.components || es.components.length === 0) && (
                          <span className="text-[11px] text-muted-foreground italic block pl-1">
                            No components mapped yet. Add them from the left panel.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(!ec.subjects || ec.subjects.length === 0) && (
                  <div className="text-center py-6 text-xs text-muted-foreground italic col-span-full">
                    No subjects or components configured yet.
                  </div>
                )}
              </div>
            </div>
          ))}
          {(!examClasses || examClasses.length === 0) && (
            <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50/50 text-muted-foreground text-sm">
              Please map classes to this exam in Step 1 to begin configuration.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editing Dialog */}
      {editingComponent && (
        <AddComponentDialog
          open={!!editingComponent}
          onOpenChange={(open) => !open && setEditingComponent(null)}
          title="Edit Component Rubric"
          subjectName={editingComponent.subjectName}
          componentName={editingComponent.componentName}
          componentType={editingComponent.componentType}
          initialMaxMarks={editingComponent.maxMarks}
          initialPassingMarks={editingComponent.passingMarks}
          initialMarksType={editingComponent.marksType}
          onConfirm={handleConfirmEdit}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Removing Warning Dialog */}
      <Dialog open={!!deletingComponent} onOpenChange={(open) => !open && setDeletingComponent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Remove Component?</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to remove <strong className="font-semibold text-foreground">{deletingComponent?.componentName}</strong> from this exam?
              <br />
              <span className="text-red-500 font-medium text-xs mt-2 block">
                Warning: This action will permanently delete any schedule dates or configurations linked to this exam component.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingComponent(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="gap-1.5"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Remove Component
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
