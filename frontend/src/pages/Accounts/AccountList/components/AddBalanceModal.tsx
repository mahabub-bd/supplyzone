import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { FormField } from "../../../../components/form/form-elements/SelectFiled";
import Input from "../../../../components/form/input/InputField";
import Button from "../../../../components/ui/button/Button";
import { Modal } from "../../../../components/ui/modal";
import { useAddBankBalanceMutation } from "../../../../features/accounts/accountsApi";
import AccountInfo from "./AccountInfo";

const addBankBalanceSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  narration: z.string().optional(),
});

type AddBalanceFormValues = z.infer<typeof addBankBalanceSchema>;

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any; // contains code, name, balance
}

export default function AddBalanceModal({
  isOpen,
  onClose,
  account,
}: AddBalanceModalProps) {
  const [addBankBalance, { isLoading }] = useAddBankBalanceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddBalanceFormValues>({
    resolver: zodResolver(addBankBalanceSchema),
    defaultValues: { amount: 0, narration: "" },
  });

  const onSubmit = async (values: AddBalanceFormValues) => {
    try {
      await addBankBalance({
        bankAccountCode: account.code,
        amount: values.amount,
        narration: values.narration || "",
      }).unwrap();

      toast.success(`Balance added to ${account.name}`);
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add balance");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl min-h-75 max-h-screen overflow-y-auto"
    >
      <h2 className="text-lg font-semibold mb-3">Add Balance</h2>

      <AccountInfo account={account} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Amount *" error={errors.amount?.message}>
          <Input
            type="number"
            placeholder="Enter Amount"
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
            {isLoading ? "Saving..." : "Add Balance"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
