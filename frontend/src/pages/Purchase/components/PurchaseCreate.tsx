import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import PurchaseForm from "./PurchaseForm";

export default function PurchaseCreate() {
  const navigate = useNavigate();
  return (
    <div>
      <PageMeta title="Create Purchase" description="Create Purchase Page" />
      <PageBreadcrumb pageTitle="Create Purchase" />
      <div className="flex  justify-end my-4">
        <Button size="sm" onClick={() => navigate("/purchase")}>
          <ArrowLeft size={20} />
          Purchase List
        </Button>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <PurchaseForm mode="create" />
      </div>
    </div>
  );
}
