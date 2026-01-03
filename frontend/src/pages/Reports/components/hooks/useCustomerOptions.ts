import { customersApi } from "../../../../features/customer/customerApi";

export function useCustomerOptions() {
  const { data: customersData } = customersApi.useGetCustomersQuery({ page: 1, limit: 1000 });
  const customers = customersData?.data || [];

  return [
    { value: "", label: "All Customers" },
    ...customers.map((customer: any) => ({
      value: customer.id.toString(),
      label: customer.name,
    })),
  ];
}
