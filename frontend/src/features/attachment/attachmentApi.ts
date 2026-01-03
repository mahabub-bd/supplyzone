import { ApiResponse, Attachment } from "../../types";

import { apiSlice } from "../apiSlice";


export interface UploadResponse {
  url: string;
  fileName: string;
  mimeType: string;
  id: number;
}

export const attachmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL ATTACHMENTS
    getAttachments: builder.query<ApiResponse<Attachment[]>, void>({
      query: () => ({
        url: "/attachments",
        method: "GET",
      }),
      providesTags: ["Attachments"],
    }),

    // 🔹 GET ATTACHMENT BY ID
    getAttachmentById: builder.query<ApiResponse<Attachment>, number | string>({
      query: (id) => ({
        url: `/attachments/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Attachments", id }],
    }),

    // 🔹 UPLOAD SINGLE FILE
    uploadSingleAttachment: builder.mutation<
      ApiResponse<UploadResponse>,
      FormData
    >({
      query: (formData) => ({
        url: "/attachments/single",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Attachments"],
    }),

    // 🔹 UPLOAD MULTIPLE FILES
    uploadMultipleAttachments: builder.mutation<
      ApiResponse<UploadResponse[]>,
      FormData
    >({
      query: (formData) => ({
        url: "/attachments/multiple",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Attachments"],
    }),

    // 🔹 DELETE FILE BY ID
    deleteAttachment: builder.mutation<
      ApiResponse<{ message: string }>,
      number | string
    >({
      query: (id) => ({
        url: `/attachments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attachments"],
    }),
  }),
});

export const {
  useGetAttachmentsQuery,
  useGetAttachmentByIdQuery,
  useUploadSingleAttachmentMutation,
  useUploadMultipleAttachmentsMutation,
  useDeleteAttachmentMutation,
} = attachmentsApi;
