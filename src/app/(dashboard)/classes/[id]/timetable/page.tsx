// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   Edit,
//   Clock,
//   User,
//   Trash2,
//   Plus,
//   Coffee,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";

// import { useTeachers } from "@/features/teachers/hooks.teacher";
// import {
//   WeekDay,
//   weekDayLabels,
//   weekDays,
//   CreateSingleTimetableType,
//   UpdateTimetableEntryType,
//   TimetableEntry,
// } from "@/features/timetable/types.timetable";
// import {
//   useTimetable,
//   useTimetableMutations,
// } from "@/features/timetable/hooks.timetable";
// import { useSubjects } from "@/features/subjects/hooks.subjects";
// import { UpdateTimetableDialog } from "@/features/timetable/components/update.timetable";
// import { CreateTimetableDialog } from "@/features/timetable/components/create.timetable";
// import { DeleteConfirmDialog } from "@/features/timetable/components/deletEntryDialog";
// import { dbTimeToUi } from "@/lib/time.formatter";

// // Constants
// const LECTURE_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];

// interface SelectedCell {
//   day: WeekDay;
//   lectureNo: number;
//   endTime?: string;
//   startTime?: string;
// }

// interface EditingEntry {
//   id: number;
//   subjectId: number;
//   subjectName: string;
//   teacherName: string;
//   startTime?: string;
//   endTime?: string;
//   day: WeekDay;
//   lectureNo: number;
// }

// interface DeleteEntryInfo {
//   id: number;
//   subjectName: string;
//   teacherName: string;
//   day: WeekDay;
//   lectureNo: number;
//   startTime?: string;
//   endTime?: string;
// }

// // Helper function to calculate time difference in minutes
// function calculateTimeDifference(startTime: string, endTime: string): number {
//   const [startHours, startMinutes] = startTime.split(":").map(Number);
//   const [endHours, endMinutes] = endTime.split(":").map(Number);

//   const startTotal = startHours * 60 + startMinutes;
//   const endTotal = endHours * 60 + endMinutes;

//   return endTotal - startTotal;
// }

// // Helper function to format minutes to hours and minutes
// function formatDuration(minutes: number): string {
//   if (minutes < 0) return "Invalid";
//   if (minutes === 0) return "No recess";

//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;

//   if (hours > 0) {
//     return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
//   }
//   return `${mins} min`;
// }

// // Helper function to calculate recess time between 4th and 5th lecture
// function calculateRecessTime(
//   fourthLecture: TimetableEntry | null,
//   fifthLecture: TimetableEntry | null,
// ): { duration: number; formatted: string; hasRecess: boolean } {
//   // If either lecture is missing or doesn't have times, no recess calculation
//   if (!fourthLecture?.endTime || !fifthLecture?.startTime) {
//     return { duration: 0, formatted: "No recess", hasRecess: false };
//   }

//   const gap = calculateTimeDifference(
//     fourthLecture.endTime,
//     fifthLecture.startTime,
//   );

//   // If gap is less than or equal to 0, no recess
//   if (gap <= 0) {
//     return { duration: 0, formatted: "No recess", hasRecess: false };
//   }

//   return {
//     duration: gap,
//     formatted: formatDuration(gap),
//     hasRecess: true,
//   };
// }

// export default function TimetablePage() {
//   const params = useParams();
//   const router = useRouter();
//   const classId = Number(params.id);

//   const [createDialogOpen, setCreateDialogOpen] = useState(false);
//   const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [deleteEntryInfo, setDeleteEntryInfo] =
//     useState<DeleteEntryInfo | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
//   const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
//   const [hoveredCell, setHoveredCell] = useState<SelectedCell | null>(null);

//   // Fetch data
//   const {
//     data: timetableData,
//     isLoading: loadingTimetable,
//     refetch,
//   } = useTimetable(classId);
//   const { data: subjectsData } = useSubjects(classId);
//   const { data: teachersData } = useTeachers();
//   const { createSingleMutation, updateEntryMutation, deleteEntryMutation } =
//     useTimetableMutations(classId);

//   const subjects = subjectsData?.data || [];
//   const teachers = teachersData?.data?.teachers || [];

//   // Transform timetable data into grid format
//   const [timetableGrid, setTimetableGrid] = useState<
//     Record<WeekDay, Record<number, TimetableEntry | null>>
//   >(
//     weekDays.reduce(
//       (acc, day) => {
//         acc[day] = LECTURE_SLOTS.reduce(
//           (slotAcc, slot) => {
//             slotAcc[slot] = null;
//             return slotAcc;
//           },
//           {} as Record<number, TimetableEntry | null>,
//         );
//         return acc;
//       },
//       {} as Record<WeekDay, Record<number, TimetableEntry | null>>,
//     ),
//   );

//   // Populate grid with existing data
//   useEffect(() => {
//     if (timetableData?.data) {
//       const newGrid = { ...timetableGrid };

//       // Reset grid
//       weekDays.forEach((day) => {
//         LECTURE_SLOTS.forEach((slot) => {
//           newGrid[day][slot] = null;
//         });
//       });

//       // Fill with data
//       Object.entries(timetableData.data).forEach(
//         ([day, daySchedule]: [string, any]) => {
//           daySchedule.lectures.forEach((lecture: TimetableEntry) => {
//             newGrid[day as WeekDay][lecture.lectureNo] = lecture;
//           });
//         },
//       );

//       setTimetableGrid(newGrid);
//     }
//   }, [timetableData]);

//   const handleAddEntry = (day: WeekDay, lectureNo: number) => {
//     const leftNeighbor = timetableGrid[day]?.[lectureNo - 1];
//     const rightNeighbor = timetableGrid[day]?.[lectureNo + 1];
//     const startTime = dbTimeToUi(leftNeighbor?.endTime);
//     const endTime = dbTimeToUi(rightNeighbor?.startTime);
//     setSelectedCell({ day, lectureNo, endTime, startTime });
//     setCreateDialogOpen(true);
//   };

//   const handleEditEntry = (entry: TimetableEntry, day: WeekDay) => {
//     setEditingEntry({
//       id: entry.id,
//       subjectId: entry.subject.id,
//       subjectName: entry.subject.name,
//       teacherName: entry.teacher.name,
//       startTime: entry.startTime,
//       endTime: entry.endTime,
//       day,
//       lectureNo: entry.lectureNo,
//     });
//     setUpdateDialogOpen(true);
//   };

//   const handleDeleteClick = (entry: TimetableEntry, day: WeekDay) => {
//     setDeleteEntryInfo({
//       id: entry.id,
//       subjectName: entry.subject.name,
//       teacherName: entry.teacher.name,
//       day,
//       lectureNo: entry.lectureNo,
//       startTime: entry.startTime,
//       endTime: entry.endTime,
//     });
//     setDeleteDialogOpen(true);
//   };

//   const handleCreateSubmit = async (data: CreateSingleTimetableType) => {
//     try {
//       await createSingleMutation.mutateAsync(data);
//       toast.success("Timetable entry added successfully");
//       setCreateDialogOpen(false);
//       refetch();
//     } catch (error: any) {
//       toast.error(error.message || "Failed to add timetable entry");
//     }
//   };

//   const handleDeleteConfirm = async () => {
//     if (!deleteEntryInfo) return;

//     setIsDeleting(true);
//     try {
//       await deleteEntryMutation.mutateAsync(deleteEntryInfo.id);
//       toast.success("Entry deleted successfully");
//       setDeleteDialogOpen(false);
//       setDeleteEntryInfo(null);
//       refetch();
//     } catch (error: any) {
//       toast.error(error.message || "Failed to delete entry");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   if (loadingTimetable) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center gap-4">
//           <Skeleton className="h-10 w-10" />
//           <Skeleton className="h-8 w-64" />
//         </div>
//         <Skeleton className="h-[600px] w-full" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pt-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="w-4 h-4" />
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">
//               Class Timetable
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               View and manage class schedule
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Timetable Grid */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Weekly Schedule</CardTitle>
//           <CardDescription>
//             Click on any empty cell to add a new entry, or click on an existing
//             entry to edit
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <div className="min-w-[900px]">
//               {/* Header Row */}
//               <div className="grid grid-cols-[120px_repeat(4,1fr)_100px_repeat(4,1fr)] gap-2 mb-2">
//                 <div className="font-semibold text-muted-foreground">
//                   Day / Lecture
//                 </div>
//                 {LECTURE_SLOTS.slice(0, 4).map((slot) => (
//                   <div key={slot} className="text-center font-semibold">
//                     Lecture {slot}
//                   </div>
//                 ))}
//                 <div className="text-center font-semibold text-amber-600 flex items-center justify-center gap-1">
//                   <Coffee className="w-4 h-4" />
//                   Recess
//                 </div>
//                 {LECTURE_SLOTS.slice(4).map((slot) => (
//                   <div key={slot} className="text-center font-semibold">
//                     Lecture {slot}
//                   </div>
//                 ))}
//               </div>

//               {/* Grid Rows */}
//               {weekDays.map((day) => {
//                 // Calculate recess time for this day
//                 const fourthLecture = timetableGrid[day]?.[4];
//                 const fifthLecture = timetableGrid[day]?.[5];
//                 const recess = calculateRecessTime(fourthLecture, fifthLecture);

//                 return (
//                   <div
//                     key={day}
//                     className="grid grid-cols-[120px_repeat(4,1fr)_100px_repeat(4,1fr)] gap-2 mb-2"
//                   >
//                     {/* Day Label */}
//                     <div className="flex items-center font-medium bg-muted/50 rounded-lg px-3 py-4">
//                       {weekDayLabels[day]}
//                     </div>

//                     {/* First 4 Lectures */}
//                     {LECTURE_SLOTS.slice(0, 4).map((slot) => {
//                       const entry = timetableGrid[day]?.[slot];
//                       const isHovered =
//                         hoveredCell?.day === day &&
//                         hoveredCell?.lectureNo === slot;

//                       return (
//                         <div
//                           key={`${day}-${slot}`}
//                           className={cn(
//                             "relative min-h-[100px] rounded-lg border-2 transition-all cursor-pointer group",
//                             entry
//                               ? "border-primary/20 bg-primary/5 hover:border-primary/50"
//                               : "border-dashed border-muted-foreground/20 hover:border-primary/30 bg-muted/10",
//                             isHovered && "border-primary shadow-md",
//                           )}
//                           onMouseEnter={() =>
//                             setHoveredCell({ day, lectureNo: slot })
//                           }
//                           onMouseLeave={() => setHoveredCell(null)}
//                           onClick={() =>
//                             entry
//                               ? handleEditEntry(entry, day)
//                               : handleAddEntry(day, slot)
//                           }
//                         >
//                           {entry ? (
//                             <div className="p-3 h-full">
//                               <div className="font-medium text-sm mb-1">
//                                 {entry.subject.name}
//                               </div>
//                               {entry.startTime && entry.endTime && (
//                                 <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
//                                   <Clock className="w-3 h-3" />
//                                   {entry.startTime} - {entry.endTime}
//                                 </div>
//                               )}
//                               <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                                 <User className="w-3 h-3" />
//                                 {entry.teacher.name}
//                               </div>

//                               {/* Hover Tooltip */}
//                               {isHovered && (
//                                 <div className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-2 rounded-b-lg text-xs animate-in slide-in-from-bottom-1 shadow-lg">
//                                   <div className="flex flex-col gap-1.5">
//                                     <Button
//                                       size="sm"
//                                       variant="default"
//                                       className="w-full h-8 justify-start gap-2"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleEditEntry(entry, day);
//                                       }}
//                                     >
//                                       <Edit className="w-3.5 h-3.5" />
//                                       Edit Entry
//                                     </Button>
//                                     <Button
//                                       size="sm"
//                                       variant="destructive"
//                                       className="w-full h-8 justify-start gap-2"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleDeleteClick(entry, day);
//                                       }}
//                                     >
//                                       <Trash2 className="w-3.5 h-3.5" />
//                                       Delete Entry
//                                     </Button>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           ) : (
//                             <div className="flex bg-primary/30 rounded-lg items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
//                               <Plus className="w-5 h-5 text-muted-foreground" />
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}

//                     {/* Recess Column - Dynamic based on time gap */}
//                     <div
//                       className={cn(
//                         "border-2 rounded-lg min-h-[100px] flex flex-col items-center justify-center p-2 transition-colors",
//                         recess.hasRecess
//                           ? "bg-amber-50 border-amber-200"
//                           : "bg-gray-50 border-gray-200",
//                       )}
//                     >
//                       <Coffee
//                         className={cn(
//                           "w-6 h-6 mb-1",
//                           recess.hasRecess ? "text-amber-600" : "text-gray-400",
//                         )}
//                       />
//                       <span
//                         className={cn(
//                           "text-xs font-medium",
//                           recess.hasRecess ? "text-amber-700" : "text-gray-500",
//                         )}
//                       >
//                         Recess
//                       </span>
//                       <span
//                         className={cn(
//                           "text-xs mt-1",
//                           recess.hasRecess ? "text-amber-600" : "text-gray-400",
//                         )}
//                       >
//                         {recess.formatted}
//                       </span>
//                       {!recess.hasRecess &&
//                         fourthLecture?.endTime &&
//                         fifthLecture?.startTime && (
//                           <span className="text-[10px] text-gray-400 mt-1">
//                             Gap:{" "}
//                             {calculateTimeDifference(
//                               fourthLecture.endTime,
//                               fifthLecture.startTime,
//                             )}{" "}
//                             min
//                           </span>
//                         )}
//                     </div>

//                     {/* Last 4 Lectures */}
//                     {LECTURE_SLOTS.slice(4).map((slot) => {
//                       const entry = timetableGrid[day]?.[slot];
//                       const isHovered =
//                         hoveredCell?.day === day &&
//                         hoveredCell?.lectureNo === slot;

//                       return (
//                         <div
//                           key={`${day}-${slot}`}
//                           className={cn(
//                             "relative min-h-[100px] rounded-lg border-2 transition-all cursor-pointer group",
//                             entry
//                               ? "border-primary/20 bg-primary/5 hover:border-primary/50"
//                               : "border-dashed border-muted-foreground/20 hover:border-primary/30 bg-muted/10",
//                             isHovered && "border-primary shadow-md",
//                           )}
//                           onMouseEnter={() =>
//                             setHoveredCell({ day, lectureNo: slot })
//                           }
//                           onMouseLeave={() => setHoveredCell(null)}
//                           onClick={() =>
//                             entry
//                               ? handleEditEntry(entry, day)
//                               : handleAddEntry(day, slot)
//                           }
//                         >
//                           {entry ? (
//                             <div className="p-3 h-full">
//                               <div className="font-medium text-sm mb-1">
//                                 {entry.subject.name}
//                               </div>
//                               {entry.startTime && entry.endTime && (
//                                 <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
//                                   <Clock className="w-3 h-3" />
//                                   {entry.startTime} - {entry.endTime}
//                                 </div>
//                               )}
//                               <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                                 <User className="w-3 h-3" />
//                                 {entry.teacher.name}
//                               </div>

//                               {/* Hover Tooltip */}
//                               {isHovered && (
//                                 <div className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-2 rounded-b-lg text-xs animate-in slide-in-from-bottom-1 shadow-lg">
//                                   <div className="flex flex-col gap-1.5">
//                                     <Button
//                                       size="sm"
//                                       variant="default"
//                                       className="w-full h-8 justify-start gap-2"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleEditEntry(entry, day);
//                                       }}
//                                     >
//                                       <Edit className="w-3.5 h-3.5" />
//                                       Edit Entry
//                                     </Button>
//                                     <Button
//                                       size="sm"
//                                       variant="destructive"
//                                       className="w-full h-8 justify-start gap-2"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleDeleteClick(entry, day);
//                                       }}
//                                     >
//                                       <Trash2 className="w-3.5 h-3.5" />
//                                       Delete Entry
//                                     </Button>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           ) : (
//                             <div className="flex bg-primary/30 rounded-lg items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
//                               <Plus className="w-5 h-5 text-muted-foreground" />
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Create Entry Dialog */}
//       {selectedCell && (
//         <CreateTimetableDialog
//           open={createDialogOpen}
//           onOpenChange={setCreateDialogOpen}
//           subjects={subjects}
//           classId={classId}
//           defaultDay={selectedCell.day}
//           defaultLectureNo={selectedCell.lectureNo}
//           endTime={selectedCell.endTime}
//           startTime={selectedCell.startTime}
//         />
//       )}

//       {/* Update Entry Dialog */}
//       <UpdateTimetableDialog
//         open={updateDialogOpen}
//         onOpenChange={setUpdateDialogOpen}
//         entry={editingEntry}
//         subjects={subjects}
//         classId={classId}
//       />

//       {/* Delete Confirmation Dialog */}
//       <DeleteConfirmDialog
//         open={deleteDialogOpen}
//         onOpenChange={setDeleteDialogOpen}
//         onConfirm={handleDeleteConfirm}
//         entryDetails={
//           deleteEntryInfo
//             ? {
//                 subjectName: deleteEntryInfo.subjectName,
//                 teacherName: deleteEntryInfo.teacherName,
//                 day: weekDayLabels[deleteEntryInfo.day],
//                 lectureNo: deleteEntryInfo.lectureNo,
//                 time:
//                   deleteEntryInfo.startTime && deleteEntryInfo.endTime
//                     ? `${deleteEntryInfo.startTime} - ${deleteEntryInfo.endTime}`
//                     : undefined,
//               }
//             : null
//         }
//         isDeleting={isDeleting}
//       />
//     </div>
//   );
// }
import React from "react";

function TimeTable() {
  return <div>TimeTable</div>;
}

export default TimeTable;
