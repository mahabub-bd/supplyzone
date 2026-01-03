import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod"; // 🔹 FIXED import

import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Switch from "../../../components/form/switch/Switch";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from "../../../features/warehouse/warehouseApi";
import { Warehouse } from "../../../types/branch";

const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  address: z
    .string()
    .max(200, "Address cannot exceed 200 characters")
    .optional(),
  status: z.boolean().default(true).optional(),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  warehouse: Warehouse | null;
}

export default function WarehouseFormModal({
  isOpen,
  onClose,
  warehouse,
}: Props) {
  const isEdit = !!warehouse;

  const [createWarehouse] = useCreateWarehouseMutation();
  const [updateWarehouse] = useUpdateWarehouseMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      location: "",
      address: "",
      status: true,
    },
  });

  const statusValue = watch("status");
  useEffect(() => {
    if (isEdit && warehouse) {
      reset({
        name: warehouse.name,
        location: warehouse.location || "",
        address: warehouse.address || "",
        status: warehouse.status ?? true,
      });
    } else {
      reset({ name: "", location: "", address: "", status: true });
    }
  }, [warehouse, isEdit, reset]);

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      if (isEdit && warehouse) {
        await updateWarehouse({ id: warehouse.id, body: data }).unwrap();
        toast.success("Warehouse updated");
      } else {
        await createWarehouse(data).unwrap();
        toast.success("Warehouse created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6"
      title={isEdit ? "Update Warehouse" : "Create New Warehouse"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Name *" error={errors.name?.message}>
          <Input {...register("name")} />
        </FormField>

        <FormField label="Location">
          <Input {...register("location")} />
        </FormField>

        <FormField label="Address" error={errors.address?.message}>
          <Input {...register("address")} />
        </FormField>

        <div className="flex items-center gap-3">
          <Switch
            label="Active"
            defaultChecked={statusValue}
            onChange={(checked) =>
              setValue("status", checked, { shouldValidate: true })
            }
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
