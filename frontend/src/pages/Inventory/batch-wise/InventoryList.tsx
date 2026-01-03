import Loading from "../../../components/common/Loading";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetInventoryQuery } from "../../../features/inventory/inventoryApi";

export default function InventoryListBatchWise() {
  const { data, isLoading, isError } = useGetInventoryQuery();

  const inventory = data?.data || [];

  if (isLoading) return <Loading message="Loading Inventory..." />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to load inventory</p>;

  return (
    <div>
      <div className="rounded-xl border bg-white mt-5">
        <div className="overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader className="border-b bg-gray-50">
              <TableRow>
                <TableCell isHeader className="table-header">
                  Product
                </TableCell>
                <TableCell isHeader className="table-header">
                  Batch No
                </TableCell>
                <TableCell isHeader className="table-header">
                  Warehouse
                </TableCell>
                <TableCell isHeader className="table-header">
                  Qty
                </TableCell>
                <TableCell isHeader className="table-header">
                  Sold
                </TableCell>
                <TableCell isHeader className="table-header">
                  Remaining
                </TableCell>
                <TableCell className="table-header">Purchase Value</TableCell>
                <TableCell className="table-header">Sale Value</TableCell>
                <TableCell className="table-header">Potential Profit</TableCell>
                <TableCell isHeader className="table-header">
                  Supplier
                </TableCell>
              </TableRow>
            </TableHeader>

            <tbody>
              {inventory ? (
                inventory.map((item: any) => (
                  <TableRow key={item.id} className="border-b">
                    <TableCell className="table-body">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          SKU: {item.product.sku}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="table-body">
                      {item.batch_no}
                    </TableCell>

                    <TableCell className="table-body">
                      {item.warehouse.name}
                    </TableCell>

                    <TableCell className="table-body">
                      {item.quantity}
                    </TableCell>

                    <TableCell className="table-body">
                      {item.sold_quantity}
                    </TableCell>

                    <TableCell className="table-body font-semibold">
                      {item.quantity - item.sold_quantity}
                    </TableCell>

                    <TableCell className="table-body">
                      {item.purchase_value?.toLocaleString() || "0"}
                    </TableCell>

                    <TableCell className="table-body">
                      {item.sale_value?.toLocaleString() || "0"}
                    </TableCell>

                    <TableCell className="table-body font-semibold text-green-600">
                      {item.potential_profit?.toLocaleString() || "0"}
                    </TableCell>

                    <TableCell className="table-body">
                      {item.supplier}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-6 text-center text-gray-500 dark:text-gray-300"
                  >
                    No inventory records found
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
