import { ArrowRightLeft, Edit, Eye, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetProductWiseReportQuery } from "../../../features/inventory/inventoryApi";
import { ProductWiseInventoryItem } from "../../../types/inventory";
import { StockAdjustmentModal } from "../components/StockAdjustmentModal";
import { StockTransferModal } from "../components/StockTransferModal";

interface TransferModalState {
  isOpen: boolean;
  productId: number;
  productName: string;
  warehouses: any[];
}

interface AdjustmentModalState {
  isOpen: boolean;
  inventoryId: number;
  productName: string;
  warehouseName: string;
  currentStock: number;
}

interface InventoryListProductWiseProps {
  productType: string;
}

export default function InventoryListProductWise({
  productType,
}: InventoryListProductWiseProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetProductWiseReportQuery({
    product_type: productType,
  });

  const inventory: ProductWiseInventoryItem[] = data?.data || [];
  const [activeDropdown, setActiveDropdown] = useState<string | number | null>(
    null
  );

  const [transferModal, setTransferModal] = useState<TransferModalState>({
    isOpen: false,
    productId: 0,
    productName: "",
    warehouses: [],
  });

  const [adjustmentModal, setAdjustmentModal] = useState<AdjustmentModalState>({
    isOpen: false,
    inventoryId: 0,
    productName: "",
    warehouseName: "",
    currentStock: 0,
  });

  if (isLoading) return <Loading message="Loading Inventory..." />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to load inventory</p>;

  return (
    <div>
      <div className="rounded-xl border bg-white mt-5">
        <div className="overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Product</TableCell>
                <TableCell isHeader>SKU</TableCell>
                <TableCell isHeader>Purchased</TableCell>
                <TableCell isHeader>Sold</TableCell>
                <TableCell isHeader>Remaining</TableCell>
                <TableCell isHeader>Purchase Value</TableCell>
                <TableCell isHeader>Sale Value</TableCell>
                <TableCell isHeader>Warehouses</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {inventory ? (
                inventory.map((item) => (
                  <TableRow key={item.product_id} className="border-b">
                    {/* Product Name */}
                    <TableCell className="align-middle ">
                      {item.product.name}
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="align-middle ">
                      {item.product.sku}
                    </TableCell>

                    {/* Purchased (Total Stock) */}
                    <TableCell className="align-middle ">
                      {item.total_stock}
                    </TableCell>

                    {/* Sold */}
                    <TableCell className="text-red-500 align-middle ">
                      {item.total_sold_quantity}
                    </TableCell>

                    {/* Remaining */}
                    <TableCell className="text-green-600 align-middle ">
                      {item.remaining_stock}
                    </TableCell>

                    {/* Purchase Value */}
                    <TableCell className="text-blue-600 align-middle ">
                      ৳{item.purchase_value.toLocaleString()}
                    </TableCell>

                    {/* Sale Value */}
                    <TableCell className="text-purple-600 align-middle ">
                      ৳{item.sale_value.toLocaleString()}
                    </TableCell>

                    {/* Warehouse Details */}
                    <TableCell className="table-body align-middle ">
                      {item.warehouses.map((warehouse, index) => (
                        <div
                          key={index}
                          className="text-sm mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <span className="font-medium">
                                {warehouse.warehouse.name}
                              </span>{" "}
                              —
                              <span className="text-blue-500">
                                {" "}
                                {warehouse.purchased_quantity} purchased
                              </span>
                              ,
                              <span className="text-red-500">
                                {" "}
                                {warehouse.sold_quantity} sold
                              </span>
                              ,
                              <span className="text-green-600">
                                {" "}
                                {warehouse.remaining_quantity} left
                              </span>
                              <br />
                              <span className="text-xs text-gray-500">
                                {warehouse.batch_no}
                              </span>
                            </div>
                            <div>
                              <IconButton
                                icon={Edit}
                                size={16}
                                color="gray"
                                tooltip="Adjust Stock"
                                onClick={() =>
                                  setAdjustmentModal({
                                    isOpen: true,
                                    inventoryId: warehouse.id,
                                    productName: item.product.name,
                                    warehouseName: warehouse.warehouse.name,
                                    currentStock: warehouse.remaining_quantity,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="table-body align-middle text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === item.product_id
                                ? null
                                : item.product_id
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>

                        <Dropdown
                          isOpen={activeDropdown === item.product_id}
                          onClose={() => setActiveDropdown(null)}
                          className="min-w-45"
                        >
                          {/* Transfer Stock */}
                          <DropdownItem
                            onClick={() => {
                              setTransferModal({
                                isOpen: true,
                                productId: item.product_id,
                                productName: item.product.name,
                                warehouses: item.warehouses,
                              });
                              setActiveDropdown(null);
                            }}
                            disabled={item.warehouses.length < 1}
                            className="flex items-center gap-2"
                          >
                            <ArrowRightLeft size={14} />
                            Transfer Stock
                          </DropdownItem>

                          {/* View Details */}
                          <DropdownItem
                            onClick={() => {
                              navigate(`/inventory/product/${item.product_id}`);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Eye size={14} />
                            View Details
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-6 text-center text-gray-500"
                  >
                    No inventory records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Stock Transfer Modal */}
      <StockTransferModal
        isOpen={transferModal.isOpen}
        onClose={() =>
          setTransferModal({
            isOpen: false,
            productId: 0,
            productName: "",
            warehouses: [],
          })
        }
        productId={transferModal.productId}
        productName={transferModal.productName}
        warehouses={transferModal.warehouses}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={adjustmentModal.isOpen}
        onClose={() =>
          setAdjustmentModal({
            isOpen: false,
            inventoryId: 0,
            productName: "",
            warehouseName: "",
            currentStock: 0,
          })
        }
        inventoryId={adjustmentModal.inventoryId}
        productName={adjustmentModal.productName}
        warehouseName={adjustmentModal.warehouseName}
        currentStock={adjustmentModal.currentStock}
      />
    </div>
  );
}
