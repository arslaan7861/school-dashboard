import { api } from "@/lib/axios";
import {
  ApiResponse,
  ClassFee,
  CreateClassFeeRequest,
  UpdateClassFeeRequest,
  ClassFeeFilters,
  ExamFee,
  CreateExamFeeRequest,
  UpdateExamFeeRequest,
  ExamFeeFilters,
  OptionalFee,
  CreateOptionalFeeRequest,
  UpdateOptionalFeeRequest,
  OptionalFeeFilters,
  StudentFee,
  CreateStudentFeeRequest,
  StudentExamFee,
  CreateStudentExamFeeRequest,
  StudentOptionalFee,
  CreateStudentOptionalFeeRequest,
  Invoice,
  Payment,
  CreatePaymentRequest,
  PaymentAllocation,
  AllocatePaymentRequest,
} from "./types.fees";

const BASE_URL = "/fees";

// ==================== Class Fee APIs ====================

export const classFeeApi = {
  create: (data: CreateClassFeeRequest): Promise<ApiResponse<ClassFee>> =>
    api.post(`${BASE_URL}/class`, data),

  getAll: (filters?: ClassFeeFilters): Promise<ApiResponse<ClassFee[]>> =>
    api.get(`${BASE_URL}/class`, { params: filters }),

  getById: (feeId: number): Promise<ApiResponse<ClassFee>> =>
    api.get(`${BASE_URL}/class/${feeId}`),

  update: (
    feeId: number,
    data: UpdateClassFeeRequest,
  ): Promise<ApiResponse<ClassFee>> =>
    api.put(`${BASE_URL}/class/${feeId}`, data),

  delete: (feeId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/class/${feeId}`),
};

// ==================== Exam Fee APIs ====================

export const examFeeApi = {
  create: (data: CreateExamFeeRequest): Promise<ApiResponse<ExamFee>> =>
    api.post(`${BASE_URL}/exam`, data),

  getAll: (filters?: ExamFeeFilters): Promise<ApiResponse<ExamFee[]>> =>
    api.get(`${BASE_URL}/exam`, { params: filters }),

  getById: (feeId: number): Promise<ApiResponse<ExamFee>> =>
    api.get(`${BASE_URL}/exam/${feeId}`),

  update: (
    feeId: number,
    data: UpdateExamFeeRequest,
  ): Promise<ApiResponse<ExamFee>> =>
    api.put(`${BASE_URL}/exam/${feeId}`, data),

  delete: (feeId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/exam/${feeId}`),
};

// ==================== Optional Fee APIs ====================

export const optionalFeeApi = {
  create: (data: CreateOptionalFeeRequest): Promise<ApiResponse<OptionalFee>> =>
    api.post(`${BASE_URL}/optional`, data),

  getAll: (filters?: OptionalFeeFilters): Promise<ApiResponse<OptionalFee[]>> =>
    api.get(`${BASE_URL}/optional`, { params: filters }),

  getById: (feeId: number): Promise<ApiResponse<OptionalFee>> =>
    api.get(`${BASE_URL}/optional/${feeId}`),

  update: (
    feeId: number,
    data: UpdateOptionalFeeRequest,
  ): Promise<ApiResponse<OptionalFee>> =>
    api.put(`${BASE_URL}/optional/${feeId}`, data),

  delete: (feeId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/optional/${feeId}`),
};

// ==================== Student Fee Assignment APIs ====================

export const studentFeeApi = {
  assignClassFee: (
    data: CreateStudentFeeRequest,
  ): Promise<ApiResponse<StudentFee>> =>
    api.post(`${BASE_URL}/student-class-fee`, data),

  assignExamFee: (
    data: CreateStudentExamFeeRequest,
  ): Promise<ApiResponse<StudentExamFee>> =>
    api.post(`${BASE_URL}/student-exam-fee`, data),

  assignOptionalFee: (
    data: CreateStudentOptionalFeeRequest,
  ): Promise<ApiResponse<StudentOptionalFee>> =>
    api.post(`${BASE_URL}/student-optional-fee`, data),

  getStudentFees: (
    classStudentId: number,
  ): Promise<ApiResponse<StudentFee[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/fees`),

  getStudentExamFees: (
    classStudentId: number,
  ): Promise<ApiResponse<StudentExamFee[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/exam-fees`),

  getStudentOptionalFees: (
    classStudentId: number,
  ): Promise<ApiResponse<StudentOptionalFee[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/optional-fees`),
};

// ==================== Invoice APIs ====================

export const invoiceApi = {
  generateMonthlyInvoices: (
    sessionId: number,
    monthYear: string,
  ): Promise<ApiResponse<Invoice[]>> =>
    api.post(`${BASE_URL}/invoices/generate-monthly`, {
      sessionId,
      monthYear,
    }),

  generateOneTimeInvoices: (
    classStudentIds: number[],
  ): Promise<ApiResponse<Invoice[]>> =>
    api.post(`${BASE_URL}/invoices/generate-one-time`, {
      classStudentIds,
    }),

  getStudentInvoices: (
    studentId: number,
  ): Promise<ApiResponse<Invoice[]>> =>
    api.get(`${BASE_URL}/student/${studentId}/invoices`),

  getInvoiceById: (invoiceId: number): Promise<ApiResponse<Invoice>> =>
    api.get(`${BASE_URL}/invoices/${invoiceId}`),
};

// ==================== Payment APIs ====================

export const paymentApi = {
  create: (data: CreatePaymentRequest): Promise<ApiResponse<Payment>> =>
    api.post(`${BASE_URL}/payments`, data),

  allocate: (
    data: AllocatePaymentRequest,
  ): Promise<ApiResponse<PaymentAllocation[]>> =>
    api.post(`${BASE_URL}/payments/allocate`, data),

  getStudentPayments: (
    classStudentId: number,
  ): Promise<ApiResponse<Payment[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/payments`),

  getPaymentById: (paymentId: number): Promise<ApiResponse<Payment>> =>
    api.get(`${BASE_URL}/payments/${paymentId}`),
};
