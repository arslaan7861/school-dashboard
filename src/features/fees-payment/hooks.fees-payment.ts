import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "./api.fees-payment";
import {
  CreatePaymentRequest,
  AllocatePaymentRequest,
} from "./types.fees-payment";

// ==================== Query Keys ====================

export const paymentKeys = {
  all: ["fees-payment"] as const,
  studentPayments: (classStudentId: number) =>
    [...paymentKeys.all, "student", classStudentId] as const,
  payment: (paymentId: number) =>
    [...paymentKeys.all, "payment", paymentId] as const,
  outstanding: (classStudentId: number) =>
    [...paymentKeys.all, "outstanding", classStudentId] as const,
};

// ==================== Query Hooks ====================

export const useStudentPayments = (classStudentId: number) => {
  return useQuery({
    queryKey: paymentKeys.studentPayments(classStudentId),
    queryFn: () =>
      paymentApi.getStudentPayments(classStudentId).then((res) => res.data),
    enabled: !!classStudentId,
  });
};

export const usePayment = (paymentId: number) => {
  return useQuery({
    queryKey: paymentKeys.payment(paymentId),
    queryFn: () => paymentApi.getPaymentById(paymentId).then((res) => res.data),
    enabled: !!paymentId,
  });
};

export const useStudentOutstanding = (classStudentId: number) => {
  return useQuery({
    queryKey: paymentKeys.outstanding(classStudentId),
    queryFn: () =>
      paymentApi.getStudentOutstanding(classStudentId).then((res) => res.data),
    enabled: !!classStudentId,
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
        queryKey: paymentKeys.studentPayments(variables.classStudentId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.outstanding(variables.classStudentId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          "fees-allocation",
          "student-invoices",
          variables.classStudentId,
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
