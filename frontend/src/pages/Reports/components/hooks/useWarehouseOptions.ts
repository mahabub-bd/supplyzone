import { warehouseApi } from "../../../../features/warehouse/warehouseApi";

export function useWarehouseOptions() {
  const { data: warehousesData } = warehouseApi.useGetWarehousesQuery();
  const warehouses = warehousesData?.data || [];

  return [
    { value: "", label: "All Warehouses" },
    ...warehouses.map((warehouse: any) => ({
      value: warehouse.id.toString(),
      label: warehouse.name,
    })),
  ];
}
