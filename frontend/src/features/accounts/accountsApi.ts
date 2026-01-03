import { ApiResponse } from "../../types";
import { Account, JournalEntry } from "../../types/accounts";
import { apiSlice } from "../apiSlice";
interface GetAccountsQueryArg {
  type?: string;
  isCash?: boolean;
  isBank?: boolean;
}

export const accountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 Get all account balances
    getAccountBalances: builder.query<ApiResponse<Account[]>, string | void>({
      query: (date) => `/accounts/balances${date ? `?date=${date}` : ""}`,
      providesTags: ["Accounts"],
    }),

    // 🔹 Get balance for account code
    getAccountBalanceByCode: builder.query<
      ApiResponse<Account>,
      { code: string; date?: string }
    >({
      query: ({ code, date }) =>
        `/accounts/balance/${code}${date ? `?date=${date}` : ""}`,
      providesTags: ["Accounts"],
    }),



    getAccounts: builder.query<any, GetAccountsQueryArg | void>({
      query: (params) => {
        let url = "/accounts";

        if (params) {
          const queryParams = new URLSearchParams();

          if (params.type) queryParams.append("type", params.type);
          if (params.isCash !== undefined)
            queryParams.append("isCash", String(params.isCash));
          if (params.isBank !== undefined)
            queryParams.append("isBank", String(params.isBank));

          const queryString = queryParams.toString();
          if (queryString) url += `?${queryString}`;
        }

        return { url, method: "GET" };
      },
      providesTags: ["Accounts"],
    }),

    // 🔹 Get single account by ID
    getAccountById: builder.query<ApiResponse<Account>, number>({
      query: (id) => `/accounts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Accounts", id }],
    }),

    // 🔹 Add cash to ASSET.CASH
    addCash: builder.mutation<
      ApiResponse<any>,
      { amount: number; narration: string }
    >({
      query: (payload) => ({
        url: `/accounts/add-cash`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Accounts"],
    }),

    addBankBalance: builder.mutation<
      ApiResponse<any>,
      { bankAccountCode: string; amount: number; narration: string }
    >({
      query: (payload) => ({
        url: `/accounts/add-bank-balance`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Accounts"],
    }),

    // 🔹 Fund transfer (bank ⇆ cash)
    fundTransfer: builder.mutation<
      ApiResponse<any>,
      {
        fromAccountCode: string;
        toAccountCode: string;
        amount: number;
        narration: string;
      }
    >({
      query: (payload) => ({
        url: `/accounts/fund-transfer`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Accounts"],
    }),
    // 🔹 Get account journal
    getAccountJournal: builder.query<ApiResponse<JournalEntry[]>, { accountCode?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        if (!params) return "/accounts/reports/journal";

        const { accountCode, page = 1, limit = 10 } = params;
        const queryParams = new URLSearchParams();

        if (accountCode) queryParams.append("accountCode", accountCode);
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        const queryString = queryParams.toString();
        return `/accounts/reports/journal${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Accounts"],
    }),
    getTrialBalance: builder.query<ApiResponse<any>, string | void>({
      query: (date) =>
        `/accounts/reports/trial-balance${date ? `?date=${date}` : ""}`,
      providesTags: ["Accounts"],
    }),

    // 🔹 Balance sheet report
    getBalanceSheet: builder.query<ApiResponse<any>, string | void>({
      query: (date) =>
        `/accounts/reports/balance-sheet${date ? `?date=${date}` : ""}`,
      providesTags: ["Accounts"],
    }),

    // 🔹 Profit & loss report
    getProfitLoss: builder.query<ApiResponse<any>, string | void>({
      query: (date) =>
        `/accounts/reports/profit-loss${date ? `?date=${date}` : ""}`,
      providesTags: ["Accounts"],
    }),

    getSupplierLedger: builder.query<
      ApiResponse<any>,
      { supplierId: number; date?: string; page?: number; limit?: number }
    >({
      query: ({ supplierId, date, page = 1, limit = 20 }) => {
        const queryParams = new URLSearchParams();
        if (date) queryParams.append("date", date);
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        const queryString = queryParams.toString();
        return `/accounts/ledger/supplier/${supplierId}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Accounts"],
    }),
    getCustomerLedger: builder.query<
      ApiResponse<any>,
      { customerId: number; date?: string; page?: number; limit?: number }
    >({
      query: ({ customerId, date, page = 1, limit = 20 }) => {
        const queryParams = new URLSearchParams();
        if (date) queryParams.append("date", date);
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        const queryString = queryParams.toString();
        return `/accounts/ledger/customer/${customerId}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Accounts"],
    }),
    getCashBankLedger: builder.query<
      ApiResponse<any>,
      { code: string; date?: string; page?: number; limit?: number }
    >({
      query: ({ code, date, page = 1, limit = 20 }) => {
        const queryParams = new URLSearchParams();

        if (date) queryParams.append("date", date);
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        const queryString = queryParams.toString();
        return `/accounts/ledger/cash-bank/${code}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Accounts"],
    }),


  }),
});

export const {
  useGetAccountBalancesQuery,
  useGetAccountByIdQuery,
  useGetAccountBalanceByCodeQuery,
  useGetAccountJournalQuery,
  useGetAccountsQuery,
  useAddBankBalanceMutation,
  useAddCashMutation,
  useFundTransferMutation,
  useGetTrialBalanceQuery,
  useGetBalanceSheetQuery,
  useGetProfitLossQuery,
  useGetSupplierLedgerQuery,
  useGetCustomerLedgerQuery,
  useGetCashBankLedgerQuery,

} = accountsApi;
