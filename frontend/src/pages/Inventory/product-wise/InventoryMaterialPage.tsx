import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import InventoryListProductWise from "./InventoryListProductWise";

export default function InventoryMaterialPage() {

  return <>
    <PageMeta title="Inventory" description="Inventory Stock List" />
    <PageBreadcrumb pageTitle="Inventory" />

    <InventoryListProductWise productType="raw_material,component,consumable,packaging" />
  </>
}
