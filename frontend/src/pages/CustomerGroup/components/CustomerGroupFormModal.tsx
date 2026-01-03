import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

import Checkbox from "../../../components/form/input/Checkbox";
import {
  useCreateCustomerGroupMutation,
  useUpdateCustomerGroupMutation,
} from "../../../features/customer-group/customerGroupApi";
import { CustomerGroup } from "../../../types/customer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  group: CustomerGroup | null;
}

interface FormData {
  name: string;
  description: string;
  discount_percentage: number;
  is_active: boolean;
}

export default function CustomerGroupFormModal({
  isOpen,
  onClose,
  group,
}: Props) {
  const [createGroup, { isLoading: isCreating }] =
    useCreateCustomerGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] =
    useUpdateCustomerGroupMutation();

  const isEdit = !!group;
  const isLoading = isCreating || isUpdating;

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      discount_percentage: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEdit && group) {
      setValue("name", group.name);
      setValue("description", group.description || "");
      setValue("discount_percentage", Number(group.discount_percentage) || 0);
      setValue("is_active", group.is_active);
    } else {
      reset();
    }
  }, [isEdit, group, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit && group) {
        await updateGroup({ id: group.id, body: data }).unwrap();
        toast.success("Customer group updated successfully!");
      } else {
        await createGroup(data).unwrap();
        toast.success("Customer group created successfully!");
      }
      reset();
      onClose();
    } catch {
      toast.error("Failed to save group");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="p-6 max-w-lg"
      title={isEdit ? "Update Customer Group" : "Create Customer Group"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Group Name *">
          <InputField
            {...register("name", { required: true })}
            required
          />
        </FormField>

        <FormField label="Description">
          <TextArea
            {...register("description")}
            rows={3}
          />
        </FormField>

        <FormField label="Discount (%)">
          <InputField
            {...register("discount_percentage", { valueAsNumber: true })}
            type="number"
          />
        </FormField>

        <div className="flex items-center gap-2">
          <Checkbox
            label="Active"
            checked={watch("is_active")}
            onChange={(checked) => setValue("is_active", checked)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
