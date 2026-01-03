import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Expense } from "../../../types/expenses";
import { ExpenseFormValues, expenseSchema } from "./expenseSchema";

import Select from "../../../components/form/Select";

// API hooks
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useGetAccountsQuery } from "../../../features/accounts/accountsApi";
import { useGetBranchesQuery } from "../../../features/branch/branchApi";
import { useGetExpenseCategoriesQuery } from "../../../features/expense-category/expenseCategoryApi";
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from "../../../features/expenses/expensesApi";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null; // null = create
}

export default function ExpenseFormModal({
  isOpen,
  onClose,
  expense,
}: ExpenseFormModalProps) {
  const { data: categoryData } = useGetExpenseCategoriesQuery({});
  const categories = categoryData?.data || [];

  const { data: branchData } = useGetBranchesQuery();
  const branches = branchData?.data || [];

  const { data: accountsData } = useGetAccountsQuery({
    isCash: true,
    isBank: true,
  });
  const accounts = accountsData?.data || [];

  const [createExpense, { isLoading: creating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      category_id: 0,
      branch_id: 0,
      payment_method: "cash",
      account_code: "",
    },
  });

  const isLoading = creating || updating;
  const isEdit = !!expense;

  /** Prefill when editing */
  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title || "",
        description: expense.description || "",
        amount: expense.amount ? parseFloat(expense.amount) : 0,
        category_id: expense.category_id || 0,
        branch_id: expense.branch_id || 0,
        payment_method:
          expense.payment_method === "cash" || expense.payment_method === "bank"
            ? expense.payment_method
            : "cash",
        account_code: expense.account_code || "",
      });
    } else {
      // Reset to default values when creating new expense
      reset({
        title: "",
        description: "",
        amount: 0,
        category_id: 0,
        branch_id: 0,
        payment_method: "cash",
        account_code: "",
      });
    }
  }, [expense, reset]);

  /** FORM SUBMIT */
  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      const payload = { ...values };

      if (expense) {
        await updateExpense({ id: expense.id, body: payload }).unwrap();
        toast.success("Expense updated successfully");
      } else {
        await createExpense(payload).unwrap();
        toast.success("Expense created successfully");
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save expense");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-6"
      title={expense ? "Edit Expense" : "Create Expense"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <FormField label="Title *" error={errors.title?.message}>
          <Input {...register("title")} />
        </FormField>

        {/* Description */}
        <FormField label="Description" error={errors.description?.message}>
          <Input {...register("description")} />
        </FormField>

        {/* Amount */}
        <FormField label="Amount *" error={errors.amount?.message}>
          <Input
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
          />
        </FormField>

        {/* Category + Branch */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category *" error={errors.category_id?.message}>
            <Select
              options={categories.map((c: any) => ({
                value: String(c.id),
                label: c.name,
              }))}
              value={watch("category_id") ? String(watch("category_id")) : ""}
              onChange={(v) =>
                setValue("category_id", Number(v), { shouldValidate: true })
              }
            />
          </FormField>

          <FormField label="Branch *" error={errors.branch_id?.message}>
            <Select
              options={branches.map((b: any) => ({
                value: String(b.id),
                label: b.name,
              }))}
              value={watch("branch_id") ? String(watch("branch_id")) : ""}
              onChange={(v) =>
                setValue("branch_id", Number(v), { shouldValidate: true })
              }
            />
          </FormField>
        </div>

        {/* Payment Method + Account */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Payment Method *">
            <Select
              options={[
                { value: "cash", label: "Cash" },
                { value: "bank", label: "Bank" },
              ]}
              value={watch("payment_method")}
              onChange={(v) => {
                setValue("payment_method", v as any, { shouldValidate: true });

                // Reset account field when method changes
                setValue("account_code", "", { shouldValidate: true });
              }}
            />
          </FormField>

          <FormField label="Account *" error={errors.account_code?.message}>
            {/* Filter Accounts Automatically */}
            <Select
              options={accounts
                .filter((acc: any) =>
                  watch("payment_method") === "cash" ? acc.isCash : acc.isBank
                )
                .map((a: any) => ({
                  value: a.code,
                  label: `${a.name} (${a.code})`,
                }))}
              value={watch("account_code") || ""}
              onChange={(v) =>
                setValue("account_code", v, { shouldValidate: true })
              }
            />
          </FormField>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Expense"
              : "Create Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
