import { useState } from "react";
import { toast } from "react-toastify";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useReceivePurchaseMutation } from "../../../features/purchases/purchasesApi";
import { Purchase } from "../../../types/purchase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase;
}

interface ReceiveItemState {
  item_id: number;
  quantity: number;
  warehouse_id: number;
}

export default function PurchaseReceiveModal({
  isOpen,
  onClose,
  purchase,
}: Props) {
  const [receivePurchase, { isLoading }] = useReceivePurchaseMutation();
  const [items, setItems] = useState<ReceiveItemState[]>(
    purchase.items.map((i) => ({
      item_id: i.id,
      quantity: i.quantity,
      warehouse_id: purchase.warehouse_id,
    }))
  );
  const [notes, setNotes] = useState("");

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = qty;
    setItems(updated);
  };

  const handleSubmit = async () => {
    try {
      await receivePurchase({
        id: purchase.id,
        body: {
          items: items,
          notes: notes || undefined,
        },
      }).unwrap();

      toast.success("Purchase items received successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to receive items");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Purchase Items"
      description="Review and enter the received quantities for this purchase order."
      className="max-w-2xl p-6 max-h-screen overflow-y-auto"
    >
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left font-medium">Product</th>
                <th className="p-3 text-left font-medium">Ordered Qty</th>
                <th className="p-3 text-left font-medium">Receive Qty</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, idx) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.product?.sku}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-gray-600">{item.quantity}</span>
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={items[idx].quantity}
                      onChange={(e) =>
                        handleQtyChange(idx, Number(e.target.value))
                      }
                      className="w-24"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes about this receipt..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <Button onClick={onClose} variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="primary" disabled={isLoading}>
          {isLoading ? "Processing..." : "Confirm Receive"}
        </Button>
      </div>
    </Modal>
  );
}
