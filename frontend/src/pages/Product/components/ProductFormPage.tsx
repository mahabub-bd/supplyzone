import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "../../../components/form/date-picker";
import {
  FormField,
  SelectField,
} from "../../../components/form/form-elements/SelectFiled";
import FileInput from "../../../components/form/input/FileInput";
import Input from "../../../components/form/input/InputField";
import MultiSelect from "../../../components/form/MultiSelect";
import Button from "../../../components/ui/button/Button";

// API hooks
import {
  useUploadMultipleAttachmentsMutation,
  useUploadSingleAttachmentMutation,
} from "../../../features/attachment/attachmentApi";
import { useGetBrandsQuery } from "../../../features/brand/brandApi";
import {
  useGetCategoriesQuery,
  useGetSubCategoriesByCategoryIdQuery,
} from "../../../features/category/categoryApi";
import {
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "../../../features/product/productApi";
import { useGetSuppliersQuery } from "../../../features/suppliers/suppliersApi";
import { useGetTagsQuery } from "../../../features/tag/tagApi";
import { useGetUnitsQuery } from "../../../features/unit/unitApi";
import { ProductRequest, ProductType } from "../../../types/product";

const productSchema = z.object({
  name: z.string().min(1, "Product Name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  description: z.string().optional(),
  product_type: z.nativeEnum(ProductType).optional(),

  selling_price: z.coerce
    .number()
    .min(0.00, "Selling price must be greater than 0"),
  purchase_price: z.coerce
    .number()
    .min(0.00, "Purchase price must be greater than 0"),
  discount_price: z.coerce.number().optional(),
  brand_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ error: "Brand is required" }).min(1, "Brand is required")
  ),
  category_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ error: "Category is required" })
      .min(1, "Category is required")
  ),
  subcategory_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ error: "Subcategory is required" })
      .min(1, "Subcategory is required")
  ),
  unit_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ error: "Unit is required" }).min(1, "Unit is required")
  ),
  supplier_id: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().optional()
  ),
  tag_ids: z.array(z.coerce.number()).optional(),
  image_ids: z.array(z.coerce.number()).optional(),
  origin: z.string().optional(),
  expire_date: z.date().optional().nullable(),
  status: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // API Queries
  const { data: productData, isLoading: isProductLoading } =
    useGetProductByIdQuery(id!, { skip: !isEditMode });
  const product = productData?.data;

  const { data: brands } = useGetBrandsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: units } = useGetUnitsQuery();
  const { data: tags } = useGetTagsQuery();
  const { data: suppliers } = useGetSuppliersQuery();

  // API Mutations
  const [createProduct, { isLoading: createLoading }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: updateLoading }] =
    useUpdateProductMutation();
  const [uploadSingleAttachment] = useUploadSingleAttachmentMutation();
  const [uploadMultipleAttachments] = useUploadMultipleAttachmentsMutation();

  // Local State
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);

  // Fetch subcategories when category is selected
  const { data: subcategoriesData, isLoading: isSubcategoriesLoading } =
    useGetSubCategoriesByCategoryIdQuery(selectedCategoryId!, {
      skip: !selectedCategoryId,
    });

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      description: "",
      product_type: undefined,
      selling_price: 0,
      purchase_price: 0,
      discount_price: undefined,
      brand_id: undefined,
      category_id: undefined,
      subcategory_id: undefined,
      unit_id: undefined,
      supplier_id: undefined,
      tag_ids: [],
      image_ids: [],
      origin: "",
      expire_date: null,
      status: true,
    },
  });

  const categoryId = watch("category_id");
  const subcategoryId = watch("subcategory_id");
  const brandId = watch("brand_id");
  const unitId = watch("unit_id");
  const supplierId = watch("supplier_id");
  const expireDateId = "product-expire-date";

  // Load product data in edit mode
  useEffect(() => {
    if (isEditMode && product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || "",
        description: product.description || "",
        product_type: product.product_type,
        selling_price: Number(product.selling_price),
        purchase_price: Number(product.purchase_price),
        discount_price: product.discount_price
          ? Number(product.discount_price)
          : undefined,
        brand_id: product.brand?.id ? Number(product.brand.id) : undefined,
        category_id: product.category?.id
          ? Number(product.category.id)
          : undefined,
        subcategory_id: product.subcategory?.id
          ? Number(product.subcategory.id)
          : undefined,
        unit_id: product.unit?.id ? Number(product.unit.id) : undefined,
        supplier_id: product.supplier?.id
          ? Number(product.supplier.id)
          : undefined,
        tag_ids: product.tags?.map((t) => Number(t.id)) || [],
        image_ids: product.images?.map((img) => Number(img.id)) || [],
        origin: product.origin || "",
        expire_date: product.expire_date ? new Date(product.expire_date) : null,
        status: product.status,
      });

      // Set the selected category for subcategory fetching
      if (product.category?.id) {
        setSelectedCategoryId(Number(product.category.id));
      }
    }
  }, [isEditMode, product, reset]);

  // Handle category change
  const handleCategoryChange = (value: string | number) => {
    const id = Number(value);
    setValue("category_id", id, { shouldValidate: true });
    setSelectedCategoryId(id);
    // Reset subcategory when category changes
    setValue("subcategory_id", undefined as unknown as number, {
      shouldValidate: false,
    });
  };

  // Utility Functions
  const generateSKU = (name?: string) => {
    const prefix = name
      ? name
          .slice(0, 3)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
      : "PRD";
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomNum}`;
  };

  const generateBarcode = () => {
    return String(Date.now()).slice(-13);
  };

  // Product type options
  const productTypeOptions = Object.values(ProductType).map((type) => ({
    id: type,
    name: type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  const handleImageUpload = async () => {
    if (selectedImages.length === 0) return [];

    if (selectedImages.length === 1) {
      const formData = new FormData();
      formData.append("file", selectedImages[0]);
      const res = await uploadSingleAttachment(formData).unwrap();
      return [res.data.id];
    } else {
      const formData = new FormData();
      selectedImages.forEach((file) => formData.append("files", file));
      const res = await uploadMultipleAttachments(formData).unwrap();
      return res.data.map((img: any) => img.id);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      let image_ids = values.image_ids || [];

      // Upload new images if selected
      if (selectedImages.length > 0) {
        const uploadedImages = await handleImageUpload();
        image_ids = uploadedImages;
      }

      const payload: ProductRequest = {
        name: values.name,
        sku: values.sku,
        barcode: values.barcode || "",
        description: values.description || "",
        selling_price: values.selling_price,
        purchase_price: values.purchase_price,
        discount_price: values.discount_price || 0,
        status: values.status,
        product_type: values.product_type,
        brand_id: values.brand_id!,
        category_id: values.category_id!,
        subcategory_id: values.subcategory_id!,
        unit_id: values.unit_id!,
        supplier_id: values.supplier_id,
        tag_ids: values.tag_ids || [],
        image_ids,
        origin: values.origin,
        expire_date: values.expire_date
          ? values.expire_date.toISOString().split("T")[0]
          : null,
      };

      if (isEditMode && id) {
        await updateProduct({ id, body: payload }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct(payload).unwrap();
        toast.success("Product created successfully");
      }

      navigate("/products");
    } catch (e: any) {
      const errorMessage =
        e?.data?.message || "Failed to save product. Please try again.";
      toast.error(errorMessage);
      console.error("Product save error:", e);
    }
  };

  if (isProductLoading && isEditMode) {
    return <Loading message="Loading product..." />;
  }

  const subcategories = subcategoriesData?.data || [];

  return (
    <div className="space-y-6">
      <PageMeta
        title={isEditMode ? "Edit Product" : "Add Product"}
        description={
          isEditMode ? "Edit existing product" : "Create new product"
        }
      />

      <PageHeader title={isEditMode ? "Edit Product" : "Add New Product"} />

      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-dark-900 dark:border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Product Name *" error={errors.name?.message}>
                <Input
                  {...register("name")}
                  placeholder="Enter product name"
                  className="w-full"
                />
              </FormField>

              <FormField
                label="Description"
                error={errors.description?.message}
              >
                <Input
                  {...register("description")}
                  placeholder="Enter product description"
                  className="w-full"
                />
              </FormField>
              <SelectField
                label="Product Type"
                data={productTypeOptions}
                value={watch("product_type")}
                error={errors.product_type?.message}
                onChange={(value) =>
                  setValue("product_type", value as ProductType, {
                    shouldValidate: true,
                  })
                }
                allowEmpty={true}
                emptyLabel="Select product type"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Additional Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Origin" error={errors.origin?.message}>
                <Input
                  {...register("origin")}
                  placeholder="e.g., China, USA"
                  className="w-full"
                />
              </FormField>

              <FormField
                label="Expiry Date"
                error={errors.expire_date?.message}
              >
                <DatePicker
                  id={expireDateId}
                  value={
                    Array.isArray(watch("expire_date"))
                      ? null
                      : watch("expire_date")
                  }
                  onChange={(date) =>
                    setValue(
                      "expire_date",
                      Array.isArray(date) ? date[0] : date
                    )
                  }
                  placeholder="Select expiry date"
                  disableFuture={false}
                  error={!!errors.expire_date}
                />
              </FormField>
            </div>
          </div>

          {/* SKU & Barcode */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Product Identifiers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="SKU *" error={errors.sku?.message}>
                <div className="flex gap-2">
                  <Input
                    {...register("sku")}
                    placeholder="Enter SKU"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setValue("sku", generateSKU(getValues("name")))
                    }
                  >
                    Generate
                  </Button>
                </div>
              </FormField>

              <FormField label="Barcode" error={errors.barcode?.message}>
                <div className="flex gap-2">
                  <Input
                    {...register("barcode")}
                    placeholder="Enter barcode"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setValue("barcode", generateBarcode())}
                  >
                    Generate
                  </Button>
                </div>
              </FormField>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Purchase Price *"
                error={errors.purchase_price?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register("purchase_price")}
                  placeholder="0.00"
                  className="w-full"
                />
              </FormField>

              <FormField
                label="Selling Price *"
                error={errors.selling_price?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register("selling_price")}
                  placeholder="0.00"
                  className="w-full"
                />
              </FormField>

              <FormField
                label="Discount Price"
                error={errors.discount_price?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register("discount_price")}
                  placeholder="0.00"
                  className="w-full"
                />
              </FormField>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Classification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Category */}
              <SelectField
                label="Category *"
                data={
                  categories?.data?.map((cat) => ({
                    id: Number(cat.id),
                    name: cat.name,
                  })) || []
                }
                value={categoryId}
                error={errors.category_id?.message}
                onChange={handleCategoryChange}
              />

              {/* Subcategory - Only show when category is selected */}
              {selectedCategoryId && (
                <SelectField
                  label="Subcategory *"
                  data={subcategories.map((subcat) => ({
                    id: Number(subcat.id),
                    name: subcat.name,
                  }))}
                  value={subcategoryId}
                  error={errors.subcategory_id?.message}
                  onChange={(val) =>
                    setValue("subcategory_id", Number(val), {
                      shouldValidate: true,
                    })
                  }
                  disabled={isSubcategoriesLoading}
                />
              )}

              {/* Brand */}
              <SelectField
                label="Brand *"
                data={
                  brands?.data?.map((brand) => ({
                    id: Number(brand.id),
                    name: brand.name,
                  })) || []
                }
                value={brandId}
                error={errors.brand_id?.message}
                onChange={(val) =>
                  setValue("brand_id", Number(val), { shouldValidate: true })
                }
              />

              {/* Unit */}
              <SelectField
                label="Unit *"
                data={
                  units?.data?.map((unit) => ({
                    id: Number(unit.id),
                    name: unit.name,
                  })) || []
                }
                value={unitId}
                error={errors.unit_id?.message}
                onChange={(val) =>
                  setValue("unit_id", Number(val), { shouldValidate: true })
                }
              />

              {/* Supplier */}
              <SelectField
                label="Supplier"
                data={
                  suppliers?.data?.map((supplier) => ({
                    id: Number(supplier.id),
                    name: supplier.name,
                  })) || []
                }
                value={supplierId}
                error={errors.supplier_id?.message}
                onChange={(val) =>
                  setValue("supplier_id", val ? Number(val) : undefined, {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {/* Loading indicator for subcategories */}
            {isSubcategoriesLoading && selectedCategoryId && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading subcategories...
              </p>
            )}

            {/* No subcategories message */}
            {selectedCategoryId &&
              !isSubcategoriesLoading &&
              subcategories.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  No subcategories available for this category. Please create a
                  subcategory first.
                </p>
              )}

            {/* Tags */}
            <div className="pt-2">
              <MultiSelect
                label="Tags"
                options={
                  tags?.data?.map((t) => ({
                    value: t.id.toString(),
                    text: t.name,
                  })) ?? []
                }
                defaultSelected={product?.tags?.map((t) => t.id.toString())}
                onChange={(vals) => setValue("tag_ids", vals.map(Number))}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Product Images
            </h3>

            <FormField label="Upload Images">
              {isEditMode && product?.images && product.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Current Images:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`${product.name} ${idx + 1}`}
                        className="h-24 w-24 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                      />
                    ))}
                  </div>
                </div>
              )}
              <FileInput
                accept="image/*"
                multiple
                onChange={(e) =>
                  setSelectedImages(Array.from(e.target.files || []))
                }
              />
              {selectedImages.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✓ {selectedImages.length} new image(s) selected
                </p>
              )}
            </FormField>
          </div>

          {/* Stock Information - Display only in edit mode */}
          {isEditMode && product?.stock_by_warehouse && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Stock Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Total Stock
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {product.total_stock}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Available Stock
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {product.available_stock}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Sold Quantity
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {product.total_sold}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Status
                  </p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {product.status ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Warehouse
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Batch No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Sold Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Available
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Purchase Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Expiry Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {product.stock_by_warehouse.map((stock, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {stock.warehouse.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {stock.warehouse.location}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {stock.batch_no}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {stock.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {stock.sold_quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                            {stock.available_quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {Number(stock.purchase_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {stock.expiry_date
                              ? new Date(stock.expiry_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
              disabled={createLoading || updateLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createLoading || updateLoading}
            >
              {createLoading || updateLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : isEditMode ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
