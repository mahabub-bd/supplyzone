import { suppliersApi } from "../../../../features/suppliers/suppliersApi";

export function useSupplierOptions() {
  const { data: suppliersData } = suppliersApi.useGetSuppliersQuery(undefined);
  const suppliers = suppliersData?.data || [];

  return [
    { value: "", label: "All Suppliers" },
    ...suppliers.map((supplier) => ({
      value: supplier.id.toString(),
      label: supplier.name,
    })),
  ];
}
