import {
  ClassFee,
  ExamFee,
  OptionalFee,
  InvoiceStatus,
} from "../fees/types.fees";

// ==================== Enums ====================

export enum DiscountType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
}

export enum OptionalFeeStatus {
  SELECTED = "selected",
  CANCELLED = "cancelled",
}

// ==================== Invoice Source Detail Types ====================

export interface ClassFeeDetail {
  kind: "fee";
  feeName: string;
  feeType: string;
}

export interface TransportDetail {
  kind: "transport";
  routeName: string;
  stopName: string;
  monthlyFee: number;
}

export interface ExamFeeDetail {
  kind: "exam";
  examName: string;
  examStartDate: string | null;
}

export interface OptionalFeeDetail {
  kind: "optional";
  feeName: string;
  feeType: string;
}

export type InvoiceSourceDetail =
  | ClassFeeDetail
  | TransportDetail
  | ExamFeeDetail
  | OptionalFeeDetail;

// ==================== Student Fee Types ====================

export interface StudentFee {
  id: number;
  classStudentId: number;
  classFeeId: number;
  amount: number;
  discountType: DiscountType | null;
  discountValue: number | null;
  applicableDate: string | null;
  dueDate: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  isInvoiced?: boolean;
  createdAt: string;
  updatedAt: string;
  classFee?: ClassFee;
  student?: {
    id: number;
    studentId: number;
    student?: {
      id: number;
      name: string;
      admissionNo: string;
    };
  };
}

export interface StudentExamFee {
  id: number;
  classStudentId: number;
  examFeeId: number;
  amount: number;
  isApplicable: boolean;
  isInvoiced: boolean;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  examFee?: ExamFee;
}

export interface StudentOptionalFee {
  id: number;
  classStudentId: number;
  optionalFeeId: number;
  amount: number;
  status: OptionalFeeStatus;
  isInvoiced: boolean;
  selectedAt: string;
  createdAt: string;
  updatedAt: string;
  optionalFee?: OptionalFee;
}

// ==================== Invoice Types ====================

export interface Invoice {
  id: number;
  sourceType: "fee" | "transport" | "exam" | "optional";
  sourceId: number;
  billingMonth: string | null;
  applicableDate: string;
  dueDate: string;
  totalAmount: number;
  discountAmount: number;
  fineAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  classStudentId: number;
  sessionId: number;
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
}

// ==================== Enriched Invoice (with source detail) ====================

export interface InvoiceWithDetail {
  invoice: Invoice;
  sourceDetail: InvoiceSourceDetail | null;
}

// ==================== Request/Response Types ====================

export interface AssignStudentFeeRequest {
  classStudentId: number;
  classFeeId: number;
  amount: number;
  discountType?: DiscountType;
  discountValue?: number;
  applicableDate?: string;
  dueDate?: string;
  startDate: string;
  endDate?: string;
}

export interface AssignStudentExamFeeRequest {
  classStudentId: number;
  examFeeId: number;
  isApplicable: boolean;
}

export interface AssignStudentOptionalFeeRequest {
  classStudentId: number;
  optionalFeeId: number;
}

export interface GenerateMonthlyInvoicesRequest {
  sessionId: number;
  monthYear: string;
}

export interface GenerateOneTimeInvoicesRequest {
  classStudentIds: number[];
}

// ==================== Student Fees Summary ====================

export interface StudentFeesSummary {
  totalMonthlyFees: number;
  totalOneTimeFees: number;
  totalExamFees: number;
  totalOptionalFees: number;
  totalPendingAmount: number;
  totalPaidAmount: number;
  totalOverdueAmount: number;
}

export interface StudentInvoiceSummary {
  pending: number;
  partial: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
