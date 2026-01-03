import { ApiResponse } from "../../types";
import { BackupResponseDto, CreateBackupDto, SchedulerStatus } from "../../types/backup";
import { apiSlice } from "../apiSlice";

// ============================================================================
// BACKUP API
// ============================================================================

export const backupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // MANUAL BACKUP ENDPOINTS
    // ========================================================================

    // Create manual backup
    createManualBackup: builder.mutation<ApiResponse<BackupResponseDto>, CreateBackupDto>({
      query: (body) => ({
        url: "/backup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Backup"],
    }),

    // Get all backups
    getAllBackups: builder.query<BackupResponseDto[], void>({
      query: () => ({
        url: "/backup",
        method: "GET",
      }),
      providesTags: ["Backup"],
      transformResponse: (response: { data: BackupResponseDto[] }) => response.data,
    }),

    // Get latest backup
    getLatestBackup: builder.query<ApiResponse<BackupResponseDto | null>, void>({
      query: () => ({
        url: "/backup/latest",
        method: "GET",
      }),
      providesTags: ["Backup"],
    }),

    // Get backup by ID
    getBackupById: builder.query<ApiResponse<BackupResponseDto>, number>({
      query: (id) => ({
        url: `/backup/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Backup", id }],
    }),

    // Delete backup record
    deleteBackupRecord: builder.mutation<void, number>({
      query: (id) => ({
        url: `/backup/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Backup"],
    }),

    // ========================================================================
    // SCHEDULER ENDPOINTS
    // ========================================================================

    // Trigger scheduled backup manually
    triggerScheduledBackup: builder.mutation<ApiResponse<BackupResponseDto>, void>({
      query: () => ({
        url: "/backup/schedule/trigger",
        method: "POST",
      }),
      invalidatesTags: ["Backup"],
    }),

    // Get scheduler status
    getSchedulerStatus: builder.query<SchedulerStatus, void>({
      query: () => ({
        url: "/backup/schedule/status",
        method: "GET",
      }),
      providesTags: ["BackupSchedule"],
    }),
  }),
});

// ============================================================================
// EXPORTED HOOKS
// ============================================================================

export const {
  // Manual backup hooks
  useCreateManualBackupMutation,
  useGetAllBackupsQuery,
  useGetLatestBackupQuery,
  useGetBackupByIdQuery,
  useDeleteBackupRecordMutation,

  // Scheduler hooks
  useTriggerScheduledBackupMutation,
  useGetSchedulerStatusQuery,
} = backupApi;
