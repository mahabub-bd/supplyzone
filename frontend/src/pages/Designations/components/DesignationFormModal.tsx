import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Input from "../../../components/form/input/InputField";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Switch from "../../../components/form/switch/Switch";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import {
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useGetDesignationsQuery,
} from "../../../features/designation/designationApi";

import { Designation } from "../../../types";

interface DesignationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  designation: Designation | null;
}

const LEVEL_OPTIONS = [
  { value: "junior_officer", label: "Junior Officer" },
  { value: "officer", label: "Officer" },
  { value: "senior_officer", label: "Senior Officer" },
  { value: "executive", label: "Executive" },
  { value: "senior_executive", label: "Senior Executive" },
  { value: "assistant_manager", label: "Assistant Manager" },
  { value: "manager", label: "Manager" },
  { value: "senior_manager", label: "Senior Manager" },
  { value: "head_of_department", label: "Head of Department" },
  { value: "cfo", label: "CFO" },
  { value: "coo", label: "COO" },
  { value: "cto", label: "CTO" },
  { value: "director", label: "Director" },
  { value: "managing_director", label: "Managing Director" },
  { value: "ceo", label: "CEO" },
];

export default function DesignationFormModal({
  isOpen,
  onClose,
  designation,
}: DesignationFormModalProps) {
  const isEdit = !!designation;
  const [createDesignation] = useCreateDesignationMutation();
  const [updateDesignation] = useUpdateDesignationMutation();
  const { data: designationsData } = useGetDesignationsQuery();

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    level: "officer",
    description: "",
    minSalary: "",
    maxSalary: "",
    autoApproveLeaveDays: 0,
    canApproveLeave: false,
    canApprovePayroll: false,
    parentDesignationId: null as number | null,
    isActive: true,
    sortOrder: 1,
  });

  useEffect(() => {
    if (isEdit && designation) {
      setFormData({
        title: designation.title,
        code: designation.code,
        level: designation.level,
        description: designation.description || "",
        minSalary: designation.minSalary,
        maxSalary: designation.maxSalary,
        autoApproveLeaveDays: designation.autoApproveLeaveDays,
        canApproveLeave: designation.canApproveLeave,
        canApprovePayroll: designation.canApprovePayroll,
        parentDesignationId: designation.parentDesignationId || null,
        isActive: designation.isActive,
        sortOrder: designation.sortOrder,
      });
    } else {
      setFormData({
        title: "",
        code: "",
        level: "officer",
        description: "",
        minSalary: "",
        maxSalary: "",
        autoApproveLeaveDays: 0,
        canApproveLeave: false,
        canApprovePayroll: false,
        parentDesignationId: null,
        isActive: true,
        sortOrder: 1,
      });
    }
  }, [designation, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        code: formData.code,
        level: formData.level,
        description: formData.description || undefined,
        minSalary: parseFloat(formData.minSalary),
        maxSalary: parseFloat(formData.maxSalary),
        autoApproveLeaveDays: formData.autoApproveLeaveDays,
        canApproveLeave: formData.canApproveLeave,
        canApprovePayroll: formData.canApprovePayroll,
        parentDesignationId: formData.parentDesignationId,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      if (isEdit && designation) {
        await updateDesignation({ id: designation.id, ...payload }).unwrap();
        toast.success("Designation updated successfully!");
      } else {
        await createDesignation(payload).unwrap();
        toast.success("Designation created successfully!");
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const availableParentDesignations =
    designationsData?.data?.items?.filter((d) => d.id !== designation?.id) ||
    [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto scrollbar-hide"
      title={isEdit ? "Update Designation" : "Create New Designation"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
            Basic Information
          </h3>

          {/* Title and Code - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Designation Title *">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Senior Manager"
              />
            </FormField>

            <FormField label="Designation Code *">
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="e.g., SM_001"
              />
            </FormField>
          </div>

          {/* Level */}
          <FormField label="Level *">
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Brief description of the designation..."
            />
          </FormField>
        </div>

        {/* Compensation Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
            Compensation
          </h3>

          {/* Salary Range - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Min Salary *">
              <Input
                type="number"
                value={formData.minSalary}
                onChange={(e) =>
                  setFormData({ ...formData, minSalary: e.target.value })
                }
                required
                placeholder="20000"
              />
            </FormField>

            <FormField label="Max Salary *">
              <Input
                type="number"
                value={formData.maxSalary}
                onChange={(e) =>
                  setFormData({ ...formData, maxSalary: e.target.value })
                }
                required
                placeholder="30000"
              />
            </FormField>
          </div>
        </div>

        {/* Hierarchy & Settings Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
            Hierarchy & Settings
          </h3>

          {/* Parent Designation and Auto Approve - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Parent Designation">
              <select
                value={formData.parentDesignationId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentDesignationId: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {availableParentDesignations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.code})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Auto Approve Leave Days">
              <Input
                type="number"
                value={formData.autoApproveLeaveDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    autoApproveLeaveDays: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                placeholder="0"
              />
            </FormField>
          </div>

          {/* Sort Order */}
          <FormField label="Sort Order">
            <Input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 1,
                })
              }
              min="1"
              placeholder="1"
            />
          </FormField>
        </div>

        {/* Permissions Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
            Permissions & Status
          </h3>

          <div className="flex flex-col gap-3">
            <Switch
              label="Can Approve Leave"
              defaultChecked={formData.canApproveLeave}
              onChange={(checked) =>
                setFormData({ ...formData, canApproveLeave: checked })
              }
              color="gray"
            />

            <Switch
              label="Can Approve Payroll"
              defaultChecked={formData.canApprovePayroll}
              onChange={(checked) =>
                setFormData({ ...formData, canApprovePayroll: checked })
              }
              color="gray"
            />

            <Switch
              label="Active"
              defaultChecked={formData.isActive}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
              color="gray"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
          >
            {isEdit ? "Update Designation" : "Create Designation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
