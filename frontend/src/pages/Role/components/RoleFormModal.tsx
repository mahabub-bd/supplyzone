import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

// API Hooks
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "../../../features/role/roleApi";

// Types
import { Role } from "../../../types/role";

// UI
import Input from "../../../components/form/input/InputField";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";

// Props
interface Props {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

// Validation Schema
const RoleSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

type RoleFormState = z.infer<typeof RoleSchema>;

export default function RoleFormModal({ isOpen, onClose, role }: Props) {
  const isEdit = !!role;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormState>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();

  // Load values when editing
  useEffect(() => {
    if (isEdit && role) {
      reset({
        name: role.name,
        description: role.description,
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [isEdit, role, reset]);

  // Submit Handler
  const onSubmit = async (data: RoleFormState) => {
    try {
      if (isEdit && role) {
        await updateRole({ id: role.id, body: data }).unwrap();
        toast.success("Role updated successfully!");
      } else {
        await createRole(data).unwrap();
        toast.success("Role created successfully!");
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
      className="max-w-lg p-6"
      title={isEdit ? "Update Role" : "Create New Role"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField label="Role Name" error={errors.name?.message}>
          <Input
            {...register("name")}
            placeholder="Enter role name"
          />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Input
            {...register("description")}
            placeholder="Enter description"
          />
        </FormField>

        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
