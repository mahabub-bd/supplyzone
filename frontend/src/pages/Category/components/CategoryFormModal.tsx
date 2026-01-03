import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import { FormField } from "../../../components/form/form-elements/SelectFiled";
import FileInput from "../../../components/form/input/FileInput";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Switch from "../../../components/form/switch/Switch";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

import { useUploadSingleAttachmentMutation } from "../../../features/attachment/attachmentApi";
import {
  useCreateCategoryMutation,
  useCreateSubCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
  useUpdateSubCategoryMutation,
} from "../../../features/category/categoryApi";
import { Category } from "../../../types/product";

const CategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  category_id: z.string().nullable().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof CategorySchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null; // For edit mode
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: Props) {
  const isEdit = !!category?.id;
  const isSubCategory = !!category?.category_id; // Detect if editing subcategory

  const { data } = useGetCategoriesQuery();
  const categories = data?.data || [];

  const [createCategory] = useCreateCategoryMutation();
  const [createSubCategory] = useCreateSubCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [updateSubCategory] = useUpdateSubCategoryMutation();
  const [uploadLogo] = useUploadSingleAttachmentMutation();

  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      category_id: null,
      status: true,
    },
  });

  const watchName = watch("name");

  useEffect(() => {
    if (isEdit && category) {
      reset({
        name: category.name,
        slug: category.slug || "",
        description: category.description || "",
        status: category.status,
        category_id: category.category_id ? String(category.category_id) : null,
      });

      setAttachmentId(
        category.logo_attachment_id ? String(category.logo_attachment_id) : null
      );
      setImageUrl(category.logo_attachment?.url || null);
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        status: true,
        category_id: category?.category_id
          ? String(category.category_id)
          : null,
      });
      setAttachmentId(null);
      setImageUrl(null);
    }
  }, [category, isEdit, reset]);

  // Auto-generate slug from name (only for new entries)
  useEffect(() => {
    if (!isEdit && watchName) {
      const generatedSlug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [watchName, isEdit, setValue]);

  // Upload Logo
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const res = await uploadLogo(formData).unwrap();
      setAttachmentId(String(res.data.id));
      setImageUrl(res.data.url);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!attachmentId) {
      toast.error("Please upload category logo first.");
      return;
    }

    const payload = {
      ...data,
      category_id: data.category_id ? String(data.category_id) : undefined,
      logo_attachment_id: attachmentId ? Number(attachmentId) : undefined,
    };

    try {
      if (isEdit && category) {
        if (isSubCategory) {
          await updateSubCategory({ id: category.id, body: payload }).unwrap();
          toast.success("Subcategory updated successfully");
        } else {
          await updateCategory({ id: category.id, body: payload }).unwrap();
          toast.success("Category updated successfully");
        }
      } else {
        if (payload.category_id) {
          await createSubCategory(payload).unwrap();
          toast.success("Subcategory created successfully");
        } else {
          await createCategory(payload).unwrap();
          toast.success("Main category created successfully");
        }
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl p-6"
      title={
        isEdit
          ? isSubCategory
            ? "Update Subcategory"
            : "Update Category"
          : category?.category_id
          ? "Create Subcategory"
          : "Create Category"
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField label="Name *" error={errors.name?.message}>
          <Input {...register("name")} placeholder="e.g., Electronics" />
        </FormField>

        {/* Slug */}
        <FormField label="Slug *" error={errors.slug?.message}>
          <Input
            {...register("slug")}
            placeholder="e.g., electronics or electronics-laptops"
          />
          {!isEdit && (
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from name. You can edit it if needed.
            </p>
          )}
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <Input
            {...register("description")}
            placeholder="Describe this category..."
          />
        </FormField>

        {/* Parent Category (subcategory assign) */}
        {!isEdit || !category?.category_id ? (
          <FormField label="Parent Category">
            <Select
              value={watch("category_id") || ""}
              onChange={(value) => setValue("category_id", value || null)}
              disabled={isEdit && isSubCategory}
              placeholder="Main Category"
              options={categories.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />
            {isEdit && isSubCategory && (
              <p className="text-sm text-gray-500 mt-1">
                Cannot change parent category for existing subcategories
              </p>
            )}
          </FormField>
        ) : null}

        {/* Logo Upload */}
        <FormField label="Category Logo *">
          <FileInput
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {isUploading && (
            <p className="text-blue-500 text-sm mt-1">Uploading...</p>
          )}

          {imageUrl && (
            <div className="aspect-video w-28 mt-2">
              <img
                src={imageUrl}
                alt="Category logo"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </FormField>

        {/* Status */}
        <div className="flex items-center gap-3">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Switch
                label="Active"
                defaultChecked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading || !attachmentId}>
            {isEdit
              ? isSubCategory
                ? "Update Subcategory"
                : "Update Category"
              : category?.category_id
              ? "Create Subcategory"
              : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
