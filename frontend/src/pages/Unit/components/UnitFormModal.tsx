import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Switch from "../../../components/form/switch/Switch";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import {
  useCreateUnitMutation,
  useUpdateUnitMutation,
} from "../../../features/unit/unitApi";

import { Unit } from "../../../types/product";

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
}

export default function UnitFormModal({
  isOpen,
  onClose,
  unit,
}: UnitFormModalProps) {
  const isEdit = !!unit;
  const [createUnit] = useCreateUnitMutation();
  const [updateUnit] = useUpdateUnitMutation();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && unit) {
      setFormData({
        name: unit.name,
        code: unit.code,
        description: unit.description || "",
        isActive: unit.isActive,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        isActive: true,
      });
    }
  }, [unit, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && unit) {
        await updateUnit({ id: unit.id, ...formData }).unwrap();
        toast.success("Unit updated successfully!");
      } else {
        await createUnit(formData).unwrap();
        toast.success("Unit created successfully!");
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6"
      title={isEdit ? "Update Unit" : "Create New Unit"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <FormField label="Unit Name *">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </FormField>

        {/* Code */}
        <FormField label="Unit Code *">
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <Input
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </FormField>

        {/* Active Status */}
        <div className="flex items-center gap-4">
          <Switch
            label="Active"
            defaultChecked={formData.isActive}
            onChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
            color="gray"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Update Unit" : "Create Unit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
