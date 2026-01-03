import AccountBadge from "../../../components/common/AccountBadge";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import StatCard from "../../../components/common/stat-card";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetAccountBalancesQuery } from "../../../features/accounts/accountsApi";

// Lucide React Icons
import {
  CreditCard,
  DollarSign,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Account } from "../../../types/accounts";

export default function AccountBalancePage() {
  const today = new Date().toISOString().split("T")[0];

  const { data, isLoading, isError } = useGetAccountBalancesQuery(today);

  const balances = data?.data || [];

  // Calculate totals for each account type
  const calculateTotals = () => {
    const totals = {
      asset: 0,
      liability: 0,
      equity: 0,
      income: 0,
      expense: 0,
    };

    balances.forEach((account: Account) => {
      const balance = Number(account.balance ?? 0);
      const type = account.type.toLowerCase();

      if (type in totals) {
        // Use absolute value for proper balance sheet totals
        totals[type as keyof typeof totals] += Math.abs(balance);
      }
    });

    return totals;
  };

  const totals = calculateTotals();
  const profit = totals.income - totals.expense;

  if (isLoading) return <Loading message="Loading account balances..." />;
  if (isError)
    return (
      <p className="text-red-500 p-4">Failed to fetch account balances.</p>
    );

  return (
    <div>
      <PageMeta
        title="Account Balances"
        description="View all account balances"
      />
      <PageBreadcrumb pageTitle="Account Balances" />

      <div className="flex flex-col gap-5 min-h-screen">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={Wallet}
            title="Assets"
            value={`৳${totals.asset.toFixed(2)}`}
            bgColor="blue"
            badge={{
              text: "Asset",
              color: "info",
            }}
          />

          <StatCard
            icon={CreditCard}
            title="Liabilities"
            value={`৳${totals.liability.toFixed(2)}`}
            bgColor="orange"
            badge={{
              text: "Liability",
              color: "warning",
            }}
          />

          <StatCard
            icon={Scale}
            title="Equity"
            value={`৳${totals.equity.toFixed(2)}`}
            bgColor="purple"
            badge={{
              text: "Equity",
              color: "default",
            }}
          />

          <StatCard
            icon={TrendingUp}
            title="Sales Revenue"
            value={`৳${totals.income.toFixed(2)}`}
            bgColor="green"
            badge={{
              text: "Income",
              color: "success",
            }}
          />

          <StatCard
            icon={TrendingDown}
            title="Expenses"
            value={`৳${totals.expense.toFixed(2)}`}
            bgColor="pink"
            badge={{
              text: "Expense",
              color: "danger",
            }}
          />

          <StatCard
            icon={DollarSign}
            title="Profit/Loss"
            value={`৳${profit.toFixed(2)}`}
            bgColor={profit >= 0 ? "green" : "pink"}
            badge={{
              text: profit >= 0 ? "Profit" : "Loss",
              color: profit >= 0 ? "success" : "danger",
            }}
          />
        </div>

        {/* Account Balances Table */}
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
          <h1 className="text-xl font-semibold mb-5">Account Balances</h1>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  {/* Code – left */}
                  <TableCell isHeader>Account Number</TableCell>

                  <TableCell isHeader>Code</TableCell>

                  {/* Name – left */}
                  <TableCell isHeader>Name</TableCell>

                  {/* Type – center */}
                  <TableCell isHeader>Type</TableCell>

                  {/* Debit – right */}
                  <TableCell isHeader>Debit</TableCell>

                  {/* Credit – right */}
                  <TableCell isHeader>Credit</TableCell>

                  {/* Balance – right */}
                  <TableCell isHeader>Balance</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 mx-auto">
                {balances.map((item: Account) => (
                  <TableRow
                    key={item.code}
                    className="border-b last:border-none"
                  >
                    {/* Code – left */}
                    <TableCell>{item.account_number}</TableCell>
                    <TableCell>{item.code}</TableCell>

                    {/* Name – left */}
                    <TableCell>{item.name}</TableCell>

                    {/* Type – center */}
                    <TableCell className="px-4 py-3 text-sm  capitalize">
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

                    {/* Debit – right */}
                    <TableCell>{Number(item.debit ?? 0).toFixed(2)}</TableCell>

                    {/* Credit – right */}
                    <TableCell>{Number(item.credit ?? 0).toFixed(2)}</TableCell>

                    {/* Balance – right, colored */}
                    <TableCell
                      className={`px-4 py-3 text-sm text-right font-medium ${
                        (item.balance ?? 0) < 0
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {Number(item.balance ?? 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
