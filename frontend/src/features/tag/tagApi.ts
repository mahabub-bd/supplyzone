import { ApiResponse,  } from "../../types";
import { Tag } from "../../types/product";
import { apiSlice } from "../apiSlice";

export interface UpdateTagPayload {
  id: number | string;
  body: Partial<Tag>;
}

export const tagApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<ApiResponse<Tag[]>, void>({
      query: () => ({ url: "/tag", method: "GET" }),
      providesTags: ["Tags"],
    }),
    getTagById: builder.query<ApiResponse<Tag>, number>({
      query: (id) => ({ url: `/tag/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Tags", id }],
    }),
    createTag: builder.mutation<ApiResponse<Tag>, Partial<Tag>>({
      query: (body) => ({ url: "/tag", method: "POST", body }),
      invalidatesTags: ["Tags"],
    }),
    updateTag: builder.mutation<ApiResponse<Tag>, UpdateTagPayload>({
      query: ({ id, body }) => ({ url: `/tag/${id}`, method: "PATCH", body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Tags", id }, "Tags"],
    }),
    deleteTag: builder.mutation<ApiResponse<{ message: string }>, number>({
      query: (id) => ({ url: `/tag/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tags"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTagsQuery,
  useGetTagByIdQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagApi;
