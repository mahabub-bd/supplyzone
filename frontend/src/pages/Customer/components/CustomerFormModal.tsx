import { useEffect } from "react";
import { toast } from "react-toastify";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Checkbox from "../../../components/form/input/Checkbox";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useGetCustomerGroupsQuery } from "../../../features/customer-group/customerGroupApi";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "../../../features/customer/customerApi";
import { Customer } from "../../../types/customer";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

// 🔹 Zod Validation Schema
const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(11, "Phone must be at least 11 digits"),

  group_id: z.string().optional(),
  status: z.boolean(),
  billing_address: z
    .object({
      contact_name: z.string().optional(),
      phone: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  shipping_address: z
    .object({
      contact_name: z.string().optional(),
      phone: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomerFormModal({
  isOpen,
  onClose,
  customer,
}: Props) {
  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const { data: customerGroupsData } = useGetCustomerGroupsQuery({});

  const isEdit = !!customer;
  const isLoading = isCreating || isUpdating;
  const customerGroups = customerGroupsData?.data || [];

  // 🧠 React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",

      group_id: "",
      status: true,
      billing_address: {
        contact_name: "",
        phone: "",
        street: "",
        city: "",
        country: "",
      },
      shipping_address: {
        contact_name: "",
        phone: "",
        street: "",
        city: "",
        country: "",
      },
    },
  });

  const groupId = watch("group_id");

  // Populate form when editing
  useEffect(() => {
    if (isEdit && customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        group_id: customer.group_id?.toString() || "",
        status: customer.status,
        billing_address: {
          contact_name: customer.billing_address?.contact_name || "",
          phone: customer.billing_address?.phone || "",
          street: customer.billing_address?.street || "",
          city: customer.billing_address?.city || "",
          country: customer.billing_address?.country || "",
        },
        shipping_address: {
          contact_name: customer.shipping_address?.contact_name || "",
          phone: customer.shipping_address?.phone || "",
          street: customer.shipping_address?.street || "",
          city: customer.shipping_address?.city || "",
          country: customer.shipping_address?.country || "",
        },
      });
    } else {
      reset();
    }
  }, [isEdit, customer, isOpen, reset]);

  // Submit Handler
  const onSubmit = async (data: CustomerFormData) => {
    try {
      const payload = {
        ...data,
        group_id: data.group_id ? Number(data.group_id) : undefined,
      };

      if (isEdit && customer) {
        await updateCustomer({ id: customer.id, body: payload }).unwrap();
        toast.success("Customer updated successfully!");
      } else {
        await createCustomer(payload).unwrap();
        toast.success("Customer created successfully!");
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
      className="max-w-4xl  max-h-[90vh] overflow-y-auto  scrollbar-hide"
      title={isEdit ? "Update Customer" : "Create New Customer"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Customer Name */}
        <FormField label="Customer Name *" error={errors.name?.message}>
          <Input placeholder="John Doe" {...register("name")} />
        </FormField>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email *" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="email@example.com"
              {...register("email")}
            />
          </FormField>

          <FormField label="Phone *" error={errors.phone?.message}>
            <Input placeholder="01700000000" {...register("phone")} />
          </FormField>
        </div>

        {/* Billing Address */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-md font-medium mb-3 dark:text-white">
            Billing Address
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Name">
              <Input
                placeholder="John Doe"
                {...register("billing_address.contact_name")}
              />
            </FormField>
            <FormField label="Phone">
              <Input
                placeholder="01700000000"
                {...register("billing_address.phone")}
              />
            </FormField>
          </div>
          <div className="mt-3">
            <FormField label="Street">
              <Input
                placeholder="123 Main Street"
                {...register("billing_address.street")}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <FormField label="City">
              <Input
                placeholder="Dhaka"
                {...register("billing_address.city")}
              />
            </FormField>
            <FormField label="Country">
              <Input
                placeholder="Bangladesh"
                {...register("billing_address.country")}
              />
            </FormField>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-md font-medium mb-3 dark:text-white">
            Shipping Address
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Name">
              <Input
                placeholder="John Doe"
                {...register("shipping_address.contact_name")}
              />
            </FormField>
            <FormField label="Phone">
              <Input
                placeholder="01700000000"
                {...register("shipping_address.phone")}
              />
            </FormField>
          </div>
          <div className="mt-3">
            <FormField label="Street">
              <Input
                placeholder="456 Shipping Lane"
                {...register("shipping_address.street")}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <FormField label="City">
              <Input
                placeholder="Chattogram"
                {...register("shipping_address.city")}
              />
            </FormField>
            <FormField label="Country">
              <Input
                placeholder="Bangladesh"
                {...register("shipping_address.country")}
              />
            </FormField>
          </div>
        </div>

        {/* Customer Group */}
        <FormField label="Customer Group">
          <Select
            value={groupId || ""}
            onChange={(value) => setValue("group_id", value)}
            placeholder="Select Customer Group (Optional)"
            options={customerGroups.map((group: any) => ({
              value: String(group.id),
              label: group.name,
            }))}
          />
        </FormField>

        {/* Status */}
        <div className="flex items-center gap-2">
          <Checkbox
            label="Active"
            checked={!!setValue} // To fix initial checkbox state
            {...register("status")}
            onChange={(checked) => setValue("status", checked)}
          />
        </div>
      </form>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 mt-4 shrink-0">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {isLoading
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Customer"
            : "Create Customer"}
        </Button>
      </div>
    </Modal>
  );
}
