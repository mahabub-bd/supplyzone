import Info from "../../components/common/Info";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useGetPosTransactionHistoryQuery } from "../../features/pos/posApi";
import { JournalTransaction, TransactionEntry } from "../../types/accounts";
import { SaleDetail } from "../../types/sales";

import { formatCurrencyEnglish, formatDate } from "../../utlis";

export default function PosSaleTransactionsPage() {
  const { data } = useGetPosTransactionHistoryQuery({});

  const saleList = data?.data || [];

  if (saleList.length === 0)
    return <div className="p-6 text-center">No sale transactions found.</div>;

  return (
    <div>
      <PageMeta
        title="POS Sale Transactions"
        description="View all sale journal entries"
      />
      <PageBreadcrumb pageTitle="POS Sale Transactions" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {saleList.map((sale: SaleDetail) => (
          <div
            key={sale.sale_id}
            className="border rounded-xl p-4 dark:border-gray-700"
          >
            <h2 className="text-lg font-bold mb-3">
              Invoice: {sale.invoice_no}
            </h2>

            {/* Sale summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <Info label="Customer" value={sale.customer?.name} />
              <Info label="Served By" value={sale.served_by?.full_name} />
              <Info
                label="Total Amount"
                value={formatCurrencyEnglish(sale.total)}
              />
              <Info label="Date" value={formatDate(sale.created_at)} />
            </div>

            {/* Transactions */}
            {sale.transactions.map((transaction: JournalTransaction) => (
              <div
                key={transaction.id}
                className="mt-4 overflow-hidden rounded-lg border dark:border-white/5 dark:bg-[#1e1e1e]"
              >
                <div className="p-3 border-b dark:border-gray-700">
                  <Badge
                    className="capitalize"
                    size="sm"
                    color={
                      transaction.reference_type === "sale" ? "info" : "warning"
                    }
                  >
                    {transaction.reference_type.replace("_", " ")}
                  </Badge>
                  <p className="text-xs mt-1">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>

                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell isHeader>Account</TableCell>
                        <TableCell isHeader>Debit</TableCell>
                        <TableCell isHeader>Credit</TableCell>
                        <TableCell isHeader>Narration</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transaction.entries.map((entry: TransactionEntry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.account_name}</TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {entry.debit > 0
                              ? formatCurrencyEnglish(entry.debit)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-red-600 font-medium">
                            {entry.credit > 0
                              ? formatCurrencyEnglish(entry.credit)
                              : "—"}
                          </TableCell>
                          <TableCell>{entry.narration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
