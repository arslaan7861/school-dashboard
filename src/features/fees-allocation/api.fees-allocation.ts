import { api } from "@/lib/axios";
import {
  ApiResponse,
  StudentFee,
  StudentExamFee,
  StudentOptionalFee,
  Invoice,
  AssignStudentFeeRequest,
  AssignStudentExamFeeRequest,
  AssignStudentOptionalFeeRequest,
  GenerateMonthlyInvoicesRequest,
  GenerateOneTimeInvoicesRequest,
} from "./types.fees-allocation";

const BASE_URL = "/fees-allocation";

// ==================== Student Fee Assignment APIs ====================

export const allocationApi = {
  // Assign class fee to student
  assignStudentFee: (
    data: AssignStudentFeeRequest,
  ): Promise<ApiResponse<StudentFee>> =>
    api.post(`${BASE_URL}/student-class-fee`, data),

  // Assign exam fee to student
  assignStudentExamFee: (
    data: AssignStudentExamFeeRequest,
  ): Promise<ApiResponse<StudentExamFee>> =>
    api.post(`${BASE_URL}/student-exam-fee`, data),

  // Assign optional fee to student
  assignStudentOptionalFee: (
    data: AssignStudentOptionalFeeRequest,
  ): Promise<ApiResponse<StudentOptionalFee>> =>
    api.post(`${BASE_URL}/student-optional-fee`, data),

  // Get all fees for a student
  getStudentFees: (
    classStudentId: number,
  ): Promise<ApiResponse<StudentFee[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/fees`),

  // Get all exam fees for a student
  getStudentExamFees: (
    classStudentId: number,
  ): Promise<ApiResponse<StudentExamFee[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/exam-fees`),

  // Get all optional fees for a student
  getStudentOptionalFees: (
    classStudentId: number,
  ): Promise<ApiResponse<StudentOptionalFee[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/optional-fees`),

  // ==================== Invoice Generation APIs ====================

  // Generate monthly invoices
  generateMonthlyInvoices: (
    data: GenerateMonthlyInvoicesRequest,
  ): Promise<ApiResponse<Invoice[]>> =>
    api.post(`${BASE_URL}/invoices/generate-monthly`, data),

  // Generate one-time invoices
  generateOneTimeInvoices: (
    data: GenerateOneTimeInvoicesRequest,
  ): Promise<ApiResponse<Invoice[]>> =>
    api.post(`${BASE_URL}/invoices/generate-one-time`, data),

  // Get all invoices for a student
  getStudentInvoices: (
    classStudentId: number,
  ): Promise<ApiResponse<Invoice[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}/invoices`),

  // Get invoice by ID
  getInvoiceById: (invoiceId: number): Promise<ApiResponse<Invoice>> =>
    api.get(`${BASE_URL}/invoices/${invoiceId}`),
};
