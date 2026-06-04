import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { studentApi } from "./api.student";
import {
  StudentsQueryParams,
  StudentsByClassQueryParams,
  CreateStudentFormValues,
  UpdateStudentFormValues,
} from "./types.student";

// Query keys
export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (params: StudentsQueryParams) =>
    [...studentKeys.lists(), params] as const,
  byClass: (params: StudentsByClassQueryParams) =>
    [...studentKeys.all, "byClass", params] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id?: number, sessionId?: number) =>
    [...studentKeys.details(), id, sessionId] as const,
};

// Get students listing with filters
export const useStudents = (params: StudentsQueryParams) => {
  const {
    sessionId,
    classId,
    showUnenrolled,
    search,
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: studentKeys.list({
      sessionId,
      classId,
      showUnenrolled,
      search,
      page,
      limit,
    }),
    queryFn: async () => {
      const response = await studentApi.getStudents({
        sessionId,
        classId,
        showUnenrolled,
        search,
        page,
        limit,
      });
      return response.data;
    },
    enabled: !!sessionId,
  });
};

// Get students by class
export const useStudentsByClass = (params: StudentsByClassQueryParams) => {
  const { classId, search, page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: studentKeys.byClass({ classId, search, page, limit }),
    queryFn: async () => {
      const response = await studentApi.getStudentsByClass({
        classId,
        search,
        page,
        limit,
      });
      return response.data;
    },
    enabled: !!classId,
  });
};

// Get student by ID with session
export const useStudent = (studentId?: number, sessionId?: number) => {
  return useQuery({
    queryKey: studentKeys.detail(studentId, sessionId),
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      if (!sessionId) throw new Error("Session ID is required");
      const response = await studentApi.getStudentById(studentId, sessionId);
      return response.data;
    },
    enabled: !!studentId && !!sessionId,
  });
};

// Student CRUD mutations
export const useStudentMutations = () => {
  const queryClient = useQueryClient();

  // Create student
  const createStudent = useMutation({
    mutationFn: ({
      data,
      image,
    }: {
      data: CreateStudentFormValues;
      image?: File;
    }) => studentApi.createStudent(data, image),
    onSuccess: (response) => {
      toast.success(response.message || "Student created successfully");

      // Invalidate students lists
      queryClient.invalidateQueries({
        queryKey: studentKeys.lists(),
      });
    },
  });

  // Update student
  const updateStudent = useMutation({
    mutationFn: ({
      studentId,
      data,
      image,
    }: {
      studentId: number;
      data: UpdateStudentFormValues;
      image?: File;
    }) => studentApi.updateStudent(studentId, data, image),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Student updated successfully");

      // Invalidate specific student detail
      queryClient.invalidateQueries({
        queryKey: studentKeys.detail(variables.studentId),
      });

      // Invalidate students lists
      queryClient.invalidateQueries({
        queryKey: studentKeys.lists(),
      });
    },
  });

  // Delete student
  const deleteStudent = useMutation({
    mutationFn: (studentId: number) => studentApi.deleteStudent(studentId),
    onSuccess: (response, studentId) => {
      toast.success(response.message || "Student deleted successfully");

      // Remove from cache
      queryClient.removeQueries({
        queryKey: studentKeys.detail(studentId),
      });

      // Invalidate students lists
      queryClient.invalidateQueries({
        queryKey: studentKeys.lists(),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete student");
    },
  });

  return {
    createStudent: createStudent.mutate,
    createStudentAsync: createStudent.mutateAsync,
    updateStudent: updateStudent.mutate,
    updateStudentAsync: updateStudent.mutateAsync,
    deleteStudent: deleteStudent.mutate,
    deleteStudentAsync: deleteStudent.mutateAsync,
    isCreating: createStudent.isPending,
    isUpdating: updateStudent.isPending,
    isDeleting: deleteStudent.isPending,
  };
};
