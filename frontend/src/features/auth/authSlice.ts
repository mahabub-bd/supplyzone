import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  expiresAt: number | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  permissions: [],
  expiresAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
        permissions: string[];
        expiresAt: number;
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.permissions = action.payload.permissions;
      state.expiresAt = action.payload.expiresAt;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.permissions = [];
      state.expiresAt = null;
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
