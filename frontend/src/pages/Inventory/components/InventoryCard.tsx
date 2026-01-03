import { InventoryItem } from "../../../types/inventory";

export default function InventoryCard({ item }: { item: InventoryItem }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <h3 className="font-semibold">{item.product.name}</h3>
      <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>

      <div className="mt-2">
        <p>Warehouse: {item.warehouse.name}</p>
        <p>Batch: {item.batch_no}</p>
        <p>Quantity: {item.quantity}</p>
      </div>
    </div>
  );
}
