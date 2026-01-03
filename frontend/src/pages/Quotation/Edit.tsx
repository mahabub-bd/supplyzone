import { useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import QuotationForm from "./components/QuotationForm";

export default function QuotationEdit() {
  const { id } = useParams();

  return (
    <>
      <PageMeta title="Edit Quotation" description="Edit Quotation Page" />
      <PageBreadcrumb pageTitle="Edit Quotation" />
      <div className="bg-white border rounded-xl p-6">
        <QuotationForm mode="edit" quotationId={id!} />
      </div>
    </>
  );
}