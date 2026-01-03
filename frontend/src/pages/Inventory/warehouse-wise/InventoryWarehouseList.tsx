import Loading from "../../../components/common/Loading";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetWarehouseWiseReportQuery } from "../../../features/inventory/inventoryApi";

export default function InventoryWarehouseList() {
  const { data, isLoading, isError } = useGetWarehouseWiseReportQuery({});
  const warehouses = data?.data || [];

  if (isLoading) return <Loading />;

  if (isError)
    return (
      <div className="p-8 text-center text-red-600">
        Failed to load inventory
      </div>
    );

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableCell className="font-semibold">Warehouse</TableCell>
              <TableCell className="font-semibold">Location</TableCell>
              <TableCell className="font-semibold text-center">
                Purchased
              </TableCell>
              <TableCell className="font-semibold text-center">Sold</TableCell>
              <TableCell className="font-semibold text-center">
                Remaining
              </TableCell>
              <TableCell className="font-semibold text-right">
                Purchase Value
              </TableCell>
              <TableCell className="font-semibold text-right">
                Sale Value
              </TableCell>
              <TableCell className="font-semibold">Products</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length > 0 ? (
              warehouses.map((item: any, index: number) => (
                <>
                  {/* Warehouse Row */}
                  <TableRow
                    key={`warehouse-${index}`}
                    className="hover:bg-gray-50 border-b-2 border-gray-200"
                  >
                    <TableCell className="font-medium">
                      {item.warehouse.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {item.warehouse.location}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.total_stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.total_sold_quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.remaining_stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ৳{item.purchase_value?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ৳{item.sale_value?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {item.products.length} product
                      {item.products.length !== 1 ? "s" : ""}
                    </TableCell>
                  </TableRow>

                  {/* Product Cards Row */}

                  <TableRow key={`products-${index}`}>
                    <TableCell colSpan={8} className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {item.products.map((p: any, pIndex: number) => (
                          <div
                            key={pIndex}
                            className="bg-white border border-gray-200 rounded-md hover:shadow-sm transition"
                          >
                            {/* Header */}
                            <div className="flex gap-2 p-2">
                              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                                {p.product.images?.length ? (
                                  <img
                                    src={p.product.images[0].url}
                                    alt={p.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                    No Img
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {p.product.name}
                                </p>

                                {p.product.product_type && (
                                  <Badge
                                    variant="light"
                                    size="sm"
                                    className="mt-0.5"
                                    color={
                                      p.product.product_type === "resale"
                                        ? "primary"
                                        : "warning"
                                    }
                                  >
                                    {p.product.product_type}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Meta */}
                            <div className="px-2 pb-2 space-y-1 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-gray-500">SKU</span>
                                <span className="font-mono text-gray-700">
                                  {p.product.sku}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">Batch</span>
                                <span className="font-mono text-gray-700 truncate max-w-30">
                                  {p.batch_no}
                                </span>
                              </div>

                              {/* Quantities */}
                              <div className="flex justify-between border-t pt-1 mt-1">
                                <span className="text-blue-600">
                                  Purchase: <b>{p.purchased_quantity}</b>
                                </span>
                                <span className="text-red-600">
                                  Sold: <b>{p.sold_quantity}</b>
                                </span>
                                <span className="text-green-600">
                                  Remaining: <b>{p.remaining_quantity}</b>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No warehouse inventory found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
