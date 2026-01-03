import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import QuotationAnalytics from "./components/QuotationAnalytics";
import QuotationList from "./components/QuotationList";

export default function QuotationPage() {
  return (
    <>
      <PageMeta title="Quotations" description="Manage your quotations" />
      <PageBreadcrumb pageTitle="Quotations" />
      <QuotationAnalytics />
      <QuotationList />
    </>
  );
}
