import { apiSlice } from "../apiSlice";

export const invoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoicePdf: builder.query<
      Blob,
      { type: "sale" | "purchase" | "quotation"; id: number }
    >({
      query: ({ type, id }) => ({
        url: `/invoice/${type}/${id}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
        cache: "no-cache",
      }),
      // Ensure each type/id combination is cached separately
      serializeQueryArgs: ({ queryArgs }) => `${queryArgs.type}-${queryArgs.id}`,
      // Force refetch on every call
      forceRefetch: () => true,
    }),
  }),
});

export const { useLazyGetInvoicePdfQuery } = invoiceApi;
