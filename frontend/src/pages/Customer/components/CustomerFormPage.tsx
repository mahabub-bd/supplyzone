import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Checkbox from "../../../components/form/input/Checkbox";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Button from "../../../components/ui/button/Button";
import { useGetCustomerGroupsQuery } from "../../../features/customer-group/customerGroupApi";
import {
  useCreateCustomerMutation,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
} from "../../../features/customer/customerApi";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Loading from "../../../components/common/Loading";

// 🔹 Zod Validation Schema
const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(11, "Phone must be at least 11 digits"),
  group_id: z.string().optional(),
  status: z.boolean(),
  same_as_billing: z.boolean().optional(),
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

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const { data: customerGroupsData } = useGetCustomerGroupsQuery({});
  const { data: customerData, isLoading: isLoadingCustomer } =
    useGetCustomerByIdQuery(id!, { skip: !isEdit });

  const isLoading = isCreating || isUpdating || isLoadingCustomer;
  const customerGroups = customerGroupsData?.data || [];
  const customer = customerData?.data;

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
      same_as_billing: false,
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
    }
  }, [isEdit, customer, reset]);

  // Watch billing address and same_as_billing checkbox for changes
  const billingAddress = watch("billing_address");
  const sameAsBilling = watch("same_as_billing");

  // Handle "Same as Billing" checkbox
  const handleSameAsBilling = (checked: boolean) => {
    setValue("same_as_billing", checked);
    if (checked && billingAddress) {
      setValue("shipping_address", {
        contact_name: billingAddress.contact_name || "",
        phone: billingAddress.phone || "",
        street: billingAddress.street || "",
        city: billingAddress.city || "",
        country: billingAddress.country || "",
      });
    } else if (!checked) {
      setValue("shipping_address", {
        contact_name: "",
        phone: "",
        street: "",
        city: "",
        country: "",
      });
    }
  };

  // Auto-update shipping address when billing changes if same_as_billing is checked
  useEffect(() => {
    if (sameAsBilling && billingAddress) {
      setValue("shipping_address", {
        contact_name: billingAddress.contact_name || "",
        phone: billingAddress.phone || "",
        street: billingAddress.street || "",
        city: billingAddress.city || "",
        country: billingAddress.country || "",
      });
    }
  }, [billingAddress, sameAsBilling, setValue]);

  // Submit Handler
  const onSubmit = async (data: CustomerFormData) => {
    try {
      // Remove same_as_billing from payload as it's only for UI purposes
      const { same_as_billing, ...payloadData } = data;
      const payload = {
        ...payloadData,
        group_id: payloadData.group_id
          ? Number(payloadData.group_id)
          : undefined,
      };

      if (isEdit && customer) {
        await updateCustomer({ id: customer.id, body: payload }).unwrap();
        toast.success("Customer updated successfully!");
      } else {
        await createCustomer(payload).unwrap();
        toast.success("Customer created successfully!");
      }
      navigate("/customers");
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleCancel = () => {
    navigate("/customers");
  };

  if (isEdit && isLoadingCustomer) {
    return <Loading message="Loading customer data..." />;
  }

  return (
    <div className="p-6  mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Update Customer" : "Create New Customer"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit
            ? "Update the customer information below"
            : "Fill in the information below to create a new customer"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>

          {/* Customer Name */}
          <div className="mb-4">
            <Label>
              Customer Name<span className="text-red-500">*</span>
            </Label>
            <Input placeholder="John Doe" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="email@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label>
                Phone<span className="text-red-500">*</span>
              </Label>
              <Input placeholder="01700000000" {...register("phone")} />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Customer Group */}
          <div className="mb-4">
            <Label>Customer Group</Label>
            <select
              {...register("group_id")}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Customer Group (Optional)</option>
              {customerGroups.map((group: any) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Checkbox
              label="Active"
              checked={!!setValue}
              {...register("status")}
              onChange={(checked) => setValue("status", checked)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Billing Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input
                  placeholder="John Doe"
                  {...register("billing_address.contact_name")}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="01700000000"
                  {...register("billing_address.phone")}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Street</Label>
              <Input
                placeholder="123 Main Street"
                {...register("billing_address.street")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>City</Label>
                <Input
                  placeholder="Dhaka"
                  {...register("billing_address.city")}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  placeholder="Bangladesh"
                  {...register("billing_address.country")}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Shipping Address</h2>
              <div className="flex items-center gap-2">
                <Checkbox
                  label="Same as Billing"
                  checked={sameAsBilling || false}
                  onChange={handleSameAsBilling}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input
                  placeholder="John Doe"
                  {...register("shipping_address.contact_name")}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="01700000000"
                  {...register("shipping_address.phone")}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Street</Label>
              <Input
                placeholder="456 Shipping Lane"
                {...register("shipping_address.street")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>City</Label>
                <Input
                  placeholder="Chattogram"
                  {...register("shipping_address.city")}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  placeholder="Bangladesh"
                  {...register("shipping_address.country")}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Billing Address */}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update "
              : "Create "}
          </Button>
        </div>
      </form>
    </div>
  );
}
