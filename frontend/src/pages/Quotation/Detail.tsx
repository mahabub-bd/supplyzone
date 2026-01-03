import { useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import QuotationDetail from "./components/QuotationDetail";

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Quotation ID is required</div>;
  }

  return (
    <>
      <PageMeta title="Quotation Details" description="View quotation details" />
      <PageBreadcrumb pageTitle="Quotation Details" />
      <QuotationDetail id={id} />
    </>
  );
}