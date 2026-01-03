import { ApiResponse } from "../../types";
import {
  ReceiptPreviewData,
  SettingsData,
  SettingsUpdateRequest,
} from "../../types/settings";
import { apiSlice } from "../apiSlice";

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all settings
    getSettings: builder.query<ApiResponse<SettingsData>, void>({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    // Update settings
    updateSettings: builder.mutation<
      ApiResponse<SettingsData>,
      SettingsUpdateRequest
    >({
      query: (data) => ({
        url: "/settings",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // Upload logo for settings
    uploadSettingsLogo: builder.mutation<
      ApiResponse<any>,
      { attachment_id: number }
    >({
      query: ({ attachment_id }) => ({
        url: `/settings/logo/${attachment_id}`,
        method: "POST",
        body: {}, // Empty body as mentioned
      }),
      invalidatesTags: ["Settings"],
    }),

    // Get receipt preview settings
    getReceiptPreview: builder.query<ApiResponse<ReceiptPreviewData>, void>({
      query: () => ({
        url: "/settings/receipt/preview",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    // Reset all settings
    resetSettings: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: "/settings/reset",
        method: "POST",
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useUploadSettingsLogoMutation,
  useGetReceiptPreviewQuery,
  useResetSettingsMutation,
} = settingsApi;
