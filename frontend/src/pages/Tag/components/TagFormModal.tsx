import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Switch from "../../../components/form/switch/Switch";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

import {
  useCreateTagMutation,
  useUpdateTagMutation,
} from "../../../features/tag/tagApi";
import { Tag } from "../../../types/product";

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]/g, "");

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.boolean().default(true).optional(),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tag: Tag | null;
}

export default function TagFormModal({ isOpen, onClose, tag }: Props) {
  const isEdit = !!tag;
  const [createTag] = useCreateTagMutation();
  const [updateTag] = useUpdateTagMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: true,
    },
  });

  // Auto-generate slug when name changes
  const nameValue = watch("name");
  useEffect(() => {
    if (!isEdit) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, setValue, isEdit]);

  // Reset form on modal open/edit
  useEffect(() => {
    if (isEdit && tag) {
      reset({
        name: tag.name || "",
        slug: tag.slug || "",
        description: tag.description || "",
        status: tag.status ?? true,
      });
    } else {
      reset({ name: "", slug: "", description: "", status: true });
    }
  }, [reset, isEdit, tag]);

  const onSubmit = async (data: TagFormValues) => {
    try {
      if (isEdit && tag) {
        await updateTag({ id: tag.id, body: data }).unwrap();
        toast.success("Tag updated");
      } else {
        await createTag(data).unwrap();
        toast.success("Tag created");
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
      title={isEdit ? "Update Tag" : "Create New Tag"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Name */}
        <FormField label="Name" error={errors.name?.message}>
          <Input {...register("name")} placeholder="Enter tag name" />
        </FormField>

        {/* Slug */}
        <FormField label="Slug">
          <Input {...register("slug")} placeholder="auto-generated-slug" />
          {!isEdit && (
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from name. You can edit it if needed.
            </p>
          )}
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <Input {...register("description")} placeholder="Describe this tag..." />
        </FormField>

        {/* Status */}
        <div className="flex items-center gap-3">
          <Switch
            label="Active"
            defaultChecked={watch("status")}
            onChange={(checked) => setValue("status", checked)}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Tag" : "Create Tag"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
