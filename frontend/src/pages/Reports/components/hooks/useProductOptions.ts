import { productApi } from "../../../../features/product/productApi";

export function useProductOptions() {
  const { data: productsData } = productApi.useGetProductsQuery({ page: 1, limit: 1000 });
  const products = productsData?.data || [];

  return [
    { value: "", label: "All Products" },
    ...products.map((product) => ({
      value: product.id.toString(),
      label: product.name,
    })),
  ];
}
