export type Teacher = {
  id: number;
  user_id: number;

  employee_code: string;
  joining_date: string;
  qualification: string;

  name: string;
  email: string;
  phone: string;

  role: "teacher";
  is_active: boolean;
};
export type CreateTeacherPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  employee_code: string;
  joining_date: string;
  qualification: string;
};

export type UpdateTeacherPayload = Partial<
  Omit<CreateTeacherPayload, "password">
> & {
  is_active?: boolean;
};
export type Pagination = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};

