import { Info, Minus, Plus, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

import { formatCurrencyEnglish, formatDateTime } from "../../utlis";

import { FormField } from "../../components/form/form-elements/SelectFiled";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { CashInPayload, CashOutPayload } from "../../types/cashregister";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { useCashInMutation, useCashOutMutation, useGetCashRegisterByIdQuery } from "../../features/cash-register/cashRegisterApi";

interface CashRegisterSidebarProps {
  cashRegisterId: number;
  onTransactionComplete?: () => void;
}

const CashRegisterSidebar: React.FC<CashRegisterSidebarProps> = ({
  cashRegisterId,
  onTransactionComplete,
}) => {
  const [showCashInModal, setShowCashInModal] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);

  // Get cash register details
  const {
    data: registerResponse,
    isLoading,
    refetch,
  } = useGetCashRegisterByIdQuery(cashRegisterId);
  const register = registerResponse?.data;

  // Mutations
  const [cashIn, { isLoading: isCashingIn }] = useCashInMutation();
  const [cashOut, { isLoading: isCashingOut }] = useCashOutMutation();

  const handleCashIn = async (data: CashInPayload) => {
    try {
      await cashIn({ id: cashRegisterId, data }).unwrap();
      toast.success("Cash added successfully!");
      setShowCashInModal(false);
      refetch();
      onTransactionComplete?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add cash");
    }
  };

  const handleCashOut = async (data: CashOutPayload) => {
    try {
      await cashOut({ id: cashRegisterId, data }).unwrap();
      toast.success("Cash removed successfully!");
      setShowCashOutModal(false);
      refetch();
      onTransactionComplete?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove cash");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!register) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <Info className="h-8 w-8 mx-auto mb-2" />
        <p>Cash register not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Register Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {register.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {register.register_code}
            </span>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Balance
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrencyEnglish(Number(register.current_balance))}
            </p>
          </div>

          {register.opened_at && (
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Opened:</span>
                <span>{formatDateTime(register.opened_at)}</span>
              </div>
              {register.opened_by && (
                <div className="flex justify-between">
                  <span>By:</span>
                  <span>{register.opened_by.full_name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowCashInModal(true)}
          disabled={register.status !== "open"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Cash In
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowCashOutModal(true)}
          disabled={register.status !== "open"}
        >
          <Minus className="h-4 w-4 mr-2" />
          Cash Out
        </Button>

        {register.status === "open" && (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              Register Open
            </span>
          </div>
        )}
      </div>

      {/* Cash In Modal */}
      <Modal
        isOpen={showCashInModal}
        onClose={() => setShowCashInModal(false)}
        title="Add Cash"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleCashIn({
              amount: parseFloat(formData.get("amount") as string),
              notes: formData.get("notes") as string,
            });
          }}
          className="space-y-4"
        >
          <FormField label="Amount">
            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Notes (Optional)">
            <textarea
              name="notes"
              rows={3}
              placeholder="Enter notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCashInModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCashingIn} variant="primary">
              {isCashingIn ? "Adding..." : "Add Cash"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cash Out Modal */}
      <Modal
        isOpen={showCashOutModal}
        onClose={() => setShowCashOutModal(false)}
        title="Remove Cash"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleCashOut({
              amount: parseFloat(formData.get("amount") as string),
              description: formData.get("reason") as string,
              notes: formData.get("notes") as string,
            });
          }}
          className="space-y-4"
        >
          <FormField label="Amount">
            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              max={Number(register.current_balance)}
              required
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum: {formatCurrencyEnglish(Number(register.current_balance))}
            </p>
          </FormField>
          <FormField label="Reason">
            <Select
              placeholder="Reason"
              options={[
                { value: "", label: "Select a reason" },
                { value: "petty_cash", label: "Petty Cash" },
                { value: "change_fund", label: "Change Fund" },
                { value: "emergency", label: "Emergency" },
                { value: "other", label: "Other" },
              ]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="Notes (Optional)">
            <textarea
              name="notes"
              rows={3}
              placeholder="Enter notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCashOutModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCashingOut} variant="primary">
              {isCashingOut ? "Removing..." : "Remove Cash"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CashRegisterSidebar;
