import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import Loading from "../../components/common/Loading";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useGetPosSaleByIdQuery } from "../../features/pos/posApi";
import { PosSale } from "../../types/pos";
import {
  formatCurrencyEnglish,
  formatDateTime,
  getPaymentMethodBadge,
  getStatusBadge,
} from "../../utlis";

export default function PosSaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const saleId = parseInt(id || "0");

  const { data: response, isLoading, isError } = useGetPosSaleByIdQuery(saleId);
  const sale: PosSale = response?.data;

  if (isLoading) {
    return <Loading message="Loading sale details..." />;
  }

  if (isError || !sale) {
    return (
      <div>
        <PageMeta title="Sale Not Found" description="Sale details not found" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">Sale not found</p>
            <p className="text-gray-500 text-sm mb-4">
              The sale you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/pos/sales">
              <Button variant="primary" size="sm">
                Back to Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title={`Sale Details - ${sale.invoice_no}`}
        description={`View details for sale ${sale.invoice_no}`}
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle={`Sale Details - ${sale.invoice_no}`} />

      {/* Page Container */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5 print:border-0 print:bg-white print:shadow-none">
        {/* Header Actions */}
        <div className="flex justify-end  py-2">
          <Link to="/pos/sales">
            <Button variant="primary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </Link>
        </div>

        {/* Sale Header */}
        <div className="border-b border-gray-200 pb-6 mb-6 dark:border-gray-700 print:break-after-page">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Invoice Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {sale.invoice_no}
              </h1>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Status:
                  </span>
                  <Badge
                    size="sm"
                    variant="light"
                    color={getStatusBadge(sale.status).color}
                  >
                    {getStatusBadge(sale.status).text}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Date:</span>{" "}
                  {formatDateTime(sale.created_at)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Type:</span> {sale.sale_type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Branch:</span>{" "}
                  {sale.branch?.name}
                </p>
              </div>
            </div>

            {/* Created By */}
            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Created By
              </p>
              <p className="font-medium text-gray-800 dark:text-white">
                {sale.created_by?.full_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sale.created_by?.email}
              </p>
              {sale.served_by && sale.served_by.id !== sale.created_by?.id && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-1">
                    Served By
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {sale.served_by.full_name}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Customer & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Name
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {sale.customer?.name || "Guest Customer"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Code
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {sale.customer?.customer_code || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {sale.customer?.phone || "N/A"}
                    </p>
                    {sale.customer?.phone && (
                      <a
                        href={`tel:${sale.customer.phone}`}
                        className="text-blue-600 hover:text-blue-700"
                      ></a>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {sale.customer?.email || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sale Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Sale Items
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Product</TableCell>
                      <TableCell isHeader>SKU</TableCell>
                      <TableCell isHeader className="text-right">
                        Qty
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Unit Price
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Discount
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Tax
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.product?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.product?.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {item.product?.sku}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyEnglish(parseFloat(item.unit_price))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyEnglish(parseFloat(item.discount))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyEnglish(parseFloat(item.tax))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrencyEnglish(parseFloat(item.line_total))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Price Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrencyEnglish(parseFloat(sale.subtotal))}
                  </span>
                </div>

                {parseFloat(sale.manual_discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Manual Discount
                    </span>
                    <span className="font-medium text-red-600">
                      -{formatCurrencyEnglish(parseFloat(sale.manual_discount))}
                    </span>
                  </div>
                )}
                {parseFloat(sale.group_discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Group Discount
                    </span>
                    <span className="font-medium text-red-600">
                      -{formatCurrencyEnglish(parseFloat(sale.group_discount))}
                    </span>
                  </div>
                )}
                {parseFloat(sale.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrencyEnglish(parseFloat(sale.tax))}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatCurrencyEnglish(parseFloat(sale.total))}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Paid Amount
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrencyEnglish(parseFloat(sale.paid_amount))}
                  </span>
                </div>
                {parseFloat(sale.total) - parseFloat(sale.paid_amount) !==
                  0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Due Amount
                    </span>
                    <span className="font-medium text-orange-600">
                      {formatCurrencyEnglish(
                        parseFloat(sale.total) - parseFloat(sale.paid_amount)
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Payment Methods
              </h3>
              <div className="space-y-2">
                {sale.payments?.map((payment, index) => {
                  const badgeProps = getPaymentMethodBadge(payment.method);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          size="sm"
                          variant="light"
                          color={badgeProps.color}
                        >
                          {badgeProps.text}
                        </Badge>
                        {payment.account_code && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({payment.account_code})
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrencyEnglish(parseFloat(payment.amount))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rewards */}
            {sale.customer?.reward_points &&
              parseFloat(sale.customer.reward_points) > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Customer Rewards
                  </h3>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600 mb-1">
                      {parseFloat(sale.customer.reward_points).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reward Points
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
