import { ApiResponse } from "../../types";
import { Role } from "../../types/role";
import { apiSlice } from "../apiSlice";

export interface UpdateRolePayload {
  id: number | string;
  body: Partial<Role>;
}

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL ROLES
    getRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => ({
        url: "/roles",
        method: "GET",
      }),
      providesTags: ["Roles"],
    }),

    // GET ROLE BY ID
    getRoleById: builder.query<ApiResponse<Role>, string | number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Roles", id }],
    }),

    // CREATE ROLE
    createRole: builder.mutation<ApiResponse<Role>, Partial<Role>>({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roles"],
    }),

    // UPDATE ROLE
    updateRole: builder.mutation<ApiResponse<Role>, UpdateRolePayload>({
      query: ({ id, body }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Roles",
        { type: "Roles", id },
      ],
    }),

    // DELETE ROLE
    deleteRole: builder.mutation<ApiResponse<{ id: number }>, string | number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
