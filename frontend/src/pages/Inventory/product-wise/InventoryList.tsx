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

export default function InventoryListProductWise() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetProductWiseReportQuery({
    product_type: "finished_good,resale",
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
    <div className="p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableCell isHeader className="font-semibold">
                  Product
                </TableCell>
                <TableCell isHeader className="font-semibold">
                  SKU
                </TableCell>
                <TableCell isHeader className="font-semibold text-center">
                  Purchased
                </TableCell>
                <TableCell isHeader className="font-semibold text-center">
                  Sold
                </TableCell>
                <TableCell isHeader className="font-semibold text-center">
                  Remaining
                </TableCell>
                <TableCell isHeader className="font-semibold text-right">
                  Purchase Value
                </TableCell>
                <TableCell isHeader className="font-semibold text-right">
                  Sale Value
                </TableCell>
                <TableCell isHeader className="font-semibold">
                  Warehouses
                </TableCell>
                <TableCell isHeader className="font-semibold text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <TableRow key={item.product_id} className="hover:bg-gray-50">
                    {/* Product Name */}
                    <TableCell className="align-top font-medium">
                      {item.product.name}
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="align-top">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.product.sku}
                      </span>
                    </TableCell>

                    {/* Purchased (Total Stock) */}
                    <TableCell className="align-top text-center">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.total_stock}
                      </span>
                    </TableCell>

                    {/* Sold */}
                    <TableCell className="align-top text-center">
                      <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.total_sold_quantity}
                      </span>
                    </TableCell>

                    {/* Remaining */}
                    <TableCell className="align-top text-center">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.remaining_stock}
                      </span>
                    </TableCell>

                    {/* Purchase Value */}
                    <TableCell className="align-top text-right font-medium">
                      ৳{item.purchase_value.toLocaleString()}
                    </TableCell>

                    {/* Sale Value */}
                    <TableCell className="align-top text-right font-medium">
                      ৳{item.sale_value.toLocaleString()}
                    </TableCell>

                    {/* Warehouse Details */}
                    <TableCell className="align-top">
                      <div className="space-y-2">
                        {item.warehouses.map((warehouse, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 mb-1">
                                  {warehouse.warehouse.name}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs mb-1">
                                  <span className="text-blue-600">
                                    Purchased:{" "}
                                    <span className="font-semibold">
                                      {warehouse.purchased_quantity}
                                    </span>
                                  </span>
                                  <span className="text-red-600">
                                    Sold:{" "}
                                    <span className="font-semibold">
                                      {warehouse.sold_quantity}
                                    </span>
                                  </span>
                                  <span className="text-green-600">
                                    Left:{" "}
                                    <span className="font-semibold">
                                      {warehouse.remaining_quantity}
                                    </span>
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">
                                    {warehouse.batch_no}
                                  </span>
                                </div>
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
                                      currentStock:
                                        warehouse.remaining_quantity,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="align-top text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === item.product_id
                                ? null
                                : item.product_id
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                    className="py-8 text-center text-gray-500"
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
