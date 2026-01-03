import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

import Loading from "../../../components/common/Loading";
import { useGetAccountsQuery } from "../../../features/accounts/accountsApi";
import { useCreatePaymentMutation } from "../../../features/payment/paymentApi";

// 🛡️ Validation Schema
const paymentSchema = (due: number) =>
  z.object({
    amount: z
      .number()
      .positive("Amount must be greater than 0")
      .refine((value) => value <= due, {
        message: `Amount cannot exceed ${due}`,
      }),
    method: z.enum(["cash", "bank"]),
    payment_account_code: z.string().min(1, "Payment account is required"),
    note: z.string().optional(),
  });

export type PaymentFormValues = z.infer<ReturnType<typeof paymentSchema>>;

export default function SalePaymentModal({ isOpen, onClose, sale }: any) {
  const [salePayment, { isLoading }] = useCreatePaymentMutation();

  // 🚫 Don't render if modal is closed
  if (!isOpen) return null;

  // 🧠 Handle sale data loading
  if (!sale) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
        <Loading message="Loading sale details..." />
      </Modal>
    );
  }

  // 🔢 Correct due amount calculation
  const total = parseFloat(sale?.total ?? "0");
  const paid = parseFloat(sale?.paid_amount ?? "0");
  const dueAmount = total - paid;

  // 🔎 Debug if needed
  // console.log({ total, paid, dueAmount });

  // ⛔ If no outstanding payment
  if (dueAmount <= 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">No Pending Due</h2>
          <p className="text-gray-600">
            There is no outstanding amount to pay.
          </p>
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // 🔍 Get accounts
  const { data: accountsData } = useGetAccountsQuery({
    type: "asset",
    isCash: true,
    isBank: true,
  });
  const accounts = accountsData?.data || [];

  // 🧾 Setup form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema(dueAmount)),
    defaultValues: {
      amount: dueAmount, // Auto full payment
      method: undefined as any,
      payment_account_code: "",
      note: "",
    },
  });

  const amount = watch("amount");
  const selectedMethod = watch("method");

  // 📝 Auto note
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

  // 🏦 Account filter
  const filteredAccounts = accounts.filter((acc: any) =>
    selectedMethod === "cash"
      ? acc.isCash
      : selectedMethod === "bank"
      ? acc.isBank
      : false
  );

  // 🚀 Submit payment
  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await salePayment({
        type: "customer",
        customer_id: sale.customer?.id,
        sale_id: sale.id,
        amount: values.amount,
        method: values.method,
        payment_account_code: values.payment_account_code,
        note: values.note,
      }).unwrap();

      toast.success("Payment successful");
      onClose();
    } catch {
      toast.error("Payment failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pay Due — Sale #${sale?.invoice_no}`}
      className="max-w-md"
      showCloseButton={true}
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 💰 Amount */}
          <Input
            type="number"
            placeholder={`Due: ${dueAmount}`}
            error={!!errors.amount}
            hint={errors.amount?.message}
            {...register("amount", { valueAsNumber: true })}
          />

          {/* 💳 Payment Method */}
          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "bank", label: "Bank" },
                  { value: "mobile", label: "Mobile" },
                ]}
                placeholder="Select Method"
                defaultValue={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("payment_account_code", "");
                }}
              />
            )}
          />

          {/* 🏦 Payment Account */}
          {selectedMethod && (
            <Controller
              name="payment_account_code"
              control={control}
              render={({ field }) => (
                <Select
                  options={filteredAccounts.map((acc: any) => ({
                    value: acc.code,
                    label: `${acc.name} - ${acc.code}${
                      acc.account_number ? ` - ${acc.account_number}` : ""
                    }`,
                  }))}
                  placeholder="Select Account"
                  defaultValue={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
          )}

          {/* 📝 Note */}
          <Input
            type="text"
            placeholder="Note"
            error={!!errors.note}
            hint={errors.note?.message}
            {...register("note")}
          />

          {/* 🔘 Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Make Payment"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
