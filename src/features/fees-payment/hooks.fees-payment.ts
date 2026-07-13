import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "./api.fees-payment";
import {
  CreatePaymentRequest,
  AllocatePaymentRequest,
} from "./types.fees-payment";

// ==================== Query Keys ====================

export const paymentKeys = {
  all: ["fees-payment"] as const,
  studentPayments: (studentId: number) =>
    [...paymentKeys.all, "student", studentId] as const,
  payment: (paymentId: number) =>
    [...paymentKeys.all, "payment", paymentId] as const,
  outstanding: (studentId: number) =>
    [...paymentKeys.all, "outstanding", studentId] as const,
};

// ==================== Query Hooks ====================

export const useStudentPayments = (studentId: number) => {
  return useQuery({
    queryKey: paymentKeys.studentPayments(studentId),
    queryFn: () =>
      paymentApi.getStudentPayments(studentId).then((res) => res.data),
    enabled: !!studentId,
  });
};

export const usePayment = (paymentId: number) => {
  return useQuery({
    queryKey: paymentKeys.payment(paymentId),
    queryFn: () => paymentApi.getPaymentById(paymentId).then((res) => res.data),
    enabled: !!paymentId,
  });
};

export const useStudentOutstanding = (studentId: number) => {
  return useQuery({
    queryKey: paymentKeys.outstanding(studentId),
    queryFn: () =>
      paymentApi.getStudentOutstanding(studentId).then((res) => res.data),
    enabled: !!studentId,
  });
};

// ==================== Mutation Hooks ====================

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.createPayment(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: paymentKeys.studentPayments(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.outstanding(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          "fees-allocation",
          "student-invoices",
          variables.studentId,
        ],
      });
    },
  });
};

export const useAllocatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AllocatePaymentRequest) =>
      paymentApi.allocatePayment(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.payment(data.paymentId),
      });
      queryClient.invalidateQueries({
        queryKey: [...paymentKeys.all, "student"],
      });
      queryClient.invalidateQueries({
        queryKey: [...paymentKeys.all, "outstanding"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fees-allocation", "student-invoices"],
      });
    },
  });
};

export const useAutoAllocateExisting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: number) =>
      paymentApi.autoAllocateExisting(paymentId),
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.payment(paymentId),
      });
      queryClient.invalidateQueries({
        queryKey: [...paymentKeys.all, "student"],
      });
      queryClient.invalidateQueries({
        queryKey: [...paymentKeys.all, "outstanding"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fees-allocation", "student-invoices"],
      });
    },
  });
};
