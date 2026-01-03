import { CreditCard, Eye, Plus, ShoppingCart, Wallet, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import DatePicker from "../../../components/form/date-picker";
import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import Badge from "../../../components/ui/badge/Badge";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import { useGetBranchesQuery } from "../../../features/branch/branchApi";
import { useGetCustomersQuery } from "../../../features/customer/customerApi";
import { useGetSalesQuery } from "../../../features/sale/saleApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { SaleResponse, SaleStatus } from "../../../types/sales";
import { formatCurrencyEnglish, formatDate } from "../../../utlis";
import SalePaymentModal from "./SalePaymentModal";

// Import the Payment Modal

// Filter options
const saleTypeOptions = [
  { id: "pos", name: "POS" },
  { id: "regular", name: "Regular" },
];

const statusOptions = [
  { id: "held", name: "Held" },
  { id: "completed", name: "Completed" },
  { id: "refunded", name: "Refunded" },
  { id: "partial_refund", name: "Partial Refund" },
  { id: "draft", name: "Draft" },
];

export default function SaleList() {
  const canView = useHasPermission("sale.view");
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [filters, setFilters] = useState({
    saleType: undefined as string | undefined,
    status: undefined as SaleStatus | undefined,
    branch_id: undefined as number | undefined,
    customer_id: undefined as number | undefined,
    fromDate: undefined as string | undefined,
    toDate: undefined as string | undefined,
  });

  // Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);

  // Fetch dropdown data
  const { data: branchesData } = useGetBranchesQuery();
  const { data: customersData } = useGetCustomersQuery({});
  const branches = branchesData?.data || [];
  const customers = customersData?.data || [];

  const { data, isLoading, isFetching, isError, refetch } = useGetSalesQuery({
    page,
    limit,
    saleType: filters.saleType,
    status: filters.status,
    branch_id: filters.branch_id,
    customer_id: filters.customer_id,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });

  const sales = data?.data || [];

  const meta = data?.meta;

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]:
        value === ""
          ? undefined
          : key.includes("_id")
          ? parseInt(value)
          : value,
    }));
    setPage(1); // Reset to first page when applying filters
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      saleType: undefined,
      status: undefined,
      branch_id: undefined,
      customer_id: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
    setPage(1);
  };

  // Only show full loading screen on initial load, not on pagination
  if (isLoading && !data) return <Loading message="Loading Sales..." />;

  // Error state
  if (isError)
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to fetch sales. Please try again.</p>
      </div>
    );

  // Helper function for badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      default:
        return "error";
    }
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Sale Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={() => navigate("/sales/create")}
        permission="sale.create"
      />

      {/* Filters Section */}
      <div className="mb-6 rounded-xl border bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-45">
            <SelectField
              label="Sale Type"
              data={saleTypeOptions}
              value={filters.saleType || ""}
              onChange={(value) => handleFilterChange("saleType", value)}
              placeholder="Select sale type"
              allowEmpty={true}
              emptyLabel="All Types"
            />
          </div>

          <div className="flex-1 min-w-45">
            <SelectField
              label="Status"
              data={statusOptions}
              value={filters.status || ""}
              onChange={(value) => handleFilterChange("status", value)}
              placeholder="Select status"
              allowEmpty={true}
              emptyLabel="All Status"
            />
          </div>

          <div className="flex-1 min-w-45">
            <SelectField
              label="Branch"
              data={branches}
              value={filters.branch_id?.toString() || ""}
              onChange={(value) => handleFilterChange("branch_id", value)}
              placeholder="Select branch"
              allowEmpty={true}
              emptyLabel="All Branches"
            />
          </div>

          <div className="flex-1 min-w-45">
            <SelectField
              label="Customer"
              data={customers}
              value={filters.customer_id?.toString() || ""}
              onChange={(value) => handleFilterChange("customer_id", value)}
              placeholder="Select customer"
              allowEmpty={true}
              emptyLabel="All Customers"
            />
          </div>

          <div className="flex-1 min-w-45">
            <DatePicker
              id="sale-from-date"
              label="From Date"
              value={filters.fromDate ? new Date(filters.fromDate) : null}
              onChange={(value) =>
                handleFilterChange(
                  "fromDate",
                  value ? (value as Date).toISOString().split("T")[0] : ""
                )
              }
              placeholder="Start date"
            />
          </div>

          <div className="flex-1 min-w-45">
            <DatePicker
              id="sale-to-date"
              label="To Date"
              value={filters.toDate ? new Date(filters.toDate) : null}
              onChange={(value) =>
                handleFilterChange(
                  "toDate",
                  value ? (value as Date).toISOString().split("T")[0] : ""
                )
              }
              placeholder="End date"
            />
          </div>

          <div className="mb-px">
            <IconButton
              icon={X}
              tooltip="Clear Filters"
              color="gray"
              onClick={clearFilters}
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e] relative">
        {/* Loading overlay during pagination */}
        {isFetching && data && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
            <Loading message=" Loading..." />
          </div>
        )}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Invoice</TableCell>
                <TableCell isHeader>Customer</TableCell>
                <TableCell isHeader>Total</TableCell>
                <TableCell isHeader>Paid</TableCell>
                <TableCell isHeader>Due</TableCell>
                <TableCell isHeader>Sale Type</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Date</TableCell>
                <TableCell isHeader className="text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale: SaleResponse) => {
                  const dueAmount =
                    Number(sale.total) - Number(sale.paid_amount);

                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <Link
                          to={`/sales/${sale.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {sale.invoice_no}
                        </Link>
                      </TableCell>
                      <TableCell>{sale.customer?.name || "N/A"}</TableCell>

                      <TableCell>
                        {formatCurrencyEnglish(Number(sale.total))}
                      </TableCell>
                      <TableCell>
                        {formatCurrencyEnglish(Number(sale.paid_amount))}
                      </TableCell>

                      <TableCell
                        className={
                          dueAmount > 0
                            ? "text-red-600 font-bold"
                            : "text-green-600 font-medium"
                        }
                      >
                        {formatCurrencyEnglish(dueAmount)}
                      </TableCell>
                      <TableCell className="capitalize flex items-center gap-1">
                        {sale.sale_type === "pos" ? (
                          <>
                            <CreditCard size={14} className="text-blue-600" />
                            POS
                          </>
                        ) : (
                          <>
                            <ShoppingCart
                              size={14}
                              className="text-green-600"
                            />
                            Regular
                          </>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          size="sm"
                          color={getStatusColor(sale.status)}
                          className="capitalize"
                        >
                          {sale.status}
                        </Badge>
                      </TableCell>

                      <TableCell>{formatDate(sale.created_at)}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* View Button */}
                          {canView && (
                            <Link to={`/sales/${sale.id}`}>
                              <IconButton
                                icon={Eye}
                                tooltip="View"
                                color="gray"
                              />
                            </Link>
                          )}

                          {/* Pay Due Button */}
                          {dueAmount > 0 && (
                            <IconButton
                              icon={Wallet}
                              tooltip="Pay Due"
                              color="purple"
                              disabled={dueAmount <= 0}
                              onClick={() => {
                                setSelectedSale(sale);
                                setPaymentModalOpen(true);
                              }}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No sales found
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
          currentPageItems={sales.length}
          itemsPerPage={limit}
        />
      )}

      {/* Sale Due Payment Modal */}
      {paymentModalOpen && selectedSale && (
        <SalePaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            refetch(); // Refresh sale data after successful payment
          }}
          sale={selectedSale}
        />
      )}
    </>
  );
}
