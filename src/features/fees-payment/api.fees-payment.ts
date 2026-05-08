import { api } from "@/lib/axios";
import {
  ApiResponse,
  Payment,
  CreatePaymentRequest,
  CreatePaymentResponse,
  AllocatePaymentRequest,
  AllocatePaymentResponse,
  AutoAllocateResponse,
  OutstandingResult,
} from "./types.fees-payment";

const BASE_URL = "/fees-payment";

export const paymentApi = {
  // Create payment with auto-allocation
  createPayment: (
    data: CreatePaymentRequest,
  ): Promise<ApiResponse<CreatePaymentResponse>> =>
    api.post(`${BASE_URL}/`, data),

  // Manual allocate payment to specific invoices
  allocatePayment: (
    data: AllocatePaymentRequest,
  ): Promise<ApiResponse<AllocatePaymentResponse>> =>
    api.post(`${BASE_URL}/allocate`, data),

  // Auto-allocate existing payment
  autoAllocateExisting: (
    paymentId: number,
  ): Promise<ApiResponse<AutoAllocateResponse>> =>
    api.post(`${BASE_URL}/${paymentId}/auto-allocate`),

  // Get all payments for a student
  getStudentPayments: (
    classStudentId: number,
  ): Promise<ApiResponse<Payment[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}`),

  // Get payment by ID with allocations
  getPaymentById: (paymentId: number): Promise<ApiResponse<Payment>> =>
    api.get(`${BASE_URL}/${paymentId}`),

  // Get student outstanding amount and invoices
  getStudentOutstanding: (
    classStudentId: number,
  ): Promise<ApiResponse<OutstandingResult>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/outstanding`),
};
