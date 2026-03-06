export type Teacher = {
  id: number;
  userId: number;
  employeeCode: string;
  joiningDate: string;
  qualification: string;
  name: string;
  email: string;
  phone: string;
  role: "teacher";
  isActive: boolean;
  profilePic?: string | null;
  classCount?: number; // Number of classes they're class teacher of
  classes?: Array<{ id: number }>; // Basic class info
};

export type TeacherDetail = Teacher & {
  classTeacherOf: Array<{
    id: number;
    name: string;
    section: string;
    sessionId: number;
    displayName: string;
  }>;
};

export type CreateTeacherPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  employeeCode: string;
  joiningDate: string;
  qualification: string;
  image?: File | null;
};

export type UpdateTeacherPayload = Partial<
  Omit<CreateTeacherPayload, "password">
> & {
  isActive?: boolean;
  image?: File | null;
};

export type Pagination = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};

export type TeachersResponse = {
  teachers: Teacher[];
  pagination: Pagination;
};
