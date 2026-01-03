import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import QuotationForm from "./components/QuotationForm";

export default function QuotationCreate() {
  return (
    <>
      <PageBreadcrumb pageTitle="Create Quotation" />
      <QuotationForm mode="create" />
    </>
  );
}