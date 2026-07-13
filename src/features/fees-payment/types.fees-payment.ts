import { InvoiceStatus, PaymentMode } from "../fees/types.fees";

// ==================== Payment Types ====================

export interface Payment {
  id: number;
  studentId: number;
  sessionId: number;
  totalAmount: number;
  paymentDate: string;
  mode: PaymentMode;
  referenceId: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    studentId: number;
    student?: {
      id: number;
      name: string;
      admissionNo: string;
    };
  };
  allocations?: PaymentAllocation[];
}

export interface PaymentAllocation {
  id: number;
  paymentId: number;
  invoiceId: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: number;
    totalAmount: number;
    paidAmount: number;
    status: InvoiceStatus;
    dueDate: string;
  };
}

// ==================== Request/Response Types ====================

export interface CreatePaymentRequest {
  studentId: number;
  sessionId: number;
  totalAmount: number;
  paymentDate: string;
  mode: PaymentMode;
  referenceId?: string;
  remarks?: string;
}

export interface CreatePaymentResponse {
  payment: Payment;
  allocations: Array<{
    invoiceId: number;
    amount: number;
    previousPaid: number;
    newTotalPaid: number;
    invoiceStatus: InvoiceStatus;
  }>;
  unallocatedAmount: number;
}

export interface AllocatePaymentRequest {
  paymentId: number;
  allocations: Array<{
    invoiceId: number;
    amount: number;
  }>;
}

export interface AllocatePaymentResponse {
  paymentId: number;
  totalAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  allocations: Array<{
    invoiceId: number;
    invoiceNumber: number;
    amount: number;
    previousPaid: number;
    newTotalPaid: number;
    invoiceStatus: InvoiceStatus;
  }>;
}

export interface AutoAllocateResponse {
  paymentId: number;
  totalAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  allocations: Array<{
    invoiceId: number;
    invoiceNumber: number;
    amount: number;
    previousPaid: number;
    newTotalPaid: number;
    invoiceStatus: InvoiceStatus;
  }>;
}

// ==================== Outstanding Types ====================

export interface OutstandingInvoice {
  id: number;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  isOverdue: boolean;
}

export interface OutstandingResult {
  totalOutstanding: number;
  overdueAmount: number;
  pendingAmount: number;
  partialAmount: number;
  unallocatedAmount: number;
  invoices: OutstandingInvoice[];
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
