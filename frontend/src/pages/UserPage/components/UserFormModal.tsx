import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// API hooks
import { useGetBranchesQuery } from "../../../features/branch/branchApi";
import { useGetRolesQuery } from "../../../features/role/roleApi";
import {
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../../features/user/userApi";

import { Branch } from "../../../types/branch";
import { Role } from "../../../types/role";

// UI
import { toast } from "react-toastify";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Checkbox from "../../../components/form/input/Checkbox";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { User } from "../../../types/user";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

// Base schema
const BaseUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  full_name: z.string().min(3, "Full name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
  branch_ids: z.array(z.number()).optional(),
  status: z.enum(["pending", "active", "suspend", "deactive"]),
});

// Create schema (password required)
const CreateUserSchema = BaseUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Update schema (password optional)
const UpdateUserSchema = BaseUserSchema.extend({
  password: z.string().optional(),
});

type FormState =
  | z.infer<typeof CreateUserSchema>
  | z.infer<typeof UpdateUserSchema>;

export default function UserFormModal({
  isOpen,
  onClose,
  user,
}: UserFormModalProps) {
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormState>({
    resolver: zodResolver(isEdit ? UpdateUserSchema : CreateUserSchema),
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
      phone: "",
      password: "",
      roles: [],
      branch_ids: [],
      status: "active",
    } as FormState,
  });

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const { data: singleUserRes, isLoading: isUserLoading } = useGetUserByIdQuery(
    user?.id!,
    { skip: !isEdit }
  );

  const { data: rolesData } = useGetRolesQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const roles: Role[] = rolesData?.data || [];
  const branches: Branch[] = branchesData?.data || [];
  const singleUser = singleUserRes?.data;

  useEffect(() => {
    if (isEdit && singleUser) {
      reset({
        username: singleUser.username,
        email: singleUser.email,
        full_name: singleUser.full_name,
        phone: singleUser.phone,
        password: "",
        roles: singleUser.roles?.map((r: Role) => r.name) || [],
        branch_ids: singleUser.branches?.map((b: Branch) => b.id) || [],
        status: singleUser.status,
      } as FormState);
    } else {
      reset();
    }
  }, [singleUser, isEdit, reset]);

  const onSubmit = async (data: FormState) => {
    try {
      if (isEdit && user) {
        const updatePayload = { ...data };
        delete (updatePayload as any).password; // 👈 remove undefined to satisfy API type

        await updateUser({ id: user.id, body: updatePayload }).unwrap();
        toast.success("User updated successfully!");
      } else {
        const createPayload = {
          ...data,
          password: data.password || "", // 👈 ensure password exists
        };

        await createUser(createPayload).unwrap();
        toast.success("User created successfully!");
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  if (isEdit && isUserLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
        <p className="text-gray-500 dark:text-gray-300">
          Loading user details...
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6"
      title={isEdit ? "Update User" : "Create New User"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Username */}
        <FormField label="Username *" error={errors.username?.message}>
          <Input
            {...register("username")}
            placeholder="Username"
          />
        </FormField>

        {/* Email */}
        <FormField label="Email *" error={errors.email?.message}>
          <Input
            type="email"
            {...register("email")}
            placeholder="Email Address"
          />
        </FormField>

        {/* Full Name */}
        <FormField label="Full Name *" error={errors.full_name?.message}>
          <Input
            {...register("full_name")}
            placeholder="Full Name"
          />
        </FormField>

        {/* Phone */}
        <FormField label="Phone *" error={errors.phone?.message}>
          <Input
            {...register("phone")}
            placeholder="Phone Number"
          />
        </FormField>

        {/* Password (only for create) */}
        {!isEdit && (
          <FormField label="Password *" error={errors.password?.message}>
            <Input
              type="password"
              {...register("password")}
              placeholder="Password"
            />
          </FormField>
        )}

        {/* User Status */}
        <FormField label="Status">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "active", label: "Active" },
                  { value: "suspend", label: "Suspend" },
                  { value: "deactive", label: "Deactive" },
                ]}
                defaultValue={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>

        {/* Roles */}
        <FormField label="Roles *" error={errors.roles?.message}>
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2 capitalize">
                {roles.map((r: Role) => (
                  <div key={r.id}>
                    <Checkbox
                      label={r.name}
                      checked={field.value.includes(r.name)}
                      onChange={(checked) =>
                        field.onChange(
                          checked
                            ? [...field.value, r.name]
                            : field.value.filter((role) => role !== r.name)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          />
        </FormField>

        {/* Branches */}
        <FormField label="Branches" error={errors.branch_ids?.message}>
          <Controller
            name="branch_ids"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {branches.map((branch: Branch) => (
                  <div key={branch.id}>
                    <Checkbox
                      label={branch.name}
                      checked={field.value?.includes(branch.id) || false}
                      onChange={(checked) =>
                        field.onChange(
                          checked
                            ? [...(field.value || []), branch.id]
                            : (field.value || []).filter(
                                (id) => id !== branch.id
                              )
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          />
        </FormField>

        {/* Submit button */}
        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
