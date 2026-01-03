import { Outlet } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

export default function CustomersReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers Report"
        subtitle="Generate and view customer reports"
      />
      <Outlet />
    </div>
  );
}
