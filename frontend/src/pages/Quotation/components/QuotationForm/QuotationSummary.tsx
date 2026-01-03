interface QuotationSummaryProps {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function QuotationSummary({
  subtotal,
  discount,
  tax,
  total,
}: QuotationSummaryProps) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-medium">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span className="font-medium text-red-600">
            -৳{discount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span className="font-medium text-blue-600">
            +৳{tax.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-2 border-t">
          <span>Total:</span>
          <span className="text-green-600">
            ৳{total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}