import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examApi } from "./api.exam";
import {
  CreateExamRequest,
  UpdateExamRequest,
  AssignExamToClassRequest,
  AddExamSubjectRequest,
  AddExamComponentRequest,
  UpdateExamComponentRequest,
  CreateExamScheduleRequest,
  UpdateExamScheduleRequest,
  EnterMarksRequest,
  ExamFilters,
} from "./types.exam";

// ==================== Query Keys ====================

export const examKeys = {
  all: ["exams"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  list: (filters?: ExamFilters) => [...examKeys.lists(), filters] as const,
  details: () => [...examKeys.all, "detail"] as const,
  detail: (id: number, includeDetails?: boolean) =>
    [...examKeys.details(), id, includeDetails] as const,
  marks: () => [...examKeys.all, "marks"] as const,
  marksByComponent: (componentId: number) =>
    [...examKeys.marks(), componentId] as const,
  statusSummary: (examId: number) =>
    [...examKeys.all, "status-summary", examId] as const,
  eligibility: (examId: number, studentId: number) =>
    [...examKeys.all, "eligibility", examId, studentId] as const,
  admitCard: (examId: number, studentId: number) =>
    [...examKeys.all, "admit-card", examId, studentId] as const,
  policy: (examId: number) =>
    [...examKeys.all, "policy", examId] as const,
  teacherDuties: (teacherId: number, sessionId?: number) =>
    [...examKeys.all, "teacher-duties", teacherId, sessionId] as const,
};

// ==================== Query Hooks ====================

export const useExams = (filters?: ExamFilters) => {
  return useQuery({
    queryKey: examKeys.list(filters),
    queryFn: () => examApi.getAll(filters).then((res) => res.data),
  });
};

export const useTeacherExamDuties = (teacherId: number, sessionId?: number) => {
  return useQuery({
    queryKey: examKeys.teacherDuties(teacherId, sessionId),
    queryFn: () => examApi.getTeacherExamDuties(teacherId, sessionId).then((res) => res.data),
    enabled: !!teacherId,
  });
};

export const useExam = (examId: number, includeDetails: boolean = false) => {
  return useQuery({
    queryKey: examKeys.detail(examId, includeDetails),
    queryFn: () =>
      examApi.getById(examId, includeDetails).then((res) => res.data),
    enabled: !!examId,
  });
};

export const useExamMarksByComponent = (componentId: number) => {
  return useQuery({
    queryKey: examKeys.marksByComponent(componentId),
    queryFn: () =>
      examApi.getMarksByComponent(componentId).then((res) => res.data),
    enabled: !!componentId,
  });
};

export const useExamStatusSummary = (examId: number) => {
  return useQuery({
    queryKey: examKeys.statusSummary(examId),
    queryFn: () => examApi.getStatusSummary(examId).then((res) => res.data),
    enabled: !!examId,
  });
};

export const useAdmitCardEligibility = (
  examId: number,
  classStudentId: number,
) => {
  return useQuery({
    queryKey: examKeys.eligibility(examId, classStudentId),
    queryFn: () =>
      examApi.checkEligibility(examId, classStudentId).then((res) => res.data),
    enabled: !!examId && !!classStudentId,
  });
};

export const useAdmitCard = (examId: number, classStudentId: number) => {
  return useQuery({
    queryKey: examKeys.admitCard(examId, classStudentId),
    queryFn: () =>
      examApi.generateAdmitCard(examId, classStudentId).then((res) => res.data),
    enabled: !!examId && !!classStudentId,
  });
};

// ==================== Mutation Hooks ====================

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamRequest) => examApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamRequest }) =>
      examApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: examKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => examApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
};

export const useAssignExamToClasses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignExamToClassRequest) =>
      examApi.assignToClasses(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(data.examId) });
    },
  });
};

export const useAddExamSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddExamSubjectRequest) => examApi.addSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.details() });
    },
  });
};

export const useAddExamComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddExamComponentRequest) => examApi.addComponent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.details() });
    },
  });
};

export const useUpdateExamComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examComponentId,
      data,
    }: {
      examComponentId: number;
      data: UpdateExamComponentRequest;
    }) => examApi.updateComponent(examComponentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.details() });
    },
  });
};

export const useDeleteExamComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examComponentId: number) =>
      examApi.deleteComponent(examComponentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.details() });
    },
  });
};

export const useCreateExamSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamScheduleRequest) =>
      examApi.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.details() });
    },
  });
};

export const useUpdateExamSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scheduleId,
      data,
    }: {
      scheduleId: number;
      data: UpdateExamScheduleRequest;
    }) => examApi.updateSchedule(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.details() });
    },
  });
};

export const useDeleteExamSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) => examApi.deleteSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.details() });
    },
  });
};

export const useEnterMarks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnterMarksRequest) => examApi.enterMarks(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: examKeys.marksByComponent(data.examComponentId),
      });
      queryClient.invalidateQueries({
        queryKey: [...examKeys.all, "status-summary"],
      });
    },
  });
};

export const useUpdateExamStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      examApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: examKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: examKeys.statusSummary(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
};

export const usePublishExamResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: number) => examApi.publishResults(examId),
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(examId) });
      queryClient.invalidateQueries({
        queryKey: examKeys.statusSummary(examId),
      });
    },
  });
};

export const useAdmitCardPolicy = (examId: number) => {
  return useQuery({
    queryKey: examKeys.policy(examId),
    queryFn: () => examApi.getAdmitCardPolicy(examId).then((res) => res.data),
    enabled: !!examId,
  });
};

export const useUpsertAdmitCardPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, data }: { examId: number; data: any }) =>
      examApi.upsertAdmitCardPolicy(examId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: examKeys.policy(variables.examId),
      });
      // Invalidate all eligibility queries
      queryClient.invalidateQueries({
        queryKey: [...examKeys.all, "eligibility"],
      });
      queryClient.invalidateQueries({
        queryKey: [...examKeys.all, "admit-card"],
      });
    },
  });
};
