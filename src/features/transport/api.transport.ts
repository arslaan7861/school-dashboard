import { api } from "@/lib/axios";
import {
  ApiResponse,
  PaginatedResponse,
  TransportRoute,
  RouteStop,
  StudentTransport,
  StudentTransportWithDetails,
  DisabledMonth,
  CreateRouteRequest,
  UpdateRouteRequest,
  CreateStopRequest,
  UpdateStopRequest,
  BulkCreateStopsRequest,
  BulkCreateStopsResponse,
  AssignStudentTransportRequest,
  UpdateStudentTransportRequest,
  DeactivateStudentTransportRequest,
  BulkAssignStudentsRequest,
  BulkAssignStudentsResponse,
  AddDisabledMonthRequest,
  GetRoutesBySessionParams,
  GetStopsByRouteParams,
  GetStudentTransportParams,
  GetDisabledMonthsParams,
  TransportFilters,
  StopFilters,
  StudentTransportFilters,
  StudentByTransportResponse,
  StudentsByStopResponse,
  StudentsByRouteResponse,
  ChangeStopRequest,
  ChangeStopResponse,
  StudentTransportHistoryResponse,
} from "./types.transport";

const BASE_URL = "/transport";

// ==================== Route APIs ====================

export const transportApi = {
  // Routes
  createRoute: (
    data: CreateRouteRequest,
  ): Promise<ApiResponse<TransportRoute>> =>
    api.post(`${BASE_URL}/routes`, data),

  getAllRoutes: (): Promise<ApiResponse<TransportRoute[]>> =>
    api.get(`${BASE_URL}/routes`),

  getRoutesBySession: (
    params: GetRoutesBySessionParams,
  ): Promise<ApiResponse<TransportRoute[]>> =>
    api.get(`${BASE_URL}/routes/session/${params.sessionId}`),

  getRouteById: (routeId: number): Promise<ApiResponse<TransportRoute>> =>
    api.get(`${BASE_URL}/routes/${routeId}`),

  updateRoute: (
    routeId: number,
    data: UpdateRouteRequest,
  ): Promise<ApiResponse<TransportRoute>> =>
    api.put(`${BASE_URL}/routes/${routeId}`, data),

  deleteRoute: (routeId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/routes/${routeId}`),

  // Stops
  createStop: (data: CreateStopRequest): Promise<ApiResponse<RouteStop>> =>
    api.post(`${BASE_URL}/stops`, data),

  bulkCreateStops: (
    data: BulkCreateStopsRequest,
  ): Promise<ApiResponse<BulkCreateStopsResponse>> =>
    api.post(`${BASE_URL}/stops/bulk`, data),

  getStopsByRoute: (
    params: GetStopsByRouteParams,
  ): Promise<ApiResponse<RouteStop[]>> =>
    api.get(`${BASE_URL}/stops/route/${params.routeId}`),

  updateStop: (
    stopId: number,
    data: UpdateStopRequest,
  ): Promise<ApiResponse<RouteStop>> =>
    api.put(`${BASE_URL}/stops/${stopId}`, data),

  deleteStop: (stopId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/stops/${stopId}`),

  // Student Transport
  // Get student by transport ID
  getStudentByTransport: (
    transportId: number,
  ): Promise<ApiResponse<StudentByTransportResponse>> =>
    api.get(`${BASE_URL}/student/${transportId}`),
  // Get students by route ID
  getStudentsByRoute: (
    routeId: number,
    isActive?: boolean,
  ): Promise<ApiResponse<StudentsByRouteResponse>> =>
    api.get(`${BASE_URL}/routes/${routeId}/students`, {
      params: isActive !== undefined ? { isActive } : {},
    }),
  // Get students by stop ID
  getStudentsByStop: (
    stopId: number,
    isActive?: boolean,
  ): Promise<ApiResponse<StudentsByStopResponse>> =>
    api.get(`${BASE_URL}/stops/${stopId}/students`, {
      params: isActive !== undefined ? { isActive } : {},
    }),
  assignStudent: (
    data: AssignStudentTransportRequest,
  ): Promise<ApiResponse<StudentTransport>> =>
    api.post(`${BASE_URL}/student/assign`, data),

  bulkAssignStudents: (
    data: BulkAssignStudentsRequest,
  ): Promise<ApiResponse<BulkAssignStudentsResponse>> =>
    api.post(`${BASE_URL}/student/bulk-assign`, data),

  getStudentTransport: (
    params: GetStudentTransportParams,
  ): Promise<ApiResponse<StudentTransportWithDetails[]>> =>
    api.get(`${BASE_URL}/student/${params.classStudentId}`),

  updateStudentTransport: (
    transportId: number,
    data: UpdateStudentTransportRequest,
  ): Promise<ApiResponse<StudentTransport>> =>
    api.put(`${BASE_URL}/student/${transportId}`, data),

  deactivateStudentTransport: (
    transportId: number,
    data: DeactivateStudentTransportRequest,
  ): Promise<ApiResponse<StudentTransport>> =>
    api.patch(`${BASE_URL}/student/${transportId}/deactivate`, data),

  // Disabled Months
  addDisabledMonth: (
    data: AddDisabledMonthRequest,
  ): Promise<ApiResponse<DisabledMonth>> =>
    api.post(`${BASE_URL}/disabled-months`, data),

  getDisabledMonths: (
    params: GetDisabledMonthsParams,
  ): Promise<ApiResponse<DisabledMonth[]>> =>
    api.get(`${BASE_URL}/disabled-months/route/${params.routeId}`),

  removeDisabledMonth: (disabledMonthId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/disabled-months/${disabledMonthId}`),

  // Change stop for student transport
  changeStop: (
    transportId: number,
    data: ChangeStopRequest,
  ): Promise<ApiResponse<ChangeStopResponse>> =>
    api.post(`${BASE_URL}/student/${transportId}/change-stop`, data),

  // Get student transport history
  getStudentTransportHistory: (
    classStudentId: number,
  ): Promise<ApiResponse<StudentTransportHistoryResponse>> =>
    api.get(`${BASE_URL}/student-history/${classStudentId}`),
};
