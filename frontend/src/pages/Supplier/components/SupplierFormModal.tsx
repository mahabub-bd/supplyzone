import { useEffect } from "react";
import { Modal } from "../../../components/ui/modal";

import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";

import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from "../../../features/suppliers/suppliersApi";

import { Supplier } from "../../../types/supplier";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../components/ui/button/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

/* -------------------------- ZOD VALIDATION SCHEMA -------------------------- */

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  payment_terms: z.string().optional(),
});

type SupplierFormType = z.infer<typeof supplierSchema>;

/* -------------------------------------------------------------------------- */

export default function SupplierFormModal({
  isOpen,
  onClose,
  supplier,
}: Props) {
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();

  const isEdit = !!supplier;

  /* ------------------------------- RHF SETUP ------------------------------- */

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormType>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      payment_terms: "",
    },
  });

  /* ------------------- Reset form when modal opens/closes ------------------ */

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contact_person: supplier.contact_person || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        payment_terms: supplier.payment_terms || "",
      });
    } else {
      reset({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        payment_terms: "",
      });
    }
  }, [supplier, reset, isOpen]);

  /* ------------------------------ ON SUBMIT -------------------------------- */

  const onSubmit = async (data: SupplierFormType) => {
    try {
      if (isEdit && supplier) {
        await updateSupplier({ id: supplier.id, body: data }).unwrap();
      } else {
        await createSupplier(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Supplier save failed", error);
    }
  };

  /* ------------------------------ JSX RETURN ------------------------------- */

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
      title={isEdit ? "Update Supplier" : "Add New Supplier"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Name */}
        <FormField label="Name *" error={errors.name?.message}>
          <Input {...register("name")} />
        </FormField>

        {/* Contact Person */}
        <FormField label="Contact Person">
          <Input {...register("contact_person")} />
        </FormField>

        {/* Phone */}
        <FormField label="Phone">
          <Input {...register("phone")} />
        </FormField>

        {/* Email */}
        <FormField label="Email" error={errors.email?.message}>
          <Input {...register("email")} />
        </FormField>

        {/* Address */}
        <FormField label="Address">
          <Input {...register("address")} />
        </FormField>

        {/* Payment Terms */}
        <FormField label="Payment Terms">
          <Input {...register("payment_terms")} />
        </FormField>

        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? "Update Supplier" : "Create Supplier"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
