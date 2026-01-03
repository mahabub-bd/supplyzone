import { BookOpen, Pencil } from "lucide-react";
import { Link } from "react-router";
import IconButton from "../../../components/common/IconButton";
import { useHasPermission } from "../../../hooks/useHasPermission";

const HeaderSection = ({ customer, customerId }: any) => {
  const canUpdate = useHasPermission("customer.update");

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-semibold">
        Customer Details {customer?.name}
      </h1>
      <div className="flex gap-2">
        <Link to={`/customers/${customerId}/ledger`}>
          <IconButton icon={BookOpen} tooltip="View Ledger" color="purple" />
        </Link>
        {canUpdate && (
          <Link to={`/customers/${customerId}/edit`}>
            <IconButton icon={Pencil} tooltip="Edit" color="blue" />
          </Link>
        )}
      </div>
    </div>
  );
};

const DetailCard = ({ title, children }: any) => (
  <div className="bg-white shadow-sm rounded-xl border p-4 mb-4">
    <h2 className="text-lg font-medium mb-3">{title}</h2>
    {children}
  </div>
);

const TableCard = ({ title, children }: any) => (
  <DetailCard title={title}>
    <div className="overflow-x-auto">{children}</div>
  </DetailCard>
);

const Info = ({ label, value }: { label: string; value: any }) => (
  <div className="flex gap-4">
    <p className="text-gray-500 text-xs uppercase">{label}</p>
    <p className=" font-medium">{value}</p>
  </div>
);

const MetricsCard = ({ sales, paid, due, total }: any) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4 grid grid-cols-4 gap-4 text-center">
    <Metric label="Sales" value={sales} color="text-blue-600" />
    <Metric label="Total Amount" value={total} color="text-gray-800" />
    <Metric label="Paid" value={paid} color="text-green-600" />
    <Metric label="Due" value={due} color="text-red-600" />
  </div>
);

const Metric = ({ label, value, color }: any) => (
  <div>
    <p className="text-xs text-gray-500 uppercase">{label}</p>
    <p className={`text-lg font-bold ${color}`}>
      {Number(value).toLocaleString()}
    </p>
  </div>
);

export { DetailCard, HeaderSection, Info, Metric, MetricsCard, TableCard };

