import { QuotationFormValues } from "../quotationSchema";

export function useQuotationCalculations(
  items: QuotationFormValues["items"],
  products: any[],
  discountType: string,
  discountValue: number,
  taxPercentage: number
) {
  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const product = products.find((p) => p.id === item.product_id);
      const price = item.unit_price || Number(product?.selling_price) || 0;
      const discount = (price * (item.discount_percentage || 0)) / 100;
      const itemTotal = (price - discount) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * taxPercentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  return {
    subtotal: calculateSubtotal(),
    discount: calculateDiscount(),
    tax: calculateTax(),
    total: calculateTotal(),
  };
}
