// Calendar Action enum matching backend
export const CalendarAction = {
  MARK_HOLIDAY: "markHoliday",
  REMOVE_HOLIDAY: "removeHoliday",
  CREATE_EVENT: "createEvent",
  REMOVE_EVENT: "removeEvent",
  LOCK_ATTENDANCE: "lockAttendance",
  UNLOCK_ATTENDANCE: "unlockAttendance",
} as const;

export type CalendarAction =
  (typeof CalendarAction)[keyof typeof CalendarAction];

// Calendar Day from backend
export interface CalendarDay {
  id: number;
  date: string;
  isHoliday: boolean;
  holidayTitle: string | null;
  holidayDescription: string | null;
  eventDescription: string | null;
  event: string | null;
  isAttendanceLocked: boolean;
  totalClasses: string;
  attendanceRecords: string;
  present: string;
  absent: string;
  leave: string;
}

// Month dashboard response
export interface CalendarMonthResponse {
  id: number;
  eventDescription: string | null;
  date: string;
  isHoliday: boolean;
  holidayTitle: string | null;
  holidayDescription: string | null;
  event: string | null;
  isAttendanceLocked: boolean;
  totalClasses: string;
  attendanceRecords: string;
  present: string;
  absent: string;
  leave: string;
}

// Class override info
export interface ClassOverrideInfo {
  classId: number;
  name: string;
  section: string;
  isHoliday: boolean;
  holidayTitle: string | null;
  holidayDescription: string | null;
  event: string | null;
  eventDescription: string | null;
  isAttendanceLocked: boolean;
  attendanceRecords: string;
}

// Day details response
export interface DayDetailsResponse {
  dayInfo: {
    id: number;
    date: string;
    isHoliday: boolean;
    holidayTitle: string | null;
    holidayDescription: string | null;
    event: string | null;
    eventDescription: string | null;
    isAttendanceLocked: boolean;
  };
  classes: ClassOverrideInfo[];
}

// Query params for month dashboard
export interface CalendarMonthQuery {
  year: string;
  month: string;
  sessionId: number;
}

// Base update request with common fields
export interface BaseUpdateRequest {
  sessionId: number;
  startDate: string;
  endDate: string;
  classIds?: number[];
}

// Conditional types for each action
export type MarkHolidayRequest = BaseUpdateRequest & {
  action: typeof CalendarAction.MARK_HOLIDAY;
  holidayTitle: string;
  holidayDescription?: string;
  event?: never;
  eventDescription?: never;
};

export type RemoveHolidayRequest = BaseUpdateRequest & {
  action: typeof CalendarAction.REMOVE_HOLIDAY;
  holidayTitle?: never;
  holidayDescription?: never;
  event?: never;
  eventDescription?: never;
};

export type CreateEventRequest = BaseUpdateRequest & {
  action: typeof CalendarAction.CREATE_EVENT;
  event: string;
  eventDescription?: string;
  holidayTitle?: never;
  holidayDescription?: never;
};

export type RemoveEventRequest = BaseUpdateRequest & {
  action: typeof CalendarAction.REMOVE_EVENT;
  event?: never;
  eventDescription?: never;
  holidayTitle?: never;
  holidayDescription?: never;
};

export type LockAttendanceRequest = BaseUpdateRequest & {
  action: typeof CalendarAction.LOCK_ATTENDANCE;
  holidayTitle?: never;
  holidayDescription?: never;
  event?: never;
  eventDescription?: never;
};

export type UnlockAttendanceRequest = BaseUpdateRequest & {
  action: typeof CalendarAction.UNLOCK_ATTENDANCE;
  holidayTitle?: never;
  holidayDescription?: never;
  event?: never;
  eventDescription?: never;
};

// Union type for all update requests
export type UpdateCalendarRequest =
  | MarkHolidayRequest
  | RemoveHolidayRequest
  | CreateEventRequest
  | RemoveEventRequest
  | LockAttendanceRequest
  | UnlockAttendanceRequest;

// Session option for dropdown
export interface SessionOption {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
}

// Class option for dropdown
export interface ClassOption {
  id: number;
  name: string;
  section: string;
  displayName: string;
}

// Modal props
export interface HolidayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  classId?: number;
  onSuccess?: () => void;
}

export interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  classId?: number;
  onSuccess?: () => void;
}

export interface AttendanceLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  classId?: number;
  onSuccess?: () => void;
}
