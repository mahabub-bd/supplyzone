import { ApiResponse } from "../../types";
import {
  Purchase,
  PurchasePaymentPayload,
  PurchaseResponseData,
  ReceivePurchasePayload,
  UpdatePurchasePayload,
  UpdatePurchaseStatusPayload,
} from "../../types/purchase";
import { apiSlice } from "../apiSlice";

export const purchasesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPurchase: builder.mutation({
      query: (body) => ({
        url: "/purchase",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Purchases"],
    }),

    purchasePayment: builder.mutation<
      ApiResponse<Purchase>,
      PurchasePaymentPayload
    >({
      query: ({ id, body }) => ({
        url: `/purchase/${id}/payment`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Purchases",
        { type: "Purchases", id },
      ],
    }),

    // 🔹 UPDATE PURCHASE
    updatePurchase: builder.mutation<
      ApiResponse<Purchase>,
      UpdatePurchasePayload
    >({
      query: ({ id, body }) => ({
        url: `/purchase/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Purchases",
        { type: "Purchases", id },
      ],
    }),

    // 🔹 UPDATE PURCHASE STATUS
    updatePurchaseStatus: builder.mutation<
      ApiResponse<Purchase>,
      UpdatePurchaseStatusPayload
    >({
      query: ({ id, body }) => ({
        url: `/purchase/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Purchases",
        { type: "Purchases", id },
      ],
    }),

    // 🔹 GET ALL PURCHASES
    getPurchases: builder.query<ApiResponse<PurchaseResponseData>, void>({
      query: () => ({
        url: "/purchase",
        method: "GET",
      }),
      providesTags: ["Purchases"],
    }),

    // 🔹 GET PURCHASE BY ID
    getPurchaseById: builder.query<ApiResponse<Purchase>, string | number>({
      query: (id) => ({
        url: `/purchase/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Purchases", id }],
    }),

    // 🔹 RECEIVE PURCHASE ITEMS
    receivePurchase: builder.mutation<
      ApiResponse<Purchase>,
      ReceivePurchasePayload
    >({
      query: ({ id, body }) => ({
        url: `/purchase/${id}/receive`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Purchases",
        { type: "Purchases", id },
        "Inventory",
      ],
    }),
  }),
});

export const {
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useReceivePurchaseMutation,
  usePurchasePaymentMutation,
  useUpdatePurchaseStatusMutation,
} = purchasesApi;
