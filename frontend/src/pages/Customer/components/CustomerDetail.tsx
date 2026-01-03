import Loading from "../../../components/common/Loading";
import { useGetCustomerByIdQuery } from "../../../features/customer/customerApi";
import {
  DetailCard,
  HeaderSection,
  Info,
  MetricsCard,
  TableCard,
} from "./ReuseableComponent";
import SalesTable from "./SalesTable";

interface Props {
  customerId: string;
}

export default function CustomerDetail({ customerId }: Props) {
  const { data, isLoading, isError } = useGetCustomerByIdQuery(customerId);
  const customer = data?.data;

  if (isLoading) return <Loading message="Loading Customer..." />;

  if (isError || !customer)
    return <p className="p-6 text-red-500">Failed to load customer details.</p>;

  const sales = customer.sales || [];

  const summary = {
    totalSales: sales.length,
    totalAmount: sales.reduce((s: number, v: any) => s + Number(v.total), 0),
    totalPaid: sales.reduce(
      (s: number, v: any) => s + Number(v.paid_amount),
      0
    ),
    totalDue: sales.reduce(
      (s: number, v: any) => s + (Number(v.total) - Number(v.paid_amount)),
      0
    ),
  };

  return (
    <>
      <HeaderSection customer={customer} customerId={customerId} />

      <DetailCard title="Customer Information">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info label="Name" value={customer.name} />
          <Info label="Phone" value={customer.phone || "-"} />
          <Info label="Email" value={customer.email || "-"} />

          <Info label="Customer Group" value={customer.group?.name || "-"} />
          <Info label="Reward Points" value={customer.reward_points || 0} />
          <Info
            label="Status"
            value={
              <span
                className={`px-2 py-1 text-xs rounded ${
                  customer.status
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {customer.status ? "Active" : "Inactive"}
              </span>
            }
          />
          <Info
            label="Created At"
            value={new Date(customer.created_at).toLocaleDateString()}
          />
        </div>
      </DetailCard>

      {/* Billing Address */}
      <DetailCard title="Billing Address">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Info
            label="Contact Name"
            value={customer.billing_address?.contact_name || "-"}
          />
          <Info label="Phone" value={customer.billing_address?.phone || "-"} />
          <Info
            label="Street"
            value={customer.billing_address?.street || "-"}
          />
          <Info label="City" value={customer.billing_address?.city || "-"} />
          <Info
            label="Country"
            value={customer.billing_address?.country || "-"}
          />
        </div>
      </DetailCard>

      {/* Shipping Address */}
      <DetailCard title="Shipping Address">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Info
            label="Contact Name"
            value={customer.shipping_address?.contact_name || "-"}
          />
          <Info label="Phone" value={customer.shipping_address?.phone || "-"} />
          <Info
            label="Street"
            value={customer.shipping_address?.street || "-"}
          />
          <Info label="City" value={customer.shipping_address?.city || "-"} />
          <Info
            label="Country"
            value={customer.shipping_address?.country || "-"}
          />
        </div>
      </DetailCard>

      <DetailCard title="Account Information">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info label="Account Code" value={customer.account?.code} />
          <Info
            label="Account Number"
            value={customer.account?.account_number}
          />
          <Info label="Account Name" value={customer.account?.name} />
        </div>
      </DetailCard>

      <MetricsCard
        sales={summary.totalSales}
        paid={summary.totalPaid}
        due={summary.totalDue}
        total={summary.totalAmount}
      />

      <TableCard title="Sales History">
        <SalesTable sales={sales} />
      </TableCard>
    </>
  );
}
