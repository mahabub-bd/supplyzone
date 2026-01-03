
import { ApiResponse } from "../../types";
import { Permission } from "../../types/role";
import { apiSlice } from "../apiSlice";



export interface CreatePermissionPayload {
  key: string;
  description: string;
}

export interface AssignPermissionsPayload {
  roleName: string;
  permissionKeys: string[];
}

export const permissionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<ApiResponse<Permission[]>, void>({
      query: () => ({
        url: "/rbac/permission",
        method: "GET",
      }),
      providesTags: ["Permissions"],
    }),

    createPermission: builder.mutation<
      ApiResponse<Permission>,
      CreatePermissionPayload
    >({
      query: (body) => ({
        url: "/rbac/permission",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Permissions"],
    }),
    updatePermission: builder.mutation<
      ApiResponse<Permission>,
      { id: number | string; body: Partial<Permission> }
    >({
      query: ({ id, body }) => ({
        url: `/rbac/permission/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Permissions"],
    }),

    // DELETE PERMISSION
    deletePermission: builder.mutation<ApiResponse<{ id: number }>, number>({
      query: (id) => ({
        url: `/rbac/permission/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Permissions"],
    }),
    getRolePermissions: builder.query<ApiResponse<Permission[]>, string>({
      query: (roleName) => ({
        url: `/rbac/role/${roleName}/permissions`,
        method: "GET",
      }),
      providesTags: (_result, _error, roleName) => [
        { type: "RolePermissions", id: roleName },
      ],
    }),

    assignPermissionsToRole: builder.mutation<
      ApiResponse<any>,
      AssignPermissionsPayload
    >({
      query: ({ roleName, permissionKeys }) => ({
        url: `/rbac/role/${roleName}/assign`,
        method: "POST",
        body: { permissionKeys },
      }),
      invalidatesTags: (_result, _error, { roleName }) => [
        { type: "RolePermissions", id: roleName },
        "Roles",
      ],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  useUpdatePermissionMutation,
  useGetRolePermissionsQuery,
  useAssignPermissionsToRoleMutation,
} = permissionsApi;
