import { Subject } from "../subjects/types.subject";

export type TeacherLite = {
  id: number;
  name: string;
};

export interface ClassType {
  // Renamed from classType to ClassType (PascalCase convention)
  id: number;
  name: string;
  section: string;
  sessionId: number; // Changed
  classTeacherId: number; // Changed
  createdAt: string;
  classTeacher: TeacherLite | null; // Changed from array to single object
  subjects: Subject[];
}
