import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import Input from "../../../../components/form/input/InputField";
import { FormField } from "../../../../components/form/form-elements/SelectFiled";
import Button from "../../../../components/ui/button/Button";
import { Modal } from "../../../../components/ui/modal";
import { useAddCashMutation } from "../../../../features/accounts/accountsApi";
import AccountInfo from "./AccountInfo";

// Validation Schema
const addCashSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  narration: z.string().optional(),
});

type AddCashFormValues = z.infer<typeof addCashSchema>;

interface AddCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any; // contains code, name, balance
}

export default function AddCashModal({
  isOpen,
  onClose,
  account,
}: AddCashModalProps) {
  const [addCash, { isLoading }] = useAddCashMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCashFormValues>({
    resolver: zodResolver(addCashSchema),
    defaultValues: { amount: 0, narration: "" },
  });

  const onSubmit = async (values: AddCashFormValues) => {
    try {
      await addCash({ ...values, narration: values.narration || "" }).unwrap();
      toast.success("Cash added successfully!");
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add cash");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6 min-h-[300px] max-h-screen overflow-y-auto"
    >
      <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
        💵 Add Cash
      </h2>
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

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Add Cash"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
