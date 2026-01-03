import {
  ArrowLeft,
  Building,
  Calendar,
  Hash,
  Mail,
  Phone,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import Button from "../ui/button";

interface BaseEntity {
  name: string;
  code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

interface LedgerData {
  account_code: string;
  opening_balance: number;
  closing_balance: number;
}

interface LedgerSummaryCardProps {
  entity: BaseEntity;
  ledger: LedgerData;
  totalTransactions: number;
  selectedDate: string;
  onDateChange: (value: string) => void;
  onBack: () => void;
  formatCurrency: (value: number) => string;
  type: "customer" | "supplier";
}

/* ------------------ Helpers ------------------ */
const resolveBalance = (type: "customer" | "supplier", amount: number) => {
  if (type === "customer") {
    return {
      isPrimary: amount > 0,
      primaryLabel: "Receivable",
      secondaryLabel: "Credit",
    };
  }
  return {
    isPrimary: amount < 0,
    primaryLabel: "Payable",
    secondaryLabel: "Advance",
  };
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label?: string;
  value: string;
}) => (
  <div className="flex items-center gap-2 text-sm min-w-0">
    <Icon className="h-4 w-4 text-gray-400 shrink-0" />
    {label && <span className="text-gray-500">{label}:</span>}
    <span className="font-medium text-gray-900 dark:text-white truncate">
      {value}
    </span>
  </div>
);

import { Wallet } from "lucide-react";

interface BalanceBoxProps {
  title: string;
  amount: number;
  type: "customer" | "supplier";
  highlight?: boolean;
  formatCurrency: (v: number) => string;
}

export const BalanceBox = ({
  title,
  amount,
  type,
  highlight,
  formatCurrency,
}: BalanceBoxProps) => {
  const { isPrimary, primaryLabel, secondaryLabel } = resolveBalance(
    type,
    amount
  );

  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "border-orange-300 bg-orange-50 dark:bg-orange-950/40"
          : "border-gray-200 bg-gray-50 dark:bg-gray-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-gray-500" />
          <p className="text-xs font-semibold uppercase text-gray-500">
            {title}
          </p>
        </div>
      </div>

      {/* Amount */}
      <p
        className={`text-xl font-bold leading-tight ${
          isPrimary ? "text-orange-600" : "text-green-600"
        }`}
      >
        {formatCurrency(Math.abs(amount))}
      </p>

      {/* Trend */}
      {amount !== 0 && (
        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
          {isPrimary ? (
            <>
              <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-600">{primaryLabel}</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-600">{secondaryLabel}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------ Component ------------------ */
export default function LedgerSummaryCard({
  entity,
  ledger,
  totalTransactions,
  selectedDate,
  onDateChange,
  onBack,
  formatCurrency,
  type,
}: LedgerSummaryCardProps) {
  const isCustomer = type === "customer";

  return (
    <div className="rounded-2xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
      {/* Header */}
      <div className="flex justify-between gap-4 p-6 pb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-4">{entity.name}</h1>

          <div className="grid sm:grid-cols-2 gap-3">
            <InfoRow
              icon={Hash}
              label={isCustomer ? "Customer" : "Supplier"}
              value={entity.code}
            />
            <InfoRow
              icon={isCustomer ? User : Building}
              label="Account"
              value={ledger.account_code}
            />
            {entity.contact_person && (
              <InfoRow icon={User} value={entity.contact_person} />
            )}
            {entity.phone && <InfoRow icon={Phone} value={entity.phone} />}
            {entity.email && <InfoRow icon={Mail} value={entity.email} />}
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Date */}
      <div className="flex justify-between items-center px-6 py-4 border-y bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-semibold">Statement as of</span>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-lg border px-4 py-2 text-sm dark:bg-gray-800"
        />
      </div>

      {/* Summary */}
      <div className="p-6 grid md:grid-cols-3 gap-4">
        <BalanceBox
          title="Opening Balance"
          amount={ledger.opening_balance}
          type={type}
          formatCurrency={formatCurrency}
        />

        <BalanceBox
          title="Closing Balance"
          amount={ledger.closing_balance}
          type={type}
          highlight
          formatCurrency={formatCurrency}
        />

        <div className="rounded-xl p-5 border bg-gray-50 dark:bg-gray-800">
          <p className="text-xs uppercase font-semibold text-gray-500 mb-3">
            Total Transactions
          </p>
          <p className="text-2xl font-bold">
            {totalTransactions.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
