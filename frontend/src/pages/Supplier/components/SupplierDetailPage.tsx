import { BookOpen, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetSupplierByIdQuery } from "../../../features/suppliers/suppliersApi";
import { useHasPermission } from "../../../hooks/useHasPermission";

import { Purchase } from "../../../types/purchase";
import {
  DetailCard,
  Info,
  MetricsCard,
  TableCard,
} from "../../Customer/components/ReuseableComponent";
import PurchaseStatusBadge from "../../Purchase/components/PurchaseStatusBadge";
import SupplierFormModal from "./SupplierFormModal";

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetSupplierByIdQuery(String(id));
  const canUpdate = useHasPermission("suppliers.update");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const supplier = data?.data;

  if (isLoading) return <Loading message="Loading supplier details..." />;
  if (isError || !supplier)
    return (
      <p className="text-red-500 p-4">Failed to fetch supplier details.</p>
    );

  // Calculate purchase summary
  const purchases = supplier.purchase_history || [];
  const summary = {
    totalPurchases: purchases.length,
    totalAmount: purchases.reduce(
      (s: number, v: any) => s + Number(v.total),
      0
    ),
    totalPaid: purchases.reduce(
      (s: number, v: any) => s + Number(v.paid_amount),
      0
    ),
    totalDue: purchases.reduce(
      (s: number, v: any) => s + Number(v.due_amount),
      0
    ),
  };

  return (
    <div>
      <PageMeta
        title={`Supplier - ${supplier.name}`}
        description="Supplier Details"
      />
      <PageBreadcrumb pageTitle={`Supplier - ${supplier.name}`} />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 justify-end w-full">
          <Link to={`/suppliers/${id}/ledger`}>
            <IconButton icon={BookOpen} tooltip="View Ledger" color="purple" />
          </Link>
          {canUpdate && (
            <IconButton
              icon={Pencil}
              tooltip="Edit"
              color="blue"
              onClick={() => setIsEditModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Supplier Information */}
      <DetailCard title="Supplier Information">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info label="Supplier Code" value={supplier.supplier_code || "-"} />
          <Info label="Name" value={supplier.name} />
          <Info label="Contact Person" value={supplier.contact_person || "-"} />
          <Info label="Phone" value={supplier.phone || "-"} />
          <Info label="Email" value={supplier.email || "-"} />
          <Info label="Address" value={supplier.address || "-"} />
          <Info label="Payment Terms" value={supplier.payment_terms || "-"} />
          <Info label="Total Products" value={supplier.products?.length || 0} />
          <Info
            label="Status"
            value={
              <Badge color={supplier.status ? "success" : "error"} size="sm">
                {supplier.status ? "Active" : "Inactive"}
              </Badge>
            }
          />
          <Info
            label="Created At"
            value={new Date(supplier.created_at).toLocaleDateString()}
          />
        </div>
      </DetailCard>

      {/* Account Information */}
      {supplier.account && (
        <DetailCard title="Account Information">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="Account Code" value={supplier.account.code} />
            <Info
              label="Account Number"
              value={supplier.account.account_number}
            />
            <Info label="Account Name" value={supplier.account.name} />
            <Info label="Account Type" value={supplier.account.type} />
          </div>
        </DetailCard>
      )}

      {/* Products Information */}
      {supplier.products && supplier.products.length > 0 && (
        <TableCard title="Products">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>SKU</TableCell>
                <TableCell isHeader>Product Name</TableCell>
                <TableCell isHeader>Barcode</TableCell>
                <TableCell isHeader>Purchase Price</TableCell>
                <TableCell isHeader>Selling Price</TableCell>
                <TableCell isHeader>Origin</TableCell>
                <TableCell isHeader>Status</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {supplier.products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to={`/products/view/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>{product.barcode || "-"}</TableCell>
                  <TableCell>
                    {Number(product.purchase_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {Number(product.selling_price).toFixed(2)}
                  </TableCell>
                  <TableCell>{product.origin || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      color={product.status ? "success" : "error"}
                      size="sm"
                    >
                      {product.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      {/* Purchase Summary Metrics */}
      <MetricsCard
        sales={summary.totalPurchases}
        paid={summary.totalPaid}
        due={summary.totalDue}
        total={summary.totalAmount}
      />

      {/* Purchase History */}
      <TableCard title="Purchase History">
        {purchases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>PO No</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Warehouse</TableCell>
                <TableCell isHeader>Total</TableCell>
                <TableCell isHeader>Paid</TableCell>
                <TableCell isHeader>Due</TableCell>
                <TableCell isHeader>Date</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {purchases.map((purchase: Purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    <Link to={`/purchases/${purchase.id}`}>
                      {purchase.po_no}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <PurchaseStatusBadge status={purchase.status} />
                  </TableCell>
                  <TableCell>{purchase.warehouse?.name || "-"}</TableCell>
                  <TableCell>{Number(purchase.total).toFixed(2)}</TableCell>
                  <TableCell className="text-green-600">
                    {Number(purchase.paid_amount).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={
                      Number(purchase.due_amount) > 0
                        ? "text-red-500 font-medium"
                        : "text-green-600"
                    }
                  >
                    {Number(purchase.due_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            No purchase history found.
          </p>
        )}
      </TableCard>

      {/* Edit Modal */}
      <SupplierFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        supplier={supplier}
      />
    </div>
  );
}
