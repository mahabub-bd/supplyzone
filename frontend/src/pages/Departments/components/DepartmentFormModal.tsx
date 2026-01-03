import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Input from "../../../components/form/input/InputField";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "../../../features/department/departmentApi";
import { Department } from "../../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export default function DepartmentFormModal({
  isOpen,
  onClose,
  department,
}: Props) {
  const [createDepartment, { isLoading: isCreating }] =
    useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();

  const isEdit = !!department;

  const [formData, setFormData] = useState({
    name: department?.name || "",
    code: department?.code || "",
    description: department?.description || "",
    status: department?.status || "active",
    manager_name: department?.manager_name || "",
    manager_email: department?.manager_email || "",
    notes: department?.notes || "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isEdit && department) {
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || "",
        status: department.status || "active",
        manager_name: department.manager_name || "",
        manager_email: department.manager_email || "",
        notes: department.notes || "",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        status: "active",
        manager_name: "",
        manager_email: "",
        notes: "",
      });
    }
  }, [isEdit, department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      status: formData.status as "active" | "inactive",
      manager_name: formData.manager_name || undefined,
      manager_email: formData.manager_email || undefined,
      notes: formData.notes || undefined,
    };

    try {
      if (isEdit && department) {
        await updateDepartment({ id: department.id, ...payload }).unwrap();
        toast.success("Department updated successfully!");
      } else {
        await createDepartment(payload).unwrap();
        toast.success("Department created successfully!");
      }
      onClose();
    } catch (err: any) {
      console.error("Error submitting department:", err);
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-6"
      title={isEdit ? "Update Department" : "Create New Department"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Department Name */}
          <FormField label="Department Name *">
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Enter department name"
            />
          </FormField>

          {/* Department Code */}
          <FormField label="Department Code *">
            <Input
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
              placeholder="Enter department code"
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description">
          <Input
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter department description"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          {/* Manager Name */}
          <FormField label="Manager Name">
            <Input
              value={formData.manager_name}
              onChange={(e) =>
                setFormData({ ...formData, manager_name: e.target.value })
              }
              placeholder="Enter manager name"
            />
          </FormField>

          {/* Manager Email */}
          <FormField label="Manager Email">
            <Input
              type="email"
              value={formData.manager_email}
              onChange={(e) =>
                setFormData({ ...formData, manager_email: e.target.value })
              }
              placeholder="Enter manager email"
            />
          </FormField>
        </div>

        {/* Status */}
        <FormField label="Status *">
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "active" | "inactive",
              })
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>

        {/* Notes */}
        <FormField label="Notes">
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Enter any additional notes"
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </FormField>

        {/* Submit */}
        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isEdit ? "Update Department" : "Create Department"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
