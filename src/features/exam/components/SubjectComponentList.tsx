"use client";

import { useState } from "react";
import { useSubjectsByClass } from "@/features/subjects/hooks.subject";
import { MarksType } from "@/features/exam/types.exam";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, BookOpen } from "lucide-react";
import { AddComponentDialog } from "./AddComponentDialog";

interface SubjectComponentListProps {
  exam: any;
  examId: number;
  addSubjectMutation: any;
  addComponentMutation: any;
  selectedClassId: string;
  onClassChange: (val: string) => void;
}

export function SubjectComponentList({
  exam,
  examId,
  addSubjectMutation,
  addComponentMutation,
  selectedClassId,
  onClassChange,
}: SubjectComponentListProps) {
  const [activeComponent, setActiveComponent] = useState<{
    subjectId: number;
    subjectName: string;
    componentId: number;
    componentName: string;
    componentType: string;
  } | null>(null);

  const { data: subjectsByClass, isLoading: subjectsLoading } = useSubjectsByClass(
    selectedClassId ? Number(selectedClassId) : undefined,
  );

  // Helper to determine if a component is already added
  const isComponentAdded = (subjectId: number, subjectComponentId: number) => {
    const classId = Number(selectedClassId);
    const ec = exam.examClasses?.find((c: any) => c.classId === classId);
    const es = ec?.subjects?.find((s: any) => s.subjectId === subjectId);
    return es?.components?.some((comp: any) => comp.subjectComponentId === subjectComponentId) ?? false;
  };

  const handleConfirmAdd = async (maxMarks: number, passingMarks: number, marksType: MarksType) => {
    if (!activeComponent || !selectedClassId) return;

    const classId = Number(selectedClassId);
    const { subjectId, componentId } = activeComponent;

    // 1. Find if ExamSubject is already mapped
    const ec = exam.examClasses?.find((c: any) => c.classId === classId);
    const es = ec?.subjects?.find((s: any) => s.subjectId === subjectId);
    let examSubjectId = es?.id;

    try {
      if (!examSubjectId) {
        // Automatically map the subject to the exam first
        const newSubj = await addSubjectMutation.mutateAsync({
          examId,
          classId,
          subjectId,
        });
        examSubjectId = newSubj.data.id;
      }

      // 2. Add the component to the mapped exam subject
      await addComponentMutation.mutateAsync({
        examSubjectId,
        subjectComponentId: componentId,
        maxMarks,
        passingMarks,
        marksType,
      });
    } catch (err: any) {
      // Mutations already trigger notifications or we let them propagate
      throw err;
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <Label className="font-semibold text-slate-800 dark:text-slate-200">
        Step 2: Add Component to Class Exam
      </Label>

      <div className="space-y-1.5">
        <Label htmlFor="structure-class-select" className="text-xs text-muted-foreground">
          Class Select
        </Label>
        <Select value={selectedClassId} onValueChange={onClassChange}>
          <SelectTrigger id="structure-class-select" className="bg-white dark:bg-slate-900 border-slate-200">
            <SelectValue placeholder="Choose a mapped class" />
          </SelectTrigger>
          <SelectContent>
            {exam.examClasses?.map((ec: any) => (
              <SelectItem key={ec.classId} value={ec.classId.toString()}>
                {ec.class?.name} {ec.class?.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClassId && (
        <div className="space-y-3">
          {subjectsLoading ? (
            <div className="text-center py-6 text-xs text-muted-foreground">Loading subjects...</div>
          ) : !subjectsByClass || subjectsByClass.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No standard subjects found for this class.
            </div>
          ) : (
            subjectsByClass.map((subj) => (
              <div
                key={subj.id}
                className="p-3 border rounded-xl bg-white dark:bg-slate-900 shadow-sm space-y-2 border-slate-100"
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    {subj.name}
                  </span>
                </div>

                {/* Available Components */}
                <div className="space-y-1.5 pl-5">
                  {subj.components && subj.components.length > 0 ? (
                    subj.components.map((comp: any) => {
                      const added = isComponentAdded(subj.id, comp.id);
                      return (
                        <div
                          key={comp.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {comp.name} ({comp.type})
                          </span>

                          {added ? (
                            <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 py-0.5 px-2">
                              <Check className="w-3 h-3" /> Added
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 p-1 px-2 rounded-md font-semibold gap-1"
                              onClick={() =>
                                setActiveComponent({
                                  subjectId: subj.id,
                                  subjectName: subj.name,
                                  componentId: comp.id,
                                  componentName: comp.name,
                                  componentType: comp.type,
                                })
                              }
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Component
                            </Button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">
                      No components configured.
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeComponent && (
        <AddComponentDialog
          open={!!activeComponent}
          onOpenChange={(open) => !open && setActiveComponent(null)}
          subjectName={activeComponent.subjectName}
          componentName={activeComponent.componentName}
          componentType={activeComponent.componentType}
          onConfirm={handleConfirmAdd}
          isPending={addSubjectMutation.isPending || addComponentMutation.isPending}
        />
      )}
    </div>
  );
}
