import { Lock, Minus, Plus, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

import Loading from "../../components/common/Loading";
import {
  FormField,
  SelectField,
} from "../../components/form/form-elements/SelectFiled";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import {
  useAdjustBalanceMutation,
  useCashInMutation,
  useCashOutMutation,
  useCloseCashRegisterMutation,
  useGetCashRegisterByIdQuery,
  useGetCashRegistersQuery,
} from "../../features/cash-register/cashRegisterApi";

import { formatCurrencyEnglish, formatDateTime } from "../../utlis";
import { AdjustBalancePayload, CashInPayload, CashOutPayload } from "../../types/cashregister";

const CashRegisterOperationsPage: React.FC = () => {
  const [selectedRegister, setSelectedRegister] = useState<number | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCashInModal, setShowCashInModal] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Mutations
  const [closeCashRegister, { isLoading: isClosing }] =
    useCloseCashRegisterMutation();
  const [cashIn, { isLoading: isCashingIn }] = useCashInMutation();
  const [cashOut, { isLoading: isCashingOut }] = useCashOutMutation();
  const [adjustBalance, { isLoading: isAdjusting }] =
    useAdjustBalanceMutation();

  // Query registers
  const { data: registersResponse, isLoading: registersLoading } =
    useGetCashRegistersQuery({
      status: "open",
    });

  const openRegisters = registersResponse?.data || [];

  // Get register details
  const { data: registerDetails } = useGetCashRegisterByIdQuery(
    selectedRegister!,
    { skip: !selectedRegister }
  );

  const selectedRegisterData = registerDetails?.data;

  const handleCloseRegister = async (data: {
    actual_amount: number;
    notes?: string;
  }) => {
    try {
      await closeCashRegister({
        cash_register_id: selectedRegister!,
        actual_amount: data.actual_amount,
        notes: data.notes,
      }).unwrap();
      toast.success("Cash register closed successfully");
      setShowCloseModal(false);
      setSelectedRegister(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to close cash register");
    }
  };

  const handleCashIn = async (data: CashInPayload) => {
    try {
      await cashIn({ id: selectedRegister!, data }).unwrap();
      toast.success("Cash added successfully");
      setShowCashInModal(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add cash");
    }
  };

  const handleCashOut = async (data: CashOutPayload) => {
    try {
      await cashOut({ id: selectedRegister!, data }).unwrap();
      toast.success("Cash removed successfully");
      setShowCashOutModal(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove cash");
    }
  };

  const handleAdjustBalance = async (data: AdjustBalancePayload) => {
    try {
      await adjustBalance({ id: selectedRegister!, data }).unwrap();
      toast.success("Balance adjusted successfully");
      setShowAdjustModal(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust balance");
    }
  };

  if (registersLoading) {
    return <Loading message="Loading.." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cash Counter Operations
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Open, close, and manage cash counter operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Register Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Cash Register
          </h2>
          <div className="space-y-4">
            <SelectField
              label=""
              value={selectedRegister || ""}
              onChange={(value) =>
                setSelectedRegister(value ? Number(value) : null)
              }
              data={openRegisters.map((register) => ({
                id: register.id,
                name: `${register.name}  - ${formatCurrencyEnglish(
                  Number(register.current_balance)
                )}`,
              }))}
              allowEmpty
            />
          </div>
        </div>

        {/* Register Details */}
        {selectedRegisterData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Register Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium">{selectedRegisterData.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Branch:
                </span>
                <span className="font-medium">
                  {selectedRegisterData.branch?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedRegisterData.status === "open"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {selectedRegisterData.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Current Balance:
                </span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrencyEnglish(
                    Number(selectedRegisterData.current_balance)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Opening Balance:
                </span>
                <span className="font-medium">
                  {formatCurrencyEnglish(
                    Number(selectedRegisterData.opening_balance)
                  )}
                </span>
              </div>
              {selectedRegisterData.opened_at && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Opened At:
                  </span>
                  <span className="text-sm">
                    {formatDateTime(selectedRegisterData.opened_at)}
                  </span>
                </div>
              )}
              {selectedRegisterData.opened_by && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Opened By:
                  </span>
                  <span className="text-sm">
                    {selectedRegisterData.opened_by?.full_name || "N/A"}
                  </span>
                </div>
              )}
              {selectedRegisterData.closed_at && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Closed At:
                  </span>
                  <span className="text-sm">
                    {formatDateTime(selectedRegisterData.closed_at)}
                  </span>
                </div>
              )}
              {selectedRegisterData.closed_by && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Closed By:
                  </span>
                  <span className="text-sm">
                    {selectedRegisterData.closed_by?.full_name || "N/A"}
                  </span>
                </div>
              )}
              {selectedRegisterData.status === "closed" &&
                selectedRegisterData.variance !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Variance:
                    </span>
                    <span
                      className={`font-medium ${
                        Number(selectedRegisterData.variance) === 0
                          ? "text-green-600"
                          : Number(selectedRegisterData.variance) > 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrencyEnglish(
                        Number(selectedRegisterData.variance)
                      )}
                    </span>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Operations Grid */}
      {selectedRegister && selectedRegisterData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedRegisterData.status === "closed"
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }`}
          >
            <div
              className="p-6 text-center"
              onClick={() =>
                selectedRegisterData.status === "open" &&
                setShowCashInModal(true)
              }
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Cash In
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add cash to the register
              </p>
            </div>
          </div>

          <div
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedRegisterData.status === "closed"
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }`}
          >
            <div
              className="p-6 text-center"
              onClick={() =>
                selectedRegisterData.status === "open" &&
                setShowCashOutModal(true)
              }
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Minus className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Cash Out
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remove cash from the register
              </p>
            </div>
          </div>

          <div
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedRegisterData.status === "closed"
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }`}
          >
            <div
              className="p-6 text-center"
              onClick={() =>
                selectedRegisterData.status === "open" &&
                setShowAdjustModal(true)
              }
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Adjust Balance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Correct balance discrepancies
              </p>
            </div>
          </div>

          <div
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedRegisterData.status === "closed"
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }`}
          >
            <div
              className="p-6 text-center"
              onClick={() =>
                selectedRegisterData.status === "open" &&
                setShowCloseModal(true)
              }
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Close Register
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                End the shift
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cash In Modal */}
      <Modal
        className="max-w-xl"
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
            <Input name="notes" placeholder="Enter notes..." />
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
        className="max-w-xl"
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
              max={Number(selectedRegisterData?.current_balance)}
              required
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Reason">
            <Select
              options={[
                { value: "petty_cash", label: "Petty Cash" },
                { value: "change_fund", label: "Change Fund" },
                { value: "emergency", label: "Emergency" },
                { value: "other", label: "Other" },
              ]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="Notes (Optional)">
            <Input name="notes" placeholder="Enter notes..." />
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

      {/* Adjust Balance Modal */}
      <Modal
        className="max-w-xl"
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Adjust Balance"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const adjustment = parseFloat(formData.get("adjustment") as string);
            handleAdjustBalance({
              amount: Math.abs(adjustment),
              adjustment_type: adjustment >= 0 ? "increase" : "decrease",
              description:
                (formData.get("notes") as string) || "Balance adjustment",
              notes: formData.get("notes") as string,
            });
          }}
          className="space-y-4"
        >
          <FormField label="Adjustment Amount">
            <Input
              name="adjustment"
              type="number"
              step="0.01"
              required
              placeholder="Use positive for increase, negative for decrease"
            />
          </FormField>
          <FormField label="Notes">
            <Input
              name="notes"
              placeholder="Enter reason for adjustment..."
              required
            />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdjustModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAdjusting} variant="primary">
              {isAdjusting ? "Adjusting..." : "Adjust Balance"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Register Modal */}
      <Modal
        className="max-w-xl"
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Register"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleCloseRegister({
              actual_amount: parseFloat(
                formData.get("actual_amount") as string
              ),
              notes: formData.get("notes") as string,
            });
          }}
          className="space-y-4"
        >
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expected Balance:
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrencyEnglish(
                Number(selectedRegisterData?.current_balance) || 0
              )}
            </p>
          </div>
          <FormField label="Actual Amount">
            <Input
              name="actual_amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Enter actual cash counted"
            />
          </FormField>
          <FormField label="Notes (Optional)">
            <Input name="notes" placeholder="Enter notes..." />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCloseModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isClosing} variant="primary">
              {isClosing ? "Closing..." : "Close Register"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CashRegisterOperationsPage;
