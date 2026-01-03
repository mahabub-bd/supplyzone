import AccountBadge from "../../../components/common/AccountBadge";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";

import {
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import StatCard from "../../../components/common/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetTrialBalanceQuery } from "../../../features/accounts/accountsApi";

interface NormalBalance {
  side: "debit" | "credit";
  amount: number;
}

interface TrialBalanceItem {
  code: string;
  account_number: number;
  name: string;
  type: string;
  debit: number;
  credit: number;
  normalBalance: NormalBalance;
}

interface TrialBalanceData {
  date: string;
  items: TrialBalanceItem[];
  totals: {
    totalDebit: number;
    totalCredit: number;
    difference: number;
    isBalanced: boolean;
  };
}

export default function TrialBalancePage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data, isLoading, isError } = useGetTrialBalanceQuery(selectedDate);

  const trialBalance = data?.data as TrialBalanceData;
  const items = trialBalance?.items || [];

  // Group items by type for summary using normal balance amounts
  const groupByType = () => {
    const grouped = {
      asset: { amount: 0, count: 0 },
      liability: { amount: 0, count: 0 },
      equity: { amount: 0, count: 0 },
      income: { amount: 0, count: 0 },
      expense: { amount: 0, count: 0 },
    };

    items.forEach((item) => {
      const type = item.type.toLowerCase();
      if (type in grouped) {
        grouped[type as keyof typeof grouped].amount +=
          item.normalBalance.amount;
        grouped[type as keyof typeof grouped].count += 1;
      }
    });

    return grouped;
  };

  const grouped = groupByType();

  if (isLoading) return <Loading message="Loading trial balance..." />;
  if (isError)
    return (
      <p className="text-red-500 p-4">Failed to fetch trial balance data.</p>
    );

  return (
    <div>
      <PageMeta title="Trial Balance" description="View trial balance report" />
      <PageBreadcrumb pageTitle="Trial Balance" />

      <div className="flex flex-col gap-5 min-h-screen">
        {/* Date Selector and Summary Stats */}
        <div className="flex flex-col gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <label
                htmlFor="date"
                className="text-sm font-medium text-gray-700"
              >
                Date:
              </label>
            </div>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              max={today}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            <StatCard
              title="Assets"
              value={`৳${grouped.asset.amount.toFixed(2)}`}
              bgColor="blue"
              icon={Building}
              badge={{
                text: `${grouped.asset.count} accounts`,
                color: "info",
              }}
            />

            <StatCard
              title="Liabilities"
              value={`৳${grouped.liability.amount.toFixed(2)}`}
              bgColor="orange"
              icon={CreditCard}
              badge={{
                text: `${grouped.liability.count} accounts`,
                color: "warning",
              }}
            />

            <StatCard
              title="Equity"
              value={`৳${grouped.equity.amount.toFixed(2)}`}
              bgColor="purple"
              icon={TrendingUp}
              badge={{
                text: `${grouped.equity.count} accounts`,
                color: "default",
              }}
            />

            <StatCard
              title="Income"
              value={`৳${grouped.income.amount.toFixed(2)}`}
              bgColor="green"
              icon={DollarSign}
              badge={{
                text: `${grouped.income.count} accounts`,
                color: "success",
              }}
            />

            <StatCard
              title="Expenses"
              value={`৳${grouped.expense.amount.toFixed(2)}`}
              bgColor="pink"
              icon={Wallet}
              badge={{
                text: `${grouped.expense.count} accounts`,
                color: "danger",
              }}
            />
          </div>
        </div>

        {/* Trial Balance Table */}
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-semibold">Trial Balance</h1>
            <div className="text-sm text-gray-500">
              As of: {trialBalance?.date || selectedDate}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader>Account Number</TableCell>
                  <TableCell isHeader>Account Code</TableCell>
                  <TableCell isHeader>Account Name</TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Debit</TableCell>
                  <TableCell isHeader>Credit</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <TableRow
                    key={item.code}
                    className="border-b last:border-none"
                  >
                    <TableCell>{item.account_number}</TableCell>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="px-4 py-3 text-sm capitalize">
                      <AccountBadge
                        color={
                          item.type === "asset"
                            ? "blue"
                            : item.type === "liability"
                            ? "orange"
                            : item.type === "equity"
                            ? "purple"
                            : item.type === "income"
                            ? "green"
                            : "red"
                        }
                      >
                        {item.type}
                      </AccountBadge>
                    </TableCell>
                    <TableCell>
                      {item.normalBalance.side === "debit" &&
                      item.normalBalance.amount > 0
                        ? `৳${item.normalBalance.amount.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {item.normalBalance.side === "credit" &&
                      item.normalBalance.amount > 0
                        ? `৳${item.normalBalance.amount.toFixed(2)}`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {/* Totals Row */}
              {trialBalance?.totals && (
                <TableBody>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 font-semibold">
                    <TableCell
                      colSpan={4}
                      className="px-4 py-3 text-sm text-right text-gray-800 dark:text-gray-100"
                    >
                      Totals:
                    </TableCell>
                    <TableCell>
                      ৳{trialBalance.totals.totalDebit.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ৳{trialBalance.totals.totalCredit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  {trialBalance.totals.difference !== 0 && (
                    <TableRow className="bg-red-50 dark:bg-red-900/20">
                      <TableCell
                        colSpan={4}
                        className="px-4 py-3 text-sm text-right text-red-600 font-medium"
                      >
                        Difference:
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                        ৳{Math.abs(trialBalance.totals.difference).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
