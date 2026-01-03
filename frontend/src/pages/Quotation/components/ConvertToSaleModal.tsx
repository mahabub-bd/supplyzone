import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

import Loading from "../../../components/common/Loading";
import { useGetAccountsQuery } from "../../../features/accounts/accountsApi";
import { useConvertQuotationToSaleMutation } from "../../../features/quotation/quotationApi";

// 🛡️ Validation Schema
const convertToSaleSchema = (total: number) =>
  z
    .object({
      sale_date: z.string().min(1, "Sale date is required"),
      notes: z.string().optional(),
      payment_method: z.enum(["cash", "bank", "mobile"]).optional(),
      paid_amount: z
        .number()
        .min(0, "Paid amount must be 0 or greater")
        .refine((value) => value <= total, {
          message: `Paid amount cannot exceed total ${total}`,
        }),
      payment_account_code: z.string().optional(),
    })
    .refine(
      (data) => {
        // If payment_method is selected, payment_account_code is required
        if (data.payment_method && !data.payment_account_code) {
          return false;
        }
        return true;
      },
      {
        message: "Payment account is required when payment method is selected",
        path: ["payment_account_code"],
      }
    );

export type ConvertToSaleFormValues = z.infer<
  ReturnType<typeof convertToSaleSchema>
>;

interface ConvertToSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: any;
  onSuccess?: (sale: any) => void;
}

export default function ConvertToSaleModal({
  isOpen,
  onClose,
  quotation,
  onSuccess,
}: ConvertToSaleModalProps) {
  const [convertQuotation, { isLoading }] = useConvertQuotationToSaleMutation();
  const [includePayment, setIncludePayment] = useState(false);

  const { data: accountsData } = useGetAccountsQuery({
    type: "asset",
    isCash: true,
    isBank: true,
  });
  const accounts = accountsData?.data || [];

  const totalAmount = quotation ? Number(quotation.total || 0) : 0;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConvertToSaleFormValues>({
    resolver: zodResolver(convertToSaleSchema(totalAmount)),
    defaultValues: {
      sale_date: new Date().toISOString().split("T")[0], // Today's date
      notes: quotation
        ? `Converted from quotation ${quotation.quotation_no}`
        : "",
      paid_amount: 0,
      payment_method: undefined,
      payment_account_code: "",
    },
  });

  const paidAmount = watch("paid_amount");
  const selectedMethod = watch("payment_method");

  const filteredAccounts = accounts.filter((acc: any) =>
    selectedMethod === "cash"
      ? acc.isCash
      : selectedMethod === "bank"
      ? acc.isBank
      : false
  );

  useEffect(() => {
    if (paidAmount > 0) {
      setIncludePayment(true);
    } else {
      setIncludePayment(false);
      setValue("payment_method", undefined);
      setValue("payment_account_code", "");
    }
  }, [paidAmount, setValue]);


  if (!isOpen) return null;

  if (!quotation) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
        <Loading message="Loading quotation details..." />
      </Modal>
    );
  }

  // 🚀 Submit conversion
  const onSubmit = async (values: ConvertToSaleFormValues) => {
    try {
      // Base payload with required fields
      const payloadBody: any = {
        sale_date: values.sale_date,
        notes: values.notes,
      };

      // Add payments array if payment is included
      if (
        includePayment &&
        values.paid_amount > 0 &&
        values.payment_method &&
        values.payment_account_code
      ) {
        payloadBody.payments = [
          {
            method: values.payment_method,
            amount: values.paid_amount,
            account_code: values.payment_account_code,
          },
        ];
      }

      const payload = {
        id: quotation.id,
        body: payloadBody,
      };

      const result = await convertQuotation(payload).unwrap();

      toast.success("Quotation converted to sale successfully!");

      // If payment is included, show additional success info
      if (includePayment && values.paid_amount > 0) {
        const isFullPayment = values.paid_amount === totalAmount;
        toast.info(
          `Payment of ${values.paid_amount} recorded (${
            isFullPayment ? "Full" : "Partial"
          } payment)`
        );
      }

      onSuccess?.(result.data);
      onClose();
    } catch (error: any) {
      console.error("Failed to convert quotation:", error);
      toast.error(error.data?.message || "Failed to convert quotation");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Convert to Sale — Quotation #${quotation?.quotation_no}`}
      className="max-w-lg"
      showCloseButton={true}
    >
      <div className="space-y-4">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">
              Quotation Total:
            </span>
            <span className="text-sm font-bold text-blue-900">
              {new Intl.NumberFormat("en-BD", {
                style: "currency",
                currency: "BDT",
              }).format(totalAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-900">Customer:</span>
            <span className="text-sm text-blue-900">
              {quotation?.customer?.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 📅 Sale Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Date
            </label>
            <Input
              type="date"
              error={!!errors.sale_date}
              hint={errors.sale_date?.message}
              {...register("sale_date")}
            />
          </div>

          {/* 💸 Payment Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Include Payment
              </label>
              <input
                type="checkbox"
                checked={includePayment}
                onChange={(e) => {
                  setIncludePayment(e.target.checked);
                  if (!e.target.checked) {
                    setValue("paid_amount", 0);
                    setValue("payment_method", undefined);
                    setValue("payment_account_code", "");
                  }
                }}
                className="rounded border-gray-300"
              />
            </div>

            {includePayment && (
              <div className="space-y-3">
                {/* 💰 Paid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid Amount
                  </label>
                  <Input
                    type="number"
                    placeholder={`Enter amount (max: ${totalAmount})`}
                    error={!!errors.paid_amount}
                    hint={errors.paid_amount?.message}
                    {...register("paid_amount", { valueAsNumber: true })}
                  />
                </div>

                {/* 💳 Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <Controller
                    name="payment_method"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={[
                          { value: "cash", label: "Cash" },
                          { value: "bank", label: "Bank" },
                          { value: "mobile", label: "bKash" },
                        ]}
                        placeholder="Select Payment Method"
                        defaultValue={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          setValue("payment_account_code", "");
                        }}
                      />
                    )}
                  />
                </div>

                {/* 🏦 Payment Account */}
                {selectedMethod && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Account
                    </label>
                    <Controller
                      name="payment_account_code"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={filteredAccounts.map((acc: any) => ({
                            value: acc.code,
                            label: `${acc.name} - ${acc.code}${
                              acc.account_number
                                ? ` - ${acc.account_number}`
                                : ""
                            }`,
                          }))}
                          placeholder="Select Account"
                          defaultValue={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 📝 Notes */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextArea
                placeholder="Enter notes for this sale..."
                rows={3}
                value={field.value || ""}
                onChange={field.onChange}
                error={!!errors.notes}
                hint={errors.notes?.message}
              />
            )}
          />

          {/* 🔘 Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isLoading}>
              {isLoading ? "Converting..." : "Convert to Sale"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
