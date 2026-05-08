// ==================== Base Types ====================

export interface TransportRoute {
  id: number;
  name: string;
  vehicleNumber: string | null;
  sessionId: number;
  createdAt: string;
  updatedAt: string;
  stops?: RouteStop[];
  disabledMonths?: DisabledMonth[];
  activeStudentsCount: number;
}

export interface RouteStop {
  id: number;
  name: string;
  monthlyFee: number;
  stopOrder: number;
  routeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DisabledMonth {
  id: number;
  routeId: number;
  yearMonth: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentTransport {
  id: number;
  classStudentId: number;
  routeId: number;
  stopId: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  route?: TransportRoute;
  stop?: RouteStop;
}

export interface StudentTransportWithDetails extends StudentTransport {
  route: TransportRoute;
  stop: RouteStop;
}

// ==================== Request/Response Types ====================

// Route
export interface CreateRouteRequest {
  name: string;
  vehicleNumber?: string | null;
  sessionId: number;
}

export interface UpdateRouteRequest {
  name?: string;
  vehicleNumber?: string | null;
}

// Stop
export interface CreateStopRequest {
  name: string;
  monthlyFee: number;
  stopOrder?: number;
  routeId: number;
}

export interface UpdateStopRequest {
  name?: string;
  monthlyFee?: number;
  stopOrder?: number;
}

export interface BulkCreateStopsRequest {
  routeId: number;
  stops: Array<{
    name: string;
    monthlyFee: number;
    stopOrder?: number;
  }>;
}

export interface BulkCreateStopsResponse {
  created: number;
  failed: number;
  errors: Array<{
    stopIndex: number;
    stopName: string;
    error: string;
  }>;
  stops: RouteStop[];
}

// Student Transport
export interface AssignStudentTransportRequest {
  classStudentId: number;
  routeId: number;
  stopId: number;
  startDate: string;
  endDate?: string | null;
}

export interface UpdateStudentTransportRequest {
  routeId?: number;
  stopId?: number;
  endDate?: string | null;
}

export interface DeactivateStudentTransportRequest {
  endDate: string;
}

export interface BulkAssignStudentsRequest {
  assignments: Array<{
    classStudentId: number;
    routeId: number;
    stopId: number;
    startDate: string;
    endDate?: string | null;
  }>;
}

export interface BulkAssignStudentsResponse {
  created: number;
  failed: number;
  errors: Array<{
    assignmentIndex: number;
    classStudentId: number;
    error: string;
  }>;
  assignments: StudentTransport[];
}

// Disabled Month
export interface AddDisabledMonthRequest {
  routeId: number;
  yearMonth: string;
  reason?: string | null;
}

// ==================== Query Parameter Types ====================

export interface GetRoutesBySessionParams {
  sessionId: number;
}

export interface GetStopsByRouteParams {
  routeId: number;
}

export interface GetStudentTransportParams {
  classStudentId: number;
}

export interface GetDisabledMonthsParams {
  routeId: number;
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

// ==================== Form Types ====================

export interface RouteFormValues {
  name: string;
  vehicleNumber: string;
  sessionId: number;
}

export interface StopFormValues {
  name: string;
  monthlyFee: number;
  stopOrder?: number;
}

export interface StudentTransportFormValues {
  classStudentId: number;
  routeId: number;
  stopId: number;
  startDate: string;
  endDate?: string;
}

export interface DisabledMonthFormValues {
  routeId: number;
  yearMonth: string;
  reason?: string;
}

// ==================== Filter Types ====================

export interface TransportFilters {
  sessionId?: number;
  search?: string;
  isActive?: boolean;
}

export interface StopFilters {
  routeId?: number;
  search?: string;
}

export interface StudentTransportFilters {
  classStudentId?: number;
  routeId?: number;
  isActive?: boolean;
  fromDate?: string;
  toDate?: string;
}
// Student by Transport Response
export interface StudentByTransportResponse {
  id: number;
  classStudentId: number;
  admissionNo: string;
  name: string;
  gender: "male" | "female" | "other" | null;
  dob: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string | null;
  motherPhone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  user: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    isActive: boolean;
    profilePic: string | null;
  };
  transportDetails: {
    id: number;
    routeId: number;
    routeName: string;
    stopId: number;
    stopName: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    monthlyFee: number;
  };
}

// Students by Stop Response
export interface StudentsByStopResponse {
  stop: {
    id: number;
    name: string;
    monthlyFee: number;
    stopOrder: number;
    routeId: number;
    routeName: string;
  };
  students: StudentByStopItem[];
  summary: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    totalMonthlyRevenue: number;
  };
}

export interface StudentByStopItem {
  id: number;
  classStudentId: number;
  admissionNo: string;
  name: string;
  gender: "male" | "female" | "other" | null;
  dob: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string | null;
  motherPhone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  user: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    isActive: boolean;
    profilePic: string | null;
  };
  transportDetails: {
    id: number;
    routeId: number;
    routeName: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    monthlyFee: number;
  };
}
// Students by Route Response
export interface StudentsByRouteResponse {
  route: {
    id: number;
    name: string;
    vehicleNumber: string | null;
  };
  students: StudentByRouteItem[];
  summary: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    totalMonthlyRevenue: number;
  };
}

export interface StudentByRouteItem {
  id: number;
  classStudentId: number;
  admissionNo: string;
  name: string;
  gender: "male" | "female" | "other" | null;
  dob: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string | null;
  motherPhone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  user: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    isActive: boolean;
    profilePic: string | null;
  };
  transportDetails: {
    id: number;
    stopId: number;
    stopName: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    monthlyFee: number;
  };
}
// Change Stop Request/Response
export interface ChangeStopRequest {
  newStopId: number;
  newRouteId?: number;
  effectiveDate: string;
  reason?: string;
}

export interface ChangeStopResponse {
  oldTransport: StudentTransportWithDetails;
  newTransport: StudentTransportWithDetails;
}

// Deactivate Transport Request
export interface DeactivateTransportRequest {
  transportId: number;
  endDate: string;
  reason?: string;
}

// Student Transport History Response
export interface StudentTransportHistoryResponse {
  student: {
    id: number;
    classStudentId: number;
    admissionNo: string;
    name: string;
    gender: string | null;
    dob: string | null;
    fatherName: string | null;
    fatherPhone: string | null;
    motherName: string | null;
    motherPhone: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    user: {
      id: number;
      name: string;
      email: string | null;
      phone: string | null;
      role: string;
      isActive: boolean;
      profilePic: string | null;
    };
  };
  history: TransportHistoryItem[];
  summary: {
    totalAssignments: number;
    activeAssignments: number;
    inactiveAssignments: number;
    currentAssignment: TransportHistoryItem | null;
  };
}

export interface TransportHistoryItem {
  id: number;
  routeId: number;
  routeName: string;
  stopId: number;
  stopName: string;
  monthlyFee: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
