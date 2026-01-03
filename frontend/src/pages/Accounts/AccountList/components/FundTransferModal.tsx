import Select from "../../../../components/form/Select";
import Input from "../../../../components/form/input/InputField";
import { FormField } from "../../../../components/form/form-elements/SelectFiled";
import Button from "../../../../components/ui/button/Button";
import { Modal } from "../../../../components/ui/modal";
import {
  useFundTransferMutation,
  useGetAccountsQuery,
} from "../../../../features/accounts/accountsApi";

interface FundTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromAccount: any;
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AccountInfo from "./AccountInfo";
import { fundTransferSchema } from "./formSchema";

export default function FundTransferModal({
  isOpen,
  onClose,
  fromAccount,
}: FundTransferModalProps) {
  const { data } = useGetAccountsQuery(undefined);
  const accounts = data?.data || [];
  const [fundTransfer, { isLoading }] = useFundTransferMutation();

  const filteredAccounts = accounts.filter(
    (acc: any) => acc.code !== fromAccount.code && (acc.isBank || acc.isCash)
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(fundTransferSchema),
    defaultValues: {
      toAccountCode: "",
      amount: 0,
      narration: "",
    },
  });

  const onSubmit = async (values: any) => {
    // 🔐 Prevent insufficient balance
    if (values.amount > fromAccount.balance) {
      toast.error("Insufficient balance for transfer");
      return;
    }

    try {
      await fundTransfer({
        fromAccountCode: fromAccount.code,
        toAccountCode: values.toAccountCode,
        amount: Number(values.amount),
        narration: values.narration || "",
      }).unwrap();

      toast.success("Fund transfer successful!");
      reset();
      onClose();
    } catch (err) {
      toast.error((err as any)?.data?.message || "Failed to transfer");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6 min-h-[400px] max-h-screen overflow-y-auto"
    >
      <h2 className="text-lg font-semibold mb-3">Fund Transfer</h2>

      <AccountInfo account={fromAccount} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="To Account *" error={errors.toAccountCode?.message as string}>
          <Controller
            name="toAccountCode"
            control={control}
            render={({ field }) => (
              <Select
                options={filteredAccounts.map(
                  (acc: { code: any; name: any }) => ({
                    value: acc.code,
                    label: `${acc.name} (${acc.code})`,
                  })
                )}
                placeholder="Select Account"
                defaultValue=""
                onChange={field.onChange}
              />
            )}
          />
        </FormField>

        <FormField label="Amount *" error={errors.amount?.message}>
          <Input
            type="number"
            placeholder="Amount"
            {...register("amount", { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Narration">
          <Input
            type="text"
            placeholder="Narration (Optional)"
            {...register("narration")}
          />
        </FormField>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Transfer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
