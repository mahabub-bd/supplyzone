import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select"; // 👈 use your Select
import Button from "../../../components/ui/button/Button";

import { Modal } from "../../../components/ui/modal";
import { useGetAccountsQuery } from "../../../features/accounts/accountsApi";
import { useCreatePaymentMutation } from "../../../features/payment/paymentApi";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be > 0"),
  method: z.enum(["cash", "bank", "mobile"]),
  payment_account_code: z.string().min(1, "Payment account is required"),
  note: z.string().optional(),
});

const paymentSchemaWithLimit = (due: number) =>
  paymentSchema.refine((data) => data.amount <= due, {
    message: `Amount cannot exceed ${due}`,
    path: ["amount"],
  });

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PurchasePaymentModal({
  isOpen,
  onClose,
  purchase,
}: any) {
  const [purchasePayment, { isLoading }] = useCreatePaymentMutation();
  const dueAmount = Number(purchase?.due_amount) || 0;

  const { data: accountsData } = useGetAccountsQuery({
    type: "asset",
    isCash: true,
    isBank: true,
  });
  const accounts = accountsData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchemaWithLimit(dueAmount)),
    defaultValues: {
      method: "cash",
      payment_account_code: "",
      note: "",
    },
  });

  const amount = watch("amount");
  const selectedMethod = watch("method");

  useEffect(() => {
    if (!amount) return;
    const isFullPayment = Number(amount) === dueAmount;
    const autoNote = isFullPayment ? "Full payment" : "Partial payment";

    if (
      !watch("note") ||
      ["Full payment", "Partial payment"].includes(watch("note") || "")
    ) {
      setValue("note", autoNote);
    }
  }, [amount, dueAmount, setValue, watch]);

  const filteredAccounts = accounts.filter((acc: any) =>
    selectedMethod === "cash"
      ? acc.isCash
      : selectedMethod === "bank"
      ? acc.isBank
      : false
  );

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await purchasePayment({
        type: "supplier",
        supplier_id: purchase.supplier_id,
        purchase_id: purchase.id,
        amount: values.amount,
        method: values.method,
        payment_account_code: values.payment_account_code,
        note: values.note,
      }).unwrap();

      toast.success("Payment successful");
      onClose();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.data?.message || "Payment failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Payment"
      description="Provide the payment details to complete this purchase."
      className="max-w-lg p-6 min-h-[400px] max-h-screen overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* 💰 Amount */}
        <Input
          type="number"
          placeholder={`Due: ${dueAmount}`}
          error={!!errors.amount}
          hint={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />

        {/* 💳 Payment Method */}
        <div>
          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "bank", label: "Bank & MFS" },
                ]}
                placeholder="Select Method"
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          {errors.method && (
            <p className="mt-1 text-sm text-red-600">{errors.method.message}</p>
          )}
        </div>

        {/* 🏦 Payment Account */}
        {selectedMethod && (
          <div>
            <Controller
              name="payment_account_code"
              control={control}
              render={({ field }) => (
                <Select
                  options={filteredAccounts.map((acc: any) => ({
                    value: acc.code,
                    label: `${acc.name} - ${acc.code}`,
                  }))}
                  placeholder="Select Account"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
            {errors.payment_account_code && (
              <p className="mt-1 text-sm text-red-600">
                {errors.payment_account_code.message}
              </p>
            )}
          </div>
        )}

        {/* 📝 Note */}
        <Input
          type="text"
          placeholder="Note"
          error={!!errors.note}
          hint={errors.note?.message}
          {...register("note")}
        />
      </form>

      <div className="flex justify-end gap-2 mt-4">
        <Button size="sm" variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={
            isLoading || !selectedMethod || !watch("payment_account_code")
          }
          onClick={handleSubmit(onSubmit)}
        >
          {isLoading ? "Processing..." : "Pay"}
        </Button>
      </div>
    </Modal>
  );
}
