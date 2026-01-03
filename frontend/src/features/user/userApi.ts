
import { ApiResponse, } from "../../types";
import { CreateUserPayload, UpdateUserPayload, User } from "../../types/user";
import { apiSlice } from "../apiSlice";
import { updateUser as updateAuthUser } from "../auth/authSlice";



export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE USER
    createUser: builder.mutation<ApiResponse<User>, CreateUserPayload>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    // GET ALL USERS
    getUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    // GET USER BY ID
    getUserById: builder.query<ApiResponse<User>, string | number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    // UPDATE USER
    updateUser: builder.mutation<ApiResponse<User>, UpdateUserPayload>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const updatedUser = data.data;

          // Get current auth state
          const state = getState() as any;
          const currentUser = state.auth.user;

          // If the updated user is the current logged-in user, update auth state
          if (currentUser && currentUser.id === updatedUser.id) {
            dispatch(updateAuthUser(updatedUser));
          }
        } catch (error) {
          console.error("Failed to sync user update with auth state:", error);
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        "Users",
        { type: "Users", id },
      ],
    }),

    // DELETE USER
    deleteUser: builder.mutation<ApiResponse<{ id: number }>, number | string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
