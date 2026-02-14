export type TeacherLite = {
  id: number;
  name: string;
};
export interface classType {
  id: string;
  name: string;
  section: string;
  session_id: string;
  class_teacher_id: string;
  createdAt: string;
  classTeacher: TeacherLite[];
  subjects: Subject[];
}

export type Subject = {
  id: number;
  name: string;
  class_id: number;
  session_id: number;
  teacher_id: number;
  createdAt: string;
  updatedAt: string;
  teacher: TeacherLite;
};
