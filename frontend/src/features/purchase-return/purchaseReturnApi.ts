import { ApiResponse } from "../../types";
import {
  ApprovePurchaseReturnPayload,
  CreatePurchaseReturnPayload,
  ProcessPurchaseReturnPayload,
  PurchaseReturn,
  RefundPurchaseReturnPayload,
  UpdatePurchaseReturnPayload,
} from "../../types/purchase-return";
import { apiSlice } from "../apiSlice";

export const purchaseReturnApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 CREATE PURCHASE RETURN
    createPurchaseReturn: builder.mutation<
      ApiResponse<PurchaseReturn>,
      CreatePurchaseReturnPayload
    >({
      query: (body) => ({
        url: "/purchase-returns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseReturns", "Purchases"],
    }),

    // 🔹 GET ALL PURCHASE RETURNS
    getPurchaseReturns: builder.query<ApiResponse<PurchaseReturn[]>, void>({
      query: () => ({
        url: "/purchase-returns",
        method: "GET",
      }),
      providesTags: ["PurchaseReturns"],
    }),

    // 🔹 GET PURCHASE RETURN BY ID
    getPurchaseReturnById: builder.query<
      ApiResponse<PurchaseReturn>,
      string | number
    >({
      query: (id) => ({
        url: `/purchase-returns/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "PurchaseReturns", id }],
    }),

    // 🔹 UPDATE PURCHASE RETURN
    updatePurchaseReturn: builder.mutation<
      ApiResponse<PurchaseReturn>,
      { id: string | number; body: UpdatePurchaseReturnPayload }
    >({
      query: ({ id, body }) => ({
        url: `/purchase-returns/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "PurchaseReturns",
        { type: "PurchaseReturns", id },
      ],
    }),

    // 🔹 APPROVE PURCHASE RETURN
    approvePurchaseReturn: builder.mutation<
      ApiResponse<PurchaseReturn>,
      { id: string | number; body?: ApprovePurchaseReturnPayload }
    >({
      query: ({ id, body }) => ({
        url: `/purchase-returns/${id}/approve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "PurchaseReturns",
        { type: "PurchaseReturns", id },
      ],
    }),

    // 🔹 PROCESS PURCHASE RETURN
    processPurchaseReturn: builder.mutation<
      ApiResponse<{
        message: string;
        return_id: number;
        total_amount: number;
        supplier_account: string;
        inventory_account: string;
      }>,
      { id: string | number; body?: ProcessPurchaseReturnPayload }
    >({
      query: ({ id, body }) => ({
        url: `/purchase-returns/${id}/process`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PurchaseReturns", "Inventory", "Accounts"],
    }),

    // 🔹 CANCEL PURCHASE RETURN
    cancelPurchaseReturn: builder.mutation<
      ApiResponse<PurchaseReturn>,
      string | number
    >({
      query: (id) => ({
        url: `/purchase-returns/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        "PurchaseReturns",
        { type: "PurchaseReturns", id },
      ],
    }),

    // 🔹 REFUND PURCHASE RETURN
    refundPurchaseReturn: builder.mutation<
      ApiResponse<{
        message: string;
        return_id: number;
        refund_amount: number;
        debit_account: string;
        supplier_account: string;
        payment_method: string;
        reference: string;
      }>,
      { id: string | number; body: RefundPurchaseReturnPayload }
    >({
      query: ({ id, body }) => ({
        url: `/purchase-returns/${id}/refund`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PurchaseReturns", "Accounts"],
    }),
  }),
});

export const {
  useCreatePurchaseReturnMutation,
  useGetPurchaseReturnsQuery,
  useGetPurchaseReturnByIdQuery,
  useUpdatePurchaseReturnMutation,
  useApprovePurchaseReturnMutation,
  useProcessPurchaseReturnMutation,
  useCancelPurchaseReturnMutation,
  useRefundPurchaseReturnMutation,
} = purchaseReturnApi;
