import { jwtDecode } from "jwt-decode";

import { LoginRequest, LoginResponse } from "../../types/user";
import { apiSlice } from "../apiSlice";
import { setCredentials } from "./authSlice";
import { ApiResponse } from "../../types";
interface TokenPayload {
  exp: number;
}
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const loginData = data.data;
          const decoded = jwtDecode<TokenPayload>(loginData.token);
          dispatch(
            setCredentials({
              token: loginData.token,
              user: loginData.user,
              permissions: [],
              expiresAt: decoded.exp,
            })
          );

          const roleName = loginData.user?.roles?.[0]?.name;
          if (roleName) {
            const permissionResult = await dispatch(
              authApi.endpoints.getRolePermissions.initiate(roleName)
            ).unwrap();

            dispatch(
              setCredentials({
                token: loginData.token,
                user: loginData.user,
                permissions: permissionResult.data.map((p) => p.key),
                expiresAt: decoded.exp,
              })
            );
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    getRolePermissions: builder.query<
      ApiResponse<{ id: number; key: string; description: string }[]>,
      string
    >({
      query: (roleName) => ({
        url: `/rbac/role/${roleName}/permissions`,
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useGetRolePermissionsQuery } = authApi;
