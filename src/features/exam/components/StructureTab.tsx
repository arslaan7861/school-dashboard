"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassMapper } from "./ClassMapper";
import { SubjectComponentList } from "./SubjectComponentList";
import { MappedHierarchy } from "./MappedHierarchy";

interface StructureTabProps {
  exam: any;
  examId: number;
  allClasses: any[];
  assignClassesMutation: any;
  addSubjectMutation: any;
  addComponentMutation: any;
  onRefreshExam: () => void;
  selectedClassId: string;
  onClassChange: (val: string) => void;
}

export function StructureTab({
  exam,
  examId,
  allClasses,
  assignClassesMutation,
  addSubjectMutation,
  addComponentMutation,
  onRefreshExam,
  selectedClassId,
  onClassChange,
}: StructureTabProps) {

  const handleSaveClasses = async (classIds: number[]) => {
    try {
      await assignClassesMutation.mutateAsync({
        examId,
        classIds,
      });
      onRefreshExam();
    } catch (err) {
      // Handled by mutation toast/error
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Config Panel */}
      <Card className="md:col-span-1 border-slate-200 h-[calc(100vh-220px)] min-h-[550px] flex flex-col">
        <CardHeader>
          <CardTitle>Component Configuration</CardTitle>
          <CardDescription>
            Associate classes, subjects, and grading structures to the exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto flex-1 pr-2 scrollbar-thin">
          {/* Step 1: Map Classes */}
          <ClassMapper
            examClasses={exam.examClasses || []}
            allClasses={allClasses || []}
            onSaveClasses={handleSaveClasses}
            isPending={assignClassesMutation.isPending}
          />

          {/* Step 2: Choose Class, List Subjects, Add Components */}
          <SubjectComponentList
            exam={exam}
            examId={examId}
            addSubjectMutation={addSubjectMutation}
            addComponentMutation={addComponentMutation}
            selectedClassId={selectedClassId}
            onClassChange={onClassChange}
          />
        </CardContent>
      </Card>

      {/* Right Mapped Hierarchy View */}
      <MappedHierarchy examClasses={exam.examClasses || []} />
    </div>
  );
}
