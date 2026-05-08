// ==================== Enums ====================

export enum FeeType {
  MONTHLY = "monthly",
  ONE_TIME = "one_time",
  YEARLY = "yearly",
}

export enum OptionalFeeType {
  EVENT = "event",
  ACTIVITY = "activity",
  OTHER = "other",
}

export enum DiscountType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
}

export enum InvoiceSourceType {
  CLASS_FEE = "fee",
  TRANSPORT = "transport",
  EXAM = "exam",
  OPTIONAL = "optional",
}

export enum InvoiceStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  PAID = "paid",
  OVERDUE = "overdue",
}

export enum PaymentMode {
  CASH = "cash",
  UPI = "upi",
  CARD = "card",
  BANK = "bank",
}

export enum OptionalFeeStatus {
  SELECTED = "selected",
  CANCELLED = "cancelled",
}

// ==================== Class Fee Types ====================

export interface ClassFee {
  id: number;
  name: string;
  type: FeeType;
  amount: number;
  classId: number;
  sessionId: number;
  applicableDay: number | null;
  dueDay: number | null;
  applicableDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: number;
    name: string;
    section: string;
  };
  session?: {
    id: number;
    name: string;
  };
}

export interface CreateClassFeeRequest {
  name: string;
  type: FeeType;
  amount: number;
  classId: number;
  sessionId: number;
  applicableDay?: number;
  dueDay?: number;
  applicableDate?: string;
  dueDate?: string;
}

export interface UpdateClassFeeRequest {
  name?: string;
  amount?: number;
  applicableDay?: number;
  dueDay?: number;
  applicableDate?: string;
  dueDate?: string;
}

export interface ClassFeeFilters {
  classId?: number;
  sessionId?: number;
  type?: FeeType;
}

// ==================== Exam Fee Types ====================

export interface ExamFee {
  id: number;
  examId: number;
  classId: number;
  sessionId: number;
  amount: number;
  isOptional: boolean;
  applicableDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  exam?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  };
  class?: {
    id: number;
    name: string;
    section: string;
  };
  session?: {
    id: number;
    name: string;
  };
}

export interface CreateExamFeeRequest {
  examId: number;
  classId: number;
  sessionId: number;
  amount: number;
  isOptional: boolean;
  applicableDate?: string;
  dueDate?: string;
}

export interface UpdateExamFeeRequest {
  amount?: number;
  isOptional?: boolean;
  applicableDate?: string;
  dueDate?: string;
}

export interface ExamFeeFilters {
  examId?: number;
  classId?: number;
  sessionId?: number;
}

// ==================== Optional Fee Types ====================

export interface OptionalFee {
  id: number;
  name: string;
  type: OptionalFeeType;
  amount: number;
  classId: number | null;
  sessionId: number;
  applicableDate: string | null;
  dueDate: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: number;
    name: string;
    section: string;
  };
  session?: {
    id: number;
    name: string;
  };
}

export interface CreateOptionalFeeRequest {
  name: string;
  type: OptionalFeeType;
  amount: number;
  classId?: number | null;
  sessionId: number;
  applicableDate?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOptionalFeeRequest {
  name?: string;
  amount?: number;
  applicableDate?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
}

export interface OptionalFeeFilters {
  classId?: number;
  sessionId?: number;
  type?: OptionalFeeType;
}

// ==================== Student Fee Assignment Types ====================

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
  createdAt: string;
  updatedAt: string;
  classFee?: ClassFee;
}

export interface CreateStudentFeeRequest {
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

export interface CreateStudentExamFeeRequest {
  classStudentId: number;
  examFeeId: number;
  isApplicable: boolean;
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

export interface CreateStudentOptionalFeeRequest {
  classStudentId: number;
  optionalFeeId: number;
}

// ==================== Invoice Types ====================

export interface Invoice {
  id: number;
  sourceType: InvoiceSourceType;
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
}

// ==================== Payment Types ====================

export interface Payment {
  id: number;
  classStudentId: number;
  sessionId: number;
  totalAmount: number;
  paymentDate: string;
  mode: PaymentMode;
  referenceId: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  classStudentId: number;
  sessionId: number;
  totalAmount: number;
  paymentDate: string;
  mode: PaymentMode;
  referenceId?: string;
  remarks?: string;
}

export interface PaymentAllocation {
  id: number;
  paymentId: number;
  invoiceId: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AllocatePaymentRequest {
  paymentId: number;
  allocations: Array<{
    invoiceId: number;
    amount: number;
  }>;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}
