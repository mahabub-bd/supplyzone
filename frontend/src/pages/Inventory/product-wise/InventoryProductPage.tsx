import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import InventoryListProductWise from "./InventoryListProductWise";

export default function InventoryProductPage() {

  return (
    <>
      <PageMeta title="Inventory" description="Inventory Stock List" />
      <PageBreadcrumb pageTitle="Inventory" />

      <InventoryListProductWise productType="finished_good,resale" />
    </>
  );
}
