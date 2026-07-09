import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { allocationApi } from "./api.fees-allocation";
import { InvoiceWithDetail } from "./types.fees-allocation";
import {
  AssignStudentFeeRequest,
  AssignStudentExamFeeRequest,
  AssignStudentOptionalFeeRequest,
  GenerateMonthlyInvoicesRequest,
  GenerateOneTimeInvoicesRequest,
} from "./types.fees-allocation";

// ==================== Query Keys ====================

export const allocationKeys = {
  all: ["fees-allocation"] as const,
  studentFees: (classStudentId: number) =>
    [...allocationKeys.all, "student-fees", classStudentId] as const,
  studentExamFees: (classStudentId: number) =>
    [...allocationKeys.all, "student-exam-fees", classStudentId] as const,
  studentOptionalFees: (classStudentId: number) =>
    [...allocationKeys.all, "student-optional-fees", classStudentId] as const,
  studentInvoices: (classStudentId: number) =>
    [...allocationKeys.all, "student-invoices", classStudentId] as const,
  invoice: (invoiceId: number) =>
    [...allocationKeys.all, "invoice", invoiceId] as const,
};

// ==================== Student Fee Hooks ====================

export const useStudentFees = (classStudentId: number) => {
  return useQuery({
    queryKey: allocationKeys.studentFees(classStudentId),
    queryFn: () =>
      allocationApi.getStudentFees(classStudentId).then((res) => res.data),
    enabled: !!classStudentId,
  });
};

export const useStudentExamFees = (classStudentId: number) => {
  return useQuery({
    queryKey: allocationKeys.studentExamFees(classStudentId),
    queryFn: () =>
      allocationApi.getStudentExamFees(classStudentId).then((res) => res.data),
    enabled: !!classStudentId,
  });
};

export const useStudentOptionalFees = (classStudentId: number) => {
  return useQuery({
    queryKey: allocationKeys.studentOptionalFees(classStudentId),
    queryFn: () =>
      allocationApi
        .getStudentOptionalFees(classStudentId)
        .then((res) => res.data),
    enabled: !!classStudentId,
  });
};

// ==================== Assignment Mutations ====================

export const useAssignStudentFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignStudentFeeRequest) =>
      allocationApi.assignStudentFee(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.studentFees(variables.classStudentId),
      });
    },
  });
};

export const useAssignStudentExamFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignStudentExamFeeRequest) =>
      allocationApi.assignStudentExamFee(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.studentExamFees(variables.classStudentId),
      });
    },
  });
};

export const useAssignStudentOptionalFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignStudentOptionalFeeRequest) =>
      allocationApi.assignStudentOptionalFee(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.studentOptionalFees(variables.classStudentId),
      });
    },
  });
};

// ==================== Invoice Hooks ====================

export const useStudentInvoices = (classStudentId: number) => {
  return useQuery({
    queryKey: allocationKeys.studentInvoices(classStudentId),
    queryFn: () =>
      allocationApi.getStudentInvoices(classStudentId).then((res) => res.data),
    enabled: !!classStudentId,
  });
};

export const useInvoice = (invoiceId: number) => {
  return useQuery({
    queryKey: allocationKeys.invoice(invoiceId),
    queryFn: () =>
      allocationApi.getInvoiceById(invoiceId).then((res) => res.data),
    enabled: !!invoiceId,
  });
};

export const useGenerateMonthlyInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateMonthlyInvoicesRequest) =>
      allocationApi.generateMonthlyInvoices(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...allocationKeys.all, "student-invoices"],
      });
    },
  });
};

export const useGenerateOneTimeInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateOneTimeInvoicesRequest) =>
      allocationApi.generateOneTimeInvoices(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...allocationKeys.all, "student-invoices"],
      });
    },
  });
};
