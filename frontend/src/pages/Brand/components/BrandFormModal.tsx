import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FileInput from "../../../components/form/input/FileInput";
import Input from "../../../components/form/input/InputField";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import { Modal } from "../../../components/ui/modal";
import { useUploadSingleAttachmentMutation } from "../../../features/attachment/attachmentApi";

import Button from "../../../components/ui/button/Button";
import {
  useCreateBrandMutation,
  useUpdateBrandMutation,
} from "../../../features/brand/brandApi";
import { Brand } from "../../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
}

export default function BrandFormModal({ isOpen, onClose, brand }: Props) {
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [uploadLogo] = useUploadSingleAttachmentMutation();

  const isEdit = !!brand;

  // MUST be string — Fixed
  const [attachmentId, setAttachmentId] = useState<string | null>(
    brand?.logo_attachment?.id ? String(brand.logo_attachment.id) : null
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    brand?.logo_attachment?.url || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: brand?.name || "",
    description: brand?.description || "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isEdit && brand) {
      setFormData({
        name: brand.name,
        description: brand.description || "",
      });
      setAttachmentId(
        brand.logo_attachment?.id ? String(brand.logo_attachment.id) : null
      );
      setImageUrl(brand.logo_attachment?.url || null);
    } else {
      setFormData({ name: "", description: "" });
      setAttachmentId(null);
      setImageUrl(null);
    }
  }, [isEdit, brand]);

  // Upload brand logo first
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      setIsUploading(true);
      const res = await uploadLogo(uploadFormData).unwrap();

      if (!res.data?.id) {
        throw new Error("Attachment upload failed: no ID returned");
      }

      // Store as string
      setAttachmentId(String(res.data.id));
      setImageUrl(res.data.url);
    } catch (err) {
      toast.error("Failed to upload logo");
      console.error("Logo upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit brand after image is uploaded
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploading) {
      toast.warning("Please wait until the logo upload is complete.");
      return;
    }

    if (!attachmentId) {
      toast.error("Please upload brand logo before submitting.");
      return;
    }

    const payload = {
      ...formData,
      logo_attachment_id: attachmentId, // MUST be string
    };

    console.log("Submitting payload:", payload);

    try {
      if (isEdit && brand) {
        await updateBrand({ id: brand.id, body: payload }).unwrap();
        toast.success("Brand updated successfully!");
      } else {
        await createBrand(payload).unwrap();
        toast.success("Brand created successfully!");
      }
      onClose();
    } catch (err: any) {
      console.error("Error submitting brand:", err);
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6"
      title={isEdit ? "Update Brand" : "Create New Brand"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Brand Name */}
        <FormField label="Brand Name *">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter brand name"
          />
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <Input
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter brand description"
          />
        </FormField>

        {/* Logo Upload */}
        <FormField label="Brand Logo *">
          <FileInput
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {isUploading && (
            <p className="text-blue-500 text-sm mt-1">Uploading...</p>
          )}

          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Brand Logo"
                className="h-20 w-20 rounded border object-cover"
              />
            </div>
          )}
        </FormField>

        {/* Submit */}
        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading || !attachmentId}>
            {isEdit ? "Update Brand" : "Create Brand"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
