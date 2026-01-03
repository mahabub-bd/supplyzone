import { z } from "zod";
import { PaymentTerm } from "../../../types";
import { PurchaseOrderStatus } from "../../../types/purchase";

export const purchaseItemSchema = z.object({
  product_id: z.coerce.number().min(0, "Product is required"),

  quantity: z.coerce.number().min(0, "Quantity is required"),
  unit_price: z.coerce.number().min(0, "Unit price is required"),
  discount_per_unit: z.coerce
    .number()
    .min(0, "Discount per unit cannot be negative")
    .optional(),
  tax_rate: z.coerce.number().min(0, "Tax rate cannot be negative").optional(),
});

export const purchaseSchema = z.object({
  supplier_id: z.coerce.number().min(0, "Supplier is required"),
  warehouse_id: z.coerce.number().min(0, "Warehouse is required"),
  expected_delivery_date: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  payment_term: z.nativeEnum(PaymentTerm).default(PaymentTerm.NET_30),
  custom_payment_days: z.coerce.number().min(0).optional(),
  status: z.nativeEnum(PurchaseOrderStatus).default(PurchaseOrderStatus.DRAFT),
  tax_amount: z.coerce
    .number()
    .min(0, "Tax amount cannot be negative")
    .optional(),
  discount_amount: z.coerce
    .number()
    .min(0, "Discount amount cannot be negative")
    .optional(),
  items: z.array(purchaseItemSchema).min(1, "At least 1 item is required"),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
