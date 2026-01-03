import { JSX } from "react";

const PaymentBox = ({
  icon,
  bg,
  label,
  amount,
}: {
  icon: JSX.Element;
  bg: string;
  label: string;
  amount: string;
}) => (
  <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-lg ${bg}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-white">
        {amount}
      </p>
    </div>
  </div>
);

export default PaymentBox;
