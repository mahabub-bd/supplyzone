import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Checkbox from "../../../components/form/input/Checkbox";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from "../../../features/branch/branchApi";
import { useGetWarehousesQuery } from "../../../features/warehouse/warehouseApi";

import { Branch } from "../../../types/branch";
import { BranchFormType, branchSchema } from "./branch.schema";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

export default function BranchFormModal({ isOpen, onClose, branch }: Props) {
  const { data: warehousesData, isLoading: isLoadingWarehouses } =
    useGetWarehousesQuery();

  const warehouses = warehousesData?.data || [];
  const isEdit = !!branch;

  const [createBranch] = useCreateBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();

  // React Hook Form Initialization
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormType>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      code: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      is_active: true,
      default_warehouse_id: "",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isEdit && branch) {
      reset({
        code: branch.code,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        is_active: branch.is_active,
        default_warehouse_id: branch.default_warehouse?.id?.toString() || "",
      });
    } else {
      reset({
        code: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        is_active: true,
        default_warehouse_id: "",
      });
    }
  }, [isEdit, branch, reset, isOpen]);

  const onSubmit = async (values: BranchFormType) => {
    const payload = {
      ...values,
      default_warehouse_id: values.default_warehouse_id
        ? Number(values.default_warehouse_id)
        : null,
    };

    try {
      if (isEdit && branch) {
        await updateBranch({ id: branch.id, body: payload }).unwrap();
        toast.success("Branch updated successfully!");
      } else {
        await createBranch(payload).unwrap();
        toast.success("Branch created successfully!");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-6"
      title={isEdit ? "Update Branch" : "Create New Branch"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Branch Code */}
        <FormField label="Branch Code" error={errors.code?.message}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => <Input {...field} placeholder="BR-001" />}
          />
        </FormField>

        {/* Branch Name */}
        <FormField label="Branch Name" error={errors.name?.message}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Main Branch" />
            )}
          />
        </FormField>

        {/* Address */}
        <FormField label="Address" error={errors.address?.message}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="123 Street, City" />
            )}
          />
        </FormField>

        {/* Phone + Email */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone" error={errors.phone?.message}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="+8801712345678" />
              )}
            />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="branch@example.com"
                />
              )}
            />
          </FormField>
        </div>

        {/* Default Warehouse */}
        <FormField label="Default Warehouse (Optional)">
          {isLoadingWarehouses ? (
            <p className="text-sm text-gray-500">Loading warehouses...</p>
          ) : (
            <Controller
              name="default_warehouse_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Select a warehouse"
                  options={warehouses.map((w) => ({
                    value: w.id.toString(),
                    label: `${w.name}${w.location ? ` - ${w.location}` : ""}`,
                  }))}
                />
              )}
            />
          )}
        </FormField>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Active"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Update Branch" : "Create Branch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
