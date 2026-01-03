import { ApiResponse } from "../../types";
import { Branch, UpdateBranchPayload } from "../../types/branch";
import { apiSlice } from "../apiSlice";

// For Branch Update


export const branchesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // 🔹 GET ALL BRANCHES
        getBranches: builder.query<ApiResponse<Branch[]>, void>({
            query: () => ({
                url: "/branches",
                method: "GET",
            }),
            providesTags: ["Branches"],
        }),

        // 🔹 GET BRANCH BY ID
        getBranchById: builder.query<ApiResponse<Branch>, string | number>({
            query: (id) => ({
                url: `/branches/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Branches", id }],
        }),

        // 🔹 CREATE BRANCH
        createBranch: builder.mutation<ApiResponse<Branch>, Partial<Branch>>({
            query: (body) => ({
                url: "/branches",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Branches"],
        }),

        // 🔹 UPDATE BRANCH
        updateBranch: builder.mutation<ApiResponse<Branch>, UpdateBranchPayload>({
            query: ({ id, body }) => ({
                url: `/branches/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                "Branches",
                { type: "Branches", id },
            ],
        }),

        // 🔹 DELETE BRANCH
        deleteBranch: builder.mutation<ApiResponse<{ message: string }>, string | number>({
            query: (id) => ({
                url: `/branches/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Branches"],
        }),
    }),
});

export const {
    useGetBranchesQuery,
    useGetBranchByIdQuery,
    useCreateBranchMutation,
    useUpdateBranchMutation,
    useDeleteBranchMutation,
} = branchesApi;