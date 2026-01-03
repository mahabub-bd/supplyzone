import { useParams } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import PurchaseForm from "./PurchaseForm";

export default function PurchaseEdit() {
  const { id } = useParams();

  return (
    <div>
      <PageMeta title="Edit Purchase" description="Edit Purchase Page" />
      <PageBreadcrumb pageTitle="Edit Purchase" />

      <div className="bg-white border rounded-xl p-6">
        <PurchaseForm mode="edit" purchaseId={id!} />
      </div>
    </div>
  );
}
