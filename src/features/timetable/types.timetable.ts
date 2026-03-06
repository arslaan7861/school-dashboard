export enum WeekDay {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
}

export const WEEK_DAYS = [
  { value: WeekDay.MONDAY, label: "Monday" },
  { value: WeekDay.TUESDAY, label: "Tuesday" },
  { value: WeekDay.WEDNESDAY, label: "Wednesday" },
  { value: WeekDay.THURSDAY, label: "Thursday" },
  { value: WeekDay.FRIDAY, label: "Friday" },
  { value: WeekDay.SATURDAY, label: "Saturday" },
];

export interface TimetableSlot {
  id: number;
  classId: number;
  day: WeekDay;
  lectureNo: number;
  startTime?: string;
  endTime?: string;
  entries?: TimetableEntry[];
}

export interface TimetableEntry {
  id: number;
  timetableSlotId: number;
  classId: number;
  subjectId: number;
  subjectComponentId: number;
  academicBatchId: number;
  teacherId: number;
  subject?: {
    id: number;
    name: string;
  };
  component?: {
    id: number;
    name: string;
    type: string;
  };
  batch?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
  };
}

export interface ClassTimetableResponse {
  classId: number;
  className: string;
  section: string;
  sessionId: number;
  slots: Array<{
    id: number;
    day: WeekDay;
    lectureNo: number;
    startTime?: string;
    endTime?: string;
    entries: Array<{
      id: number;
      subject: {
        id: number;
        name: string;
      };
      component: {
        id: number;
        name: string;
        type: string;
      };
      batch: {
        id: number;
        name: string;
      };
      teacher: {
        id: number;
        name: string;
      };
    }>;
  }>;
}

export interface CreateSlotDto {
  classId: number;
  day: WeekDay;
  lectureNo: number;
  startTime?: string;
  endTime?: string;
}

export interface CreateEntryDto {
  timetableSlotId: number;
  classId: number;
  subjectId: number;
  subjectComponentId: number;
  academicBatchId: number;
  teacherId: number;
}

export interface UpdateSlotDto {
  day?: WeekDay;
  lectureNo?: number;
  startTime?: string;
  endTime?: string;
}

export interface UpdateEntryDto {
  subjectId?: number;
  subjectComponentId?: number;
  academicBatchId?: number;
  teacherId?: number;
}
