import { Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetPaymentsQuery } from "../../../features/payment/paymentApi";
import { GetPaymentsParams } from "../../../types/payment";

const badgeColors: Record<string, string> = {
  cash: "text-green-600 Capitalized bg-green-50 px-2 py-1 rounded-full text-xs",
  bank: "text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs",
  mobile: "text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs",
};

const paymentTypeOptions = [
  { id: "", name: "All Types" },
  { id: "supplier", name: "Supplier" },
  { id: "customer", name: "Customer" },
];

const paymentMethodOptions = [
  { id: "", name: "All Methods" },
  { id: "cash", name: "Cash" },
  { id: "bank", name: "Bank" },
];

export default function PaymentList() {
  const [filters, setFilters] = useState<GetPaymentsParams>({
    page: 1,
    limit: 10,
    type: undefined,
    method: undefined,
  });

  const { data, isLoading, isError } = useGetPaymentsQuery(filters);
  const payments = data?.data || [];
  const meta = data?.meta;

  const handleFilterChange = (key: keyof GetPaymentsParams, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (isLoading) return <Loading message="Loading payments..." />;
  if (isError)
    return <p className="text-red-500 p-4">Failed to fetch payments.</p>;

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField
            label="Payment Type"
            data={paymentTypeOptions}
            value={filters.type || ""}
            onChange={(value) => handleFilterChange("type", value)}
            placeholder="Select type"
          />

          <SelectField
            label="Payment Method"
            data={paymentMethodOptions}
            value={filters.method || ""}
            onChange={(value) => handleFilterChange("method", value)}
            placeholder="Select method"
          />

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 10 })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {meta && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {payments.length} of {meta.total} payments
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader>Supplier/Customer</TableCell>
                <TableCell isHeader>Reference No</TableCell>
                <TableCell isHeader>Amount</TableCell>
                <TableCell isHeader>Method</TableCell>
                <TableCell isHeader>Type</TableCell>
                <TableCell isHeader>Date</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment: any) => {
                  const isSupplierPayment = payment.type === "supplier";
                  const displayName = isSupplierPayment
                    ? payment.supplier?.name
                    : payment.customer?.name;

                  const referenceNo = isSupplierPayment
                    ? payment.purchase?.po_no
                    : payment.sale?.invoice_no;

                  return (
                    <TableRow key={payment.id}>
                      {/* Supplier / Customer */}
                      <TableCell className="font-medium">
                        {displayName || "-"}
                      </TableCell>

                      {/* PO No or Invoice No */}
                      <TableCell>{referenceNo || "-"}</TableCell>

                      {/* Amount */}
                      <TableCell className="font-medium">
                        {Number(payment.amount).toFixed(2)}
                      </TableCell>

                      {/* Method Badge */}
                      <TableCell>
                        <span
                          className={
                            badgeColors[payment.method] ||
                            "bg-gray-50 text-gray-600 px-2 py-1 rounded-full text-xs"
                          }
                        >
                          {payment.method.charAt(0).toUpperCase() +
                            payment.method.slice(1)}
                        </span>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            payment.type === "supplier"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {payment.type}
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <Link to={`/payments/${payment.id}`}>
                          <IconButton icon={Eye} color="blue" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={{
            currentPage: meta.page,
            totalPages: meta.totalPages,
            total: meta.total,
          }}
          onPageChange={handlePageChange}
          currentPageItems={payments.length}
          itemsPerPage={filters.limit || 10}
        />
      )}
    </div>
  );
}
