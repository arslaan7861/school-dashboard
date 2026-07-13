"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createSessionSchema, CreateSessionSchemaType } from "@/features/session/validators.session";
import { useSessions, useSessionCrud } from "@/features/session/hooks.session";
import { useClasses, useClassCrud } from "@/features/class/hooks.class";
import { useStudentsByClass } from "@/features/students/hooks.student";
import { Session } from "@/features/session/types.session";
import { Checkbox } from "@/components/ui/checkbox";

// Steps for the Rollover Wizard
const STEPS = [
  { id: "create", title: "1. Target Session" },
  { id: "mapping", title: "2. Class Mapping" },
  { id: "students", title: "3. Student Promotion" },
  { id: "confirm", title: "4. Confirmation" },
];

function StudentPromotionList({ 
  oldClass, 
  newClass, 
  selectedStudents, 
  onSelectionChange 
}: { 
  oldClass: any; 
  newClass: any; 
  selectedStudents: number[]; 
  onSelectionChange: (ids: number[]) => void; 
}) {
  const { data, isLoading } = useStudentsByClass({ classId: oldClass.id, page: 1, limit: 100 });
  const students = data?.students || [];

  // On initial load, if selectedStudents is empty, select all
  React.useEffect(() => {
    if (students.length > 0 && selectedStudents.length === 0) {
      onSelectionChange(students.map((s: any) => s.id));
    }
  }, [students.length]);

  if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  const handleToggle = (id: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedStudents, id]);
    } else {
      onSelectionChange(selectedStudents.filter(s => s !== id));
    }
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(students.map((s: any) => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const allSelected = students.length > 0 && selectedStudents.length === students.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-3 border-b flex justify-between items-center">
        <div className="font-medium">
          {oldClass.name}-{oldClass.section} <ArrowRight className="inline w-4 h-4 mx-2" /> {newClass.name}-{newClass.section}
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Checkbox 
            id={`select-all-${oldClass.id}`}
            checked={allSelected} 
            onCheckedChange={handleToggleAll} 
          />
          <label htmlFor={`select-all-${oldClass.id}`} className="cursor-pointer">Select All ({selectedStudents.length}/{students.length})</label>
        </div>
      </div>
      <div className="p-4 max-h-60 overflow-y-auto space-y-2">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No students in this class.</p>
        ) : (
          students.map((s: any) => (
            <div key={s.id} className="flex items-center space-x-3 py-1">
              <Checkbox 
                id={`student-${s.id}`} 
                checked={selectedStudents.includes(s.id)} 
                onCheckedChange={(checked) => handleToggle(s.id, !!checked)} 
              />
              <label htmlFor={`student-${s.id}`} className="text-sm cursor-pointer flex-1">
                {s.name} <span className="text-muted-foreground ml-2">(Roll: {s.classRelation?.rollNumber})</span>
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function RolloverWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // State for Wizard
  const [createdSession, setCreatedSession] = useState<Session | null>(null);
  const [rolloverFromSessionId, setRolloverFromSessionId] = useState<number | null>(null);

  // Mappings: fromClassId -> toClassId
  const [classMappings, setClassMappings] = useState<Record<number, number>>({});
  
  // Selected class for student promotion
  const [selectedMapping, setSelectedMapping] = useState<{fromId: number, toId: number} | null>(null);
  
  // Selected students for promotion: { classId: number[] }
  const [selectedStudents, setSelectedStudents] = useState<Record<number, number[]>>({});

  // Queries & Mutations
  const { data: sessionsData, isLoading: loadingSessions } = useSessions();
  const { createSessionMutation } = useSessionCrud();
  const { promoteClassMutation } = useClassCrud();

  const sessions = sessionsData?.data || [];
  const activeSession = sessions.find(s => s.isActive);

  // Step 1 Form
  const form = useForm<CreateSessionSchemaType>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      isActive: false,
      rolloverFromSessionId: activeSession?.id,
    },
  });

  const { data: oldClassesData, isLoading: loadingOldClasses } = useClasses(rolloverFromSessionId || undefined);
  const { data: newClassesData, isLoading: loadingNewClasses } = useClasses(createdSession?.id);

  const oldClasses = oldClassesData?.data || [];
  const newClasses = newClassesData?.data || [];

  const handleCreateSession = (data: CreateSessionSchemaType) => {
    createSessionMutation.mutate(data, {
      onSuccess: (res) => {
        setCreatedSession(res.data);
        setRolloverFromSessionId(data.rolloverFromSessionId || null);
        toast.success("Target session created. Classes copied successfully.");
        setCurrentStep(1); // Move to step 2 automatically
      },
    });
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Trigger form submission
      document.getElementById("create-session-form")?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
      return;
    }

    if (currentStep === 1) {
      // Validate mapping
      if (Object.keys(classMappings).length === 0) {
        toast.error("Please map at least one class before continuing.");
        return;
      }
    }

    if (currentStep === 2) {
      // Step 2 to 3: Do we need validation?
      // They can just skip some classes, but we should prepare selectedStudents state
      // if it's empty, we should populate it by default with all students. 
      // But we need the students first! We'll fetch them in the component.
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const executeRollover = async () => {
    // For each mapped class, if we have selected students, run promoteClassMutation
    const mappingsToPromote = Object.entries(classMappings).filter(([oldId, newId]) => newId !== null && !isNaN(newId));
    
    if (mappingsToPromote.length === 0) {
      toast.error("No classes mapped for promotion.");
      return;
    }

    let successCount = 0;

    for (const [oldIdStr, newId] of mappingsToPromote) {
      const oldId = Number(oldIdStr);
      const studentIds = selectedStudents[oldId];

      if (!studentIds || studentIds.length === 0) {
        continue; // skip if no students selected
      }

      try {
        await promoteClassMutation.mutateAsync({
          fromClassId: oldId,
          fromSessionId: Number(rolloverFromSessionId),
          toClassId: newId,
          toSessionId: Number(createdSession?.id),
          studentIds: studentIds
        });
        successCount++;
      } catch (err: any) {
        toast.error(`Failed to promote class ${oldClasses.find(c => c.id === oldId)?.name}: ${err?.message || "Unknown error"}`);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully promoted ${successCount} classes.`);
      router.push("/session");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6 pt-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Session Rollover Wizard
          </h1>
          <p className="text-muted-foreground mt-1">
            Automate class transitions and student promotions for the new academic year
          </p>
        </div>
      </div>

      <Separator />

      {/* Progress Bar / Steps indicator */}
      <div className="flex justify-between items-center mb-8 px-4">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-2 ${
              index <= currentStep ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                index < currentStep
                  ? "bg-primary text-primary-foreground border-primary"
                  : index === currentStep
                  ? "border-primary text-primary"
                  : "border-muted-foreground"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`font-medium hidden sm:inline-block ${
                index <= currentStep ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-24 h-[2px] ml-4 ${
                  index < currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Wizard Content Area */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Define the new academic session details."}
            {currentStep === 1 && "Review how classes will map to the new session."}
            {currentStep === 2 && "Select individual students for promotion."}
            {currentStep === 3 && "Final review before executing the rollover."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1 Content Placeholder */}
          {currentStep === 0 && (
            <div className="space-y-4 max-w-lg">
              <Form {...form}>
                <form id="create-session-form" onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Session Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2026-2027" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="rolloverFromSessionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rollover Configuration From</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(Number(val))} 
                          value={field.value ? String(field.value) : undefined}
                          disabled={loadingSessions}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a previous session" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sessions.map(s => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name} {s.isActive ? "(Active)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          All classes and teachers will be copied from this session to the new one.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          )}
          
          {/* Step 2 Content Placeholder */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Class Mapping</h3>
                <p className="text-sm text-muted-foreground">
                  Match the old session classes (where students currently are) to the newly created session classes (where they should go).
                </p>
              </div>

              {loadingOldClasses || loadingNewClasses ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
              ) : (
                <div className="grid gap-4 max-w-2xl">
                  {oldClasses.map((oldClass) => (
                    <div key={oldClass.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1 font-medium">
                        {oldClass.name} - {oldClass.section}
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Select 
                          value={classMappings[oldClass.id] ? String(classMappings[oldClass.id]) : undefined}
                          onValueChange={(val) => setClassMappings(prev => ({ ...prev, [oldClass.id]: Number(val) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Do not promote" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-muted-foreground italic">Do not promote</SelectItem>
                            {newClasses.map((newClass) => (
                              <SelectItem key={newClass.id} value={String(newClass.id)}>
                                {newClass.name} - {newClass.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3 Content Placeholder */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Student Promotion Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Select which students from the old session should be promoted to the mapped class in the new session.
                </p>
              </div>

              <div className="space-y-4">
                {Object.entries(classMappings).filter(([_, newId]) => !isNaN(newId)).map(([oldIdStr, newId]) => {
                  const oldId = Number(oldIdStr);
                  const oldClass = oldClasses.find(c => c.id === oldId);
                  const newClass = newClasses.find(c => c.id === newId);
                  if (!oldClass || !newClass) return null;

                  return (
                    <StudentPromotionList 
                      key={oldId}
                      oldClass={oldClass}
                      newClass={newClass}
                      selectedStudents={selectedStudents[oldId] || []}
                      onSelectionChange={(studentIds) => setSelectedStudents(prev => ({ ...prev, [oldId]: studentIds }))}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4 Content Placeholder */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-semibold mb-2 text-primary">Final Review</h3>
                <p className="text-sm text-muted-foreground">
                  Review the rollover plan before executing. This will promote the selected students into the target classes for the new session <strong>{createdSession?.name}</strong>.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Summary of Changes:</h4>
                <div className="grid gap-2 border rounded-lg p-4">
                  {Object.entries(classMappings).filter(([_, newId]) => !isNaN(newId)).map(([oldIdStr, newId]) => {
                    const oldId = Number(oldIdStr);
                    const oldClass = oldClasses.find(c => c.id === oldId);
                    const newClass = newClasses.find(c => c.id === newId);
                    const selectedCount = selectedStudents[oldId]?.length || 0;
                    
                    if (!oldClass || !newClass) return null;

                    return (
                      <div key={oldId} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                        <div>
                          <span className="font-medium">{oldClass.name} - {oldClass.section}</span>
                          <ArrowRight className="inline w-4 h-4 mx-2 text-muted-foreground" />
                          <span className="font-medium">{newClass.name} - {newClass.section}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {selectedCount} student(s) selected
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button onClick={currentStep === STEPS.length - 1 ? executeRollover : handleNext} className="gap-2" disabled={promoteClassMutation.isPending}>
          {currentStep === STEPS.length - 1 ? (promoteClassMutation.isPending ? "Executing..." : "Execute Rollover") : "Next Step"}
          {currentStep < STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
