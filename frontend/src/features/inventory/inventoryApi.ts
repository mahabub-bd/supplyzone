import { ApiResponse } from "../../types/index.ts";
import {
  GetInventoryJournalParams,
  GetStockMovementsParams,
  ProductInventory,
  InventoryItem,
  InventoryJournalEntry,
  StockMovement,
} from "../../types/inventory.ts";
import { apiSlice } from "../apiSlice";
import {
  generateListTags,
  generateItemTag,
  invalidateItemAndList,
} from "../../utlis";

// ============================================================================
// API PAYLOAD TYPES
// ============================================================================

/**
 * Payload for creating a new inventory record
 */
export interface CreateInventoryPayload {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  unit_cost?: string | number;
  notes?: string;
}

/**
 * Payload for adjusting inventory quantity
 */
export interface AdjustInventoryPayload {
  id: number | string;
  body: {
    quantity: number;
    note?: string;
  };
}

/**
 * Payload for transferring inventory between warehouses
 */
export interface TransferPayload {
  product_id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  quantity: number;
  note?: string;
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

/**
 * Query parameters for warehouse-wise inventory report
 */
export interface WarehouseReportParams {
  warehouse_id?: number;
  search?: string;
  product_type?: string;
}

/**
 * Query parameters for product-wise inventory report
 */
export interface ProductReportParams {
  search?: string;
  product_type?: string;
}
export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 Get All Inventory
    getInventory: builder.query<ApiResponse<ProductInventory[]>, void>({
      query: () => ({
        url: "/inventory",
        method: "GET",
      }),
      providesTags: (result) => generateListTags(result, "Inventory"),
    }),

    // 🔹 Get Inventory by Product ID
    getInventoryByProductId: builder.query<
      ApiResponse<InventoryItem>,
      number | string
    >({
      query: (productId) => ({
        url: `/inventory/product/${productId}`,
        method: "GET",
      }),
      providesTags: (_res, _err, productId) =>
        generateItemTag("Inventory", productId),
    }),

    // 🔹 Create New Inventory Record
    createInventory: builder.mutation<
      ApiResponse<ProductInventory>,
      CreateInventoryPayload
    >({
      query: (body) => ({
        url: "/inventory",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),

    // 🔹 Adjust Inventory
    adjustInventory: builder.mutation<
      ApiResponse<ProductInventory>,
      AdjustInventoryPayload
    >({
      query: ({ id, body }) => ({
        url: `/inventory/${id}/adjust`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) =>
        invalidateItemAndList("Inventory", id),
    }),

    // 🔹 Transfer Inventory between warehouses
    transferInventory: builder.mutation<ApiResponse<any>, TransferPayload>({
      query: (body) => ({
        url: "/inventory/transfer",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),

    // 🔹 PRODUCT-WISE REPORT
    getProductWiseReport: builder.query<
      ApiResponse<any>,
      ProductReportParams
    >({
      query: ({ search, product_type }) => ({
        url: "/inventory/report/product-wise",
        method: "GET",
        params: {
          search,
          product_type,
        },
      }),
      providesTags: ["Inventory"],
    }),

    // 🔹 WAREHOUSE-WISE REPORT
    getWarehouseWiseReport: builder.query<
      ApiResponse<any>,
      WarehouseReportParams
    >({
      query: ({ warehouse_id, search, product_type }) => ({
        url: "/inventory/report/warehouse-wise",
        method: "GET",
        params: {
          warehouse_id,
          search,
          product_type,
        },
      }),
      providesTags: ["Inventory"],
    }),

    // 🔹 GET STOCK MOVEMENTS
    getStockMovements: builder.query<
      ApiResponse<StockMovement[]>,
      GetStockMovementsParams | void
    >({
      query: (params) => ({
        url: "/inventory/movements",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Inventory"],
    }),

    // 🔹 GET INVENTORY JOURNAL
    getInventoryJournal: builder.query<
      ApiResponse<InventoryJournalEntry[]>,
      GetInventoryJournalParams | void
    >({
      query: (params) => ({
        url: "/inventory/journal",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Inventory"],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryByProductIdQuery,
  useCreateInventoryMutation,
  useAdjustInventoryMutation,
  useTransferInventoryMutation,
  useGetProductWiseReportQuery,
  useGetWarehouseWiseReportQuery,
  useGetStockMovementsQuery,
  useGetInventoryJournalQuery,
} = inventoryApi;
