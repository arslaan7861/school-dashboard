import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  classFeeApi,
  examFeeApi,
  optionalFeeApi,
  studentFeeApi,
  invoiceApi,
  paymentApi,
} from "./api.fees";
import {
  ClassFeeFilters,
  ExamFeeFilters,
  OptionalFeeFilters,
  CreateClassFeeRequest,
  UpdateClassFeeRequest,
  CreateExamFeeRequest,
  UpdateExamFeeRequest,
  CreateOptionalFeeRequest,
  UpdateOptionalFeeRequest,
  CreateStudentFeeRequest,
  CreateStudentExamFeeRequest,
  CreateStudentOptionalFeeRequest,
  CreatePaymentRequest,
  AllocatePaymentRequest,
} from "./types.fees";

// ==================== Query Keys ====================

export const feesKeys = {
  all: ["fees"] as const,
  classFees: () => [...feesKeys.all, "class"] as const,
  classFee: (id: number) => [...feesKeys.classFees(), id] as const,
  examFees: () => [...feesKeys.all, "exam"] as const,
  examFee: (id: number) => [...feesKeys.examFees(), id] as const,
  optionalFees: () => [...feesKeys.all, "optional"] as const,
  optionalFee: (id: number) => [...feesKeys.optionalFees(), id] as const,
  studentFees: (classStudentId: number) =>
    [...feesKeys.all, "student", classStudentId] as const,
  invoices: (classStudentId: number) =>
    [...feesKeys.all, "invoices", classStudentId] as const,
  payments: (classStudentId: number) =>
    [...feesKeys.all, "payments", classStudentId] as const,
};

// ==================== Class Fee Hooks ====================

export const useClassFees = (filters?: ClassFeeFilters) => {
  return useQuery({
    queryKey: [...feesKeys.classFees(), filters],
    queryFn: () => classFeeApi.getAll(filters).then((res) => res.data),
  });
};

export const useClassFee = (feeId: number) => {
  return useQuery({
    queryKey: feesKeys.classFee(feeId),
    queryFn: () => classFeeApi.getById(feeId).then((res) => res.data),
    enabled: !!feeId,
  });
};

export const useCreateClassFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassFeeRequest) => classFeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feesKeys.classFees() });
    },
  });
};

export const useUpdateClassFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClassFeeRequest }) =>
      classFeeApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: feesKeys.classFees() });
      queryClient.invalidateQueries({
        queryKey: feesKeys.classFee(variables.id),
      });
    },
  });
};

export const useDeleteClassFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => classFeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feesKeys.classFees() });
    },
  });
};

// ==================== Exam Fee Hooks ====================

export const useExamFees = (filters?: ExamFeeFilters) => {
  return useQuery({
    queryKey: [...feesKeys.examFees(), filters],
    queryFn: () => examFeeApi.getAll(filters).then((res) => res.data),
  });
};

export const useExamFee = (feeId: number) => {
  return useQuery({
    queryKey: feesKeys.examFee(feeId),
    queryFn: () => examFeeApi.getById(feeId).then((res) => res.data),
    enabled: !!feeId,
  });
};

export const useCreateExamFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamFeeRequest) => examFeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feesKeys.examFees() });
    },
  });
};

export const useUpdateExamFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamFeeRequest }) =>
      examFeeApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: feesKeys.examFees() });
      queryClient.invalidateQueries({
        queryKey: feesKeys.examFee(variables.id),
      });
    },
  });
};

export const useDeleteExamFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => examFeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feesKeys.examFees() });
    },
  });
};

// ==================== Optional Fee Hooks ====================

export const useOptionalFees = (filters?: OptionalFeeFilters) => {
  return useQuery({
    queryKey: [...feesKeys.optionalFees(), filters],
    queryFn: () => optionalFeeApi.getAll(filters).then((res) => res.data),
  });
};

export const useOptionalFee = (feeId: number) => {
  return useQuery({
    queryKey: feesKeys.optionalFee(feeId),
    queryFn: () => optionalFeeApi.getById(feeId).then((res) => res.data),
    enabled: !!feeId,
  });
};

export const useCreateOptionalFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOptionalFeeRequest) => optionalFeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feesKeys.optionalFees() });
    },
  });
};

export const useUpdateOptionalFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateOptionalFeeRequest;
    }) => optionalFeeApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: feesKeys.optionalFees() });
      queryClient.invalidateQueries({
        queryKey: feesKeys.optionalFee(variables.id),
      });
    },
  });
};

export const useDeleteOptionalFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => optionalFeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feesKeys.optionalFees() });
    },
  });
};

// ==================== Student Fee Assignment Hooks ====================

export const useStudentFees = (classStudentId: number) => {
  return useQuery({
    queryKey: feesKeys.studentFees(classStudentId),
    queryFn: () =>
      studentFeeApi.getStudentFees(classStudentId).then((res) => res.data),
    enabled: !!classStudentId,
  });
};

export const useAssignClassFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentFeeRequest) =>
      studentFeeApi.assignClassFee(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: feesKeys.studentFees(data.classStudentId),
      });
    },
  });
};

export const useAssignExamFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentExamFeeRequest) =>
      studentFeeApi.assignExamFee(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: feesKeys.studentFees(data.classStudentId),
      });
    },
  });
};

export const useAssignOptionalFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentOptionalFeeRequest) =>
      studentFeeApi.assignOptionalFee(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: feesKeys.studentFees(data.classStudentId),
      });
    },
  });
};

// ==================== Invoice Hooks ====================

export const useGenerateMonthlyInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      monthYear,
    }: {
      sessionId: number;
      monthYear: string;
    }) => invoiceApi.generateMonthlyInvoices(sessionId, monthYear),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...feesKeys.all, "invoices"],
      });
    },
  });
};

export const useGenerateOneTimeInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classStudentIds: number[]) =>
      invoiceApi.generateOneTimeInvoices(classStudentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...feesKeys.all, "invoices"],
      });
    },
  });
};

export const useStudentInvoices = (classStudentId: number) => {
  return useQuery({
    queryKey: feesKeys.invoices(classStudentId),
    queryFn: () =>
      invoiceApi.getStudentInvoices(classStudentId).then((res) => res.data),
    enabled: !!classStudentId,
  });
};

// ==================== Payment Hooks ====================

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: feesKeys.payments(data.classStudentId),
      });
      queryClient.invalidateQueries({
        queryKey: feesKeys.invoices(data.classStudentId),
      });
    },
  });
};

export const useAllocatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AllocatePaymentRequest) => paymentApi.allocate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...feesKeys.all, "invoices"],
      });
      queryClient.invalidateQueries({
        queryKey: [...feesKeys.all, "invoices"],
      });
    },
  });
};

export const useStudentPayments = (classStudentId: number) => {
  return useQuery({
    queryKey: feesKeys.payments(classStudentId),
    queryFn: () =>
      paymentApi.getStudentPayments(classStudentId).then((res) => res.data),
    enabled: !!classStudentId,
  });
};
