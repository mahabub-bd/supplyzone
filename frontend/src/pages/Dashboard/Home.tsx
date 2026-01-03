import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import Last30DaysSalesChart from "../../components/ecommerce/Last30DaysSalesChart";
import YearlyMonthWiseSalesChart from "../../components/ecommerce/YearlyMonthWiseSalesChart";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Smart Sale POS | React Admin Dashboard | smartsalepos.shop"
        description="Smart Sale POS — a modern React.js and Tailwind CSS admin dashboard for managing sales, inventory, roles, and users. Visit smartsalepos.shop for more details."
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 ">
          <EcommerceMetrics />
        </div>

        {/* New Analytics Charts */}
        <div className="col-span-12">
          <Last30DaysSalesChart />
        </div>

        <div className="col-span-12">
          <YearlyMonthWiseSalesChart />
        </div>
      </div>
    </>
  );
}
