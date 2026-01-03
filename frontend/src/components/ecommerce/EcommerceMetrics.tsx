

import {
  ArrowDownIcon,
  ArrowUpIcon,
  GroupIcon,
  BoxIconLine,
  DollarLineIcon,
  TaskIcon,
} from "../../icons";
import StatCard from "../common/stat-card";


export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <StatCard
        icon={GroupIcon}
        title="Customers"
        value="3,782"
        bgColor="indigo" // Matches your dark blue-themed UI
        badge={{
          icon: ArrowUpIcon,
          text: "11.01%",
          color: "success",
        }}
      />

      <StatCard
        icon={BoxIconLine}
        title="Orders"
        value="5,359"
        bgColor="indigo"
        badge={{
          icon: ArrowDownIcon,
          text: "3.85%",
          color: "danger",
        }}
      />

      <StatCard
        icon={DollarLineIcon}
        title="Sales"
        value="$12,430"
        bgColor="indigo"
        badge={{
          icon: ArrowUpIcon,
          text: "14.40%",
          color: "success",
        }}
      />

      <StatCard
        icon={TaskIcon}
        title="Pending"
        value="157"
        bgColor="indigo"
        badge={{
          icon: ArrowDownIcon,
          text: "3.10%",
          color: "warning",
        }}
      />
    </div>
  );
}
