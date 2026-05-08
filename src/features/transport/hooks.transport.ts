import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transportApi } from "./api.transport";
import {
  CreateRouteRequest,
  UpdateRouteRequest,
  CreateStopRequest,
  UpdateStopRequest,
  BulkCreateStopsRequest,
  AssignStudentTransportRequest,
  UpdateStudentTransportRequest,
  DeactivateStudentTransportRequest,
  BulkAssignStudentsRequest,
  AddDisabledMonthRequest,
  TransportFilters,
  ChangeStopRequest,
} from "./types.transport";

// ==================== Query Keys ====================

export const transportKeys = {
  all: ["transport"] as const,
  routes: () => [...transportKeys.all, "routes"] as const,
  routesBySession: (sessionId: number) =>
    [...transportKeys.routes(), sessionId] as const,
  route: (id: number) => [...transportKeys.routes(), id] as const,
  stops: () => [...transportKeys.all, "stops"] as const,
  stopsByRoute: (routeId: number) =>
    [...transportKeys.stops(), routeId] as const,
  studentTransport: (classStudentId: number) =>
    [...transportKeys.all, "student", classStudentId] as const,
  disabledMonths: (routeId: number) =>
    [...transportKeys.all, "disabled-months", routeId] as const,
};

// ==================== Route Hooks ====================

export const useRoutes = () => {
  return useQuery({
    queryKey: transportKeys.routes(),
    queryFn: () => transportApi.getAllRoutes().then((res) => res.data),
  });
};

export const useRoutesBySession = (sessionId: number) => {
  return useQuery({
    queryKey: transportKeys.routesBySession(sessionId),
    queryFn: () =>
      transportApi.getRoutesBySession({ sessionId }).then((res) => res.data),
    enabled: !!sessionId,
  });
};

export const useRoute = (routeId: number) => {
  return useQuery({
    queryKey: transportKeys.route(routeId),
    queryFn: () => transportApi.getRouteById(routeId).then((res) => res.data),
    enabled: !!routeId,
  });
};
// Get student by transport ID
export const useStudentByTransport = (transportId?: number) => {
  return useQuery({
    queryKey: [...transportKeys.all, "student", transportId],
    queryFn: () =>
      transportApi.getStudentByTransport(transportId!).then((res) => res.data),
    enabled: !!transportId,
  });
};

// Get students by stop ID
export const useStudentsByStop = (stopId: number, isActive?: boolean) => {
  return useQuery({
    queryKey: [...transportKeys.all, "stop-students", stopId, isActive],
    queryFn: () =>
      transportApi.getStudentsByStop(stopId, isActive).then((res) => res.data),
    enabled: !!stopId,
  });
};
// Change stop mutation
export const useChangeStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transportId,
      data,
    }: {
      transportId: number;
      data: ChangeStopRequest;
    }) => transportApi.changeStop(transportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.all });
      queryClient.invalidateQueries({
        queryKey: [...transportKeys.all, "route-students"],
      });
      queryClient.invalidateQueries({
        queryKey: [...transportKeys.all, "student", variables.transportId],
      });
    },
  });
};
export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRouteRequest) => transportApi.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRouteRequest }) =>
      transportApi.updateRoute(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({
        queryKey: transportKeys.route(variables.id),
      });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => transportApi.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
};

// ==================== Stop Hooks ====================

export const useStopsByRoute = (routeId: number) => {
  return useQuery({
    queryKey: transportKeys.stopsByRoute(routeId),
    queryFn: () =>
      transportApi.getStopsByRoute({ routeId }).then((res) => res.data),
    enabled: !!routeId,
  });
};

export const useCreateStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStopRequest) => transportApi.createStop(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: transportKeys.stopsByRoute(data.routeId),
      });
    },
  });
};
// Get student transport history
export const useStudentTransportHistory = (classStudentId: number) => {
  return useQuery({
    queryKey: [...transportKeys.all, "student-history", classStudentId],
    queryFn: () =>
      transportApi
        .getStudentTransportHistory(classStudentId)
        .then((res) => res.data),
    enabled: !!classStudentId,
  });
};

export const useBulkCreateStops = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateStopsRequest) =>
      transportApi.bulkCreateStops(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: transportKeys.stopsByRoute(data.routeId),
      });
    },
  });
};

export const useUpdateStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStopRequest }) =>
      transportApi.updateStop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.stops() });
    },
  });
};

export const useDeleteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => transportApi.deleteStop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.stops() });
    },
  });
};

// ==================== Student Transport Hooks ====================
// Get students by route ID
export const useStudentsByRoute = (routeId: number, isActive?: boolean) => {
  return useQuery({
    queryKey: [...transportKeys.all, "route-students", routeId, isActive],
    queryFn: () =>
      transportApi
        .getStudentsByRoute(routeId, isActive)
        .then((res) => res.data),
    enabled: !!routeId,
  });
};
export const useStudentTransport = (classStudentId: number) => {
  return useQuery({
    queryKey: transportKeys.studentTransport(classStudentId),
    queryFn: () =>
      transportApi
        .getStudentTransport({ classStudentId })
        .then((res) => res.data),
    enabled: !!classStudentId,
  });
};

export const useAssignStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignStudentTransportRequest) =>
      transportApi.assignStudent(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: transportKeys.studentTransport(data.classStudentId),
      });
    },
  });
};

export const useBulkAssignStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAssignStudentsRequest) =>
      transportApi.bulkAssignStudents(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...transportKeys.all, "student"],
      });
    },
  });
};

export const useUpdateStudentTransport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateStudentTransportRequest;
    }) => transportApi.updateStudentTransport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...transportKeys.all, "student"],
      });
    },
  });
};

export const useDeactivateStudentTransport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: DeactivateStudentTransportRequest;
    }) => transportApi.deactivateStudentTransport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...transportKeys.all, "student"],
      });
    },
  });
};

// ==================== Disabled Month Hooks ====================

export const useDisabledMonths = (routeId: number) => {
  return useQuery({
    queryKey: transportKeys.disabledMonths(routeId),
    queryFn: () =>
      transportApi.getDisabledMonths({ routeId }).then((res) => res.data),
    enabled: !!routeId,
  });
};

export const useAddDisabledMonth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddDisabledMonthRequest) =>
      transportApi.addDisabledMonth(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: transportKeys.disabledMonths(data.routeId),
      });
    },
  });
};

export const useRemoveDisabledMonth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => transportApi.removeDisabledMonth(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...transportKeys.all, "disabled-months"],
      });
    },
  });
};
