import { Eye, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import Loading from "../../components/common/Loading";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Pagination from "../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useGetPosSalesQuery } from "../../features/pos/posApi";
import { PosSale } from "../../types/pos";
import {
  formatCurrencyEnglish,
  formatDateTime,
  getPaymentMethodBadge,
  getStatusBadge,
} from "../../utlis";

export default function PosSalesListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  // Fetch sales data with pagination
  const { data, isLoading, isError } = useGetPosSalesQuery({
    page: currentPage,
    limit,
  });

  const sales = data?.data || [];
  const meta = data?.meta;

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter sales based on search
  const filteredSales = sales.filter((sale: PosSale) => {
    const matchesSearch =
      sale.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer?.phone?.includes(searchTerm) ||
      sale.served_by?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="POS Sales List"
        description="View and manage all POS sales transactions"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="POS Sales List" />

      {/* Page Container */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            POS Sales Transactions
          </h2>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice, customer, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-80 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2"></div>
        </div>

        {/* Loading State */}
        {isLoading && <Loading message="Loading sales data..." />}

        {/* Error State */}
        {isError && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-2">
                Failed to load sales data
              </p>
              <p className="text-gray-500 text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Sales Table */}
        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Invoice #</TableCell>
                    <TableCell isHeader>Date & Time</TableCell>
                    <TableCell isHeader>Customer</TableCell>
                    <TableCell isHeader>Items</TableCell>
                    <TableCell isHeader>Total</TableCell>
                    <TableCell isHeader>Payment</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Served By</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                          <p className="text-lg font-medium mb-1">
                            No sales found
                          </p>
                          <p className="text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale: PosSale) => (
                      <TableRow
                        key={sale.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {sale.invoice_no}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatDateTime(sale.created_at)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {sale.customer?.name || "Guest Customer"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {sale.customer?.phone || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {sale.items?.length || 0} items
                          </p>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {formatCurrencyEnglish(parseFloat(sale.total))}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {sale.payments
                              ?.slice(0, 2)
                              .map((payment, index: number) => {
                                const badgeProps = getPaymentMethodBadge(
                                  payment.method
                                );
                                return (
                                  <Badge
                                    key={index}
                                    size="sm"
                                    variant="light"
                                    color={badgeProps.color}
                                  >
                                    {badgeProps.text}
                                  </Badge>
                                );
                              })}
                            {sale.payments && sale.payments.length > 2 && (
                              <Badge size="sm" variant="light" color="light">
                                +{sale.payments.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant="light"
                            color={getStatusBadge(sale.status).color}
                          >
                            {getStatusBadge(sale.status).text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {sale.served_by?.full_name || "N/A"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/pos/sales/${sale.id}`}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            title="View sale details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
                currentPageItems={filteredSales.length}
                itemsPerPage={limit}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
