import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { announcementApi } from "./api.announcement";
import {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementFilters,
  UserAnnouncementFilters,
} from "./types.announcement";

// ==================== Query Keys ====================

export const announcementKeys = {
  all: ["announcements"] as const,
  lists: () => [...announcementKeys.all, "list"] as const,
  list: (filters?: AnnouncementFilters) =>
    [...announcementKeys.lists(), filters] as const,
  userLists: () => [...announcementKeys.all, "user-list"] as const,
  userList: (userId: number, filters?: UserAnnouncementFilters) =>
    [...announcementKeys.userLists(), userId, filters] as const,
  details: () => [...announcementKeys.all, "detail"] as const,
  detail: (id: number) => [...announcementKeys.details(), id] as const,
};

// ==================== Admin Query Hooks ====================

export const useAnnouncements = (filters?: AnnouncementFilters) => {
  return useQuery({
    queryKey: announcementKeys.list(filters),
    queryFn: () => announcementApi.getAll(filters).then((res) => res.data),
  });
};

export const useAnnouncement = (announcementId: number) => {
  return useQuery({
    queryKey: announcementKeys.detail(announcementId),
    queryFn: () =>
      announcementApi.getById(announcementId).then((res) => res.data),
    enabled: !!announcementId,
  });
};

// ==================== User Query Hooks ====================

export const useUserAnnouncements = (
  userId: number,
  filters?: UserAnnouncementFilters,
) => {
  return useQuery({
    queryKey: announcementKeys.userList(userId, filters),
    queryFn: () =>
      announcementApi
        .getUserAnnouncements(userId, filters)
        .then((res) => res.data),
    enabled: !!userId,
  });
};

export const useInfiniteUserAnnouncements = (
  userId: number,
  filters?: UserAnnouncementFilters,
) => {
  return useInfiniteQuery({
    queryKey: announcementKeys.userList(userId, filters),
    queryFn: ({ pageParam = 0 }) =>
      announcementApi.getUserAnnouncements(userId, {
        ...filters,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      const { offset, limit, total } = lastPage.pagination;
      const nextOffset = offset + limit;
      return nextOffset < total ? nextOffset : undefined;
    },
    initialPageParam: 0,
    enabled: !!userId,
  });
};

// ==================== Mutation Hooks ====================

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) =>
      announcementApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAnnouncementRequest;
    }) => announcementApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: announcementKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => announcementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
};

export const useMarkAnnouncementRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      announcementId,
      userId,
    }: {
      announcementId: number;
      userId: number;
    }) => announcementApi.markAsRead(announcementId, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: announcementKeys.userList(userId),
      });
    },
  });
};

// ==================== Combined Hook for Announcements with Read Status ====================

export const useAnnouncementsWithReadStatus = (
  userId: number,
  filters?: UserAnnouncementFilters,
) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUserAnnouncements(userId, filters);

  const announcements = data?.pages.flatMap((page) => page.data) || [];
  const total = data?.pages[0]?.pagination.total || 0;

  // Mark announcements as read when viewed
  const markAsRead = useMarkAnnouncementRead();

  const markMultipleAsRead = async (announcementIds: number[]) => {
    for (const id of announcementIds) {
      await markAsRead.mutateAsync({ announcementId: id, userId });
    }
  };

  return {
    announcements,
    total,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead: (announcementId: number) =>
      markAsRead.mutate({ announcementId, userId }),
    markMultipleAsRead,
    isMarkingRead: markAsRead.isPending,
  };
};
