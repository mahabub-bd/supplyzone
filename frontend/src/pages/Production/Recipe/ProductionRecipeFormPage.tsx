import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import {
  FormField,
  SelectField,
} from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Button from "../../../components/ui/button";
import { useGetProductsQuery } from "../../../features/product/productApi";
import {
  useCreateProductionRecipeMutation,
  useGetProductionRecipeByIdQuery,
  useUpdateProductionRecipeMutation,
} from "../../../features/production/productionRecipeApi";
import { useGetUnitsQuery } from "../../../features/unit/unitApi";
import {
  MaterialType,
  materialTypeOptions,
} from "../../../types/production-recipe";
import { ProductionRecipeFormData, productionRecipeSchema } from "./formSchema";

const defaultItem = {
  material_product_id: 1,
  material_type: MaterialType.COMPONENT,
  required_quantity: 1,
  unit_id: 1,
  consumption_rate: 1,
  waste_percentage: 0,
  description: "",
  priority: 1,
  is_optional: false,
};

export default function ProductionRecipeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm<ProductionRecipeFormData>({
    resolver: zodResolver(productionRecipeSchema),
    defaultValues: {
      name: "",
      finished_product_id: 1,
      description: "",
      standard_quantity: 1,
      unit_id: 1,
      estimated_time_minutes: 0,
      yield_percentage: 100,
      recipe_items: [defaultItem],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipe_items",
  });

  const { data: recipeData, isLoading: isLoadingRecipe } =
    useGetProductionRecipeByIdQuery(id as string, { skip: !isEditing });
  const { data: componentProducts } = useGetProductsQuery({
    product_type: "raw_material,component,consumable,packaging",
  });
  const { data: finishedGoodProducts } = useGetProductsQuery({
    product_type: "finished_good",
  });
  const { data: units } = useGetUnitsQuery();
  const unitOptions =
    units?.data.map((unit) => ({ id: unit.id.toString(), name: unit.name })) ||
    [];

  const [createRecipe] = useCreateProductionRecipeMutation();
  const [updateRecipe] = useUpdateProductionRecipeMutation();

  useEffect(() => {
    if (isEditing && recipeData?.data) {
      const recipe = recipeData.data;
      reset({
        name: recipe.name || "",
        finished_product_id: recipe.finished_product_id || 0,
        description: recipe.description || "",
        standard_quantity: recipe.standard_quantity || 1,
        unit_id: recipe.unit_id || 1,
        estimated_time_minutes: recipe.estimated_time_minutes || 0,
        yield_percentage: recipe.yield_percentage || 100,
        recipe_items: recipe.recipe_items?.map((item: any) => ({
          id: item.id,
          material_product_id: item.material_product_id || 0,
          material_type: item.material_type || MaterialType.COMPONENT,
          required_quantity: item.required_quantity || 1,
          unit_id: item.unit_id || 1,
          consumption_rate: item.consumption_rate || 1,
          waste_percentage: item.waste_percentage || 0,
          description: item.description || "",
          priority: item.priority || 1,
          is_optional: item.is_optional || false,
        })) || [defaultItem],
      });
    }
  }, [isEditing, recipeData, reset]);

  const onSubmit = async (data: ProductionRecipeFormData) => {
    try {
      const payload = {
        ...data,
        recipe_items: data.recipe_items.map((item) => ({
          ...item,
          ...(isEditing && item.id ? { id: item.id } : {}),
        })),
      };
      if (isEditing && id) {
        await updateRecipe({ id, body: payload }).unwrap();
        toast.success("Production recipe updated successfully");
      } else {
        await createRecipe(payload).unwrap();
        toast.success("Production recipe created successfully");
      }
      navigate("/production/recipes");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to save production recipe");
    }
  };

  const addItem = () => append({ ...defaultItem, priority: fields.length + 1 });
  const removeItem = (index: number) => fields.length > 1 && remove(index);

  if (isEditing && isLoadingRecipe)
    return <Loading message="Loading production recipe details..." />;

  return (
    <>
      <PageBreadcrumb
        pageTitle={
          isEditing ? "Edit Production Recipe" : "Create Production Recipe"
        }
      />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <FormField label="Recipe Name" error={errors.name?.message}>
                <Input
                  {...register("name")}
                  placeholder="e.g., Samsung Galaxy S24 Manufacturing Recipe"
                />
              </FormField>
              <SelectField
                label="Finished Product"
                value={watch("finished_product_id")?.toString()}
                onChange={(value) =>
                  setValue("finished_product_id", parseInt(value))
                }
                data={[
                  { id: "", name: "Select Finished Product" },
                  ...(finishedGoodProducts?.data || []).map((p) => ({
                    id: p.id.toString(),
                    name: `${p.name} (${p.sku})`,
                  })),
                ]}
                error={errors.finished_product_id?.message}
              />
              <FormField
                label="Standard Quantity"
                error={errors.standard_quantity?.message}
              >
                <Input
                  {...register("standard_quantity", { valueAsNumber: true })}
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  placeholder="1000"
                />
              </FormField>
              <SelectField
                label="Unit of Measure"
                value={watch("unit_id")?.toString()}
                onChange={(value) => setValue("unit_id", parseInt(value))}
                data={unitOptions}
                error={errors.unit_id?.message}
              />
              <FormField
                label="Estimated Time (minutes)"
                error={errors.estimated_time_minutes?.message}
              >
                <Input
                  {...register("estimated_time_minutes", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  placeholder="480"
                />
              </FormField>
              <FormField
                label="Yield Percentage (%)"
                error={errors.yield_percentage?.message}
              >
                <Input
                  {...register("yield_percentage", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="95.5"
                />
              </FormField>
            </div>
            <div className="mt-3">
              <FormField
                label="Description"
                error={errors.description?.message}
              >
                <TextArea
                  {...register("description")}
                  rows={2}
                  placeholder="Complete manufacturing process for Samsung Galaxy S24"
                />
              </FormField>
            </div>
          </div>

          {/* Recipe Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Recipe Items (Materials)
              </h3>
              <Button
                type="button"
                onClick={addItem}
                variant="primary"
                size="sm"
                className="gap-2"
              >
                <Plus size={16} /> Add Material
              </Button>
            </div>
            {errors.recipe_items?.message && (
              <p className="text-red-500 text-sm mb-3">
                {errors.recipe_items.message}
              </p>
            )}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Material {index + 1}
                    </h4>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          {...register(`recipe_items.${index}.is_optional`)}
                          className="rounded border-gray-300"
                        />{" "}
                        Optional
                      </label>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 p-1 h-auto"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
                    <SelectField
                      label="Material Product"
                      value={watch(
                        `recipe_items.${index}.material_product_id`
                      )?.toString()}
                      onChange={(value) =>
                        setValue(
                          `recipe_items.${index}.material_product_id`,
                          parseInt(value)
                        )
                      }
                      data={[
                        { id: "", name: "Select Material" },
                        ...(componentProducts?.data || []).map((p) => ({
                          id: p.id.toString(),
                          name: `${p.name} (${p.sku})`,
                        })),
                      ]}
                      error={
                        errors.recipe_items?.[index]?.material_product_id
                          ?.message
                      }
                    />
                    <SelectField
                      label="Material Type"
                      value={watch(`recipe_items.${index}.material_type`)}
                      onChange={(value) =>
                        setValue(
                          `recipe_items.${index}.material_type`,
                          value as MaterialType
                        )
                      }
                      data={materialTypeOptions}
                      error={
                        errors.recipe_items?.[index]?.material_type?.message
                      }
                    />
                    <FormField
                      label="Priority"
                      error={errors.recipe_items?.[index]?.priority?.message}
                    >
                      <Input
                        {...register(`recipe_items.${index}.priority`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="1"
                        placeholder="1"
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
                    <FormField
                      label="Required Quantity"
                      error={
                        errors.recipe_items?.[index]?.required_quantity?.message
                      }
                    >
                      <Input
                        {...register(
                          `recipe_items.${index}.required_quantity`,
                          { valueAsNumber: true }
                        )}
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        placeholder="5"
                      />
                    </FormField>
                    <SelectField
                      label="Unit of Measure"
                      value={watch(`recipe_items.${index}.unit_id`)?.toString()}
                      onChange={(value) =>
                        setValue(
                          `recipe_items.${index}.unit_id`,
                          parseInt(value)
                        )
                      }
                      data={unitOptions}
                      error={errors.recipe_items?.[index]?.unit_id?.message}
                    />
                    <FormField
                      label="Waste %"
                      error={
                        errors.recipe_items?.[index]?.waste_percentage?.message
                      }
                    >
                      <Input
                        {...register(`recipe_items.${index}.waste_percentage`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="1"
                      />
                    </FormField>
                  </div>
                  <div className="mb-3">
                    <FormField
                      label="Consumption Rate"
                      error={
                        errors.recipe_items?.[index]?.consumption_rate?.message
                      }
                    >
                      <Input
                        {...register(`recipe_items.${index}.consumption_rate`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="2.5"
                      />
                    </FormField>
                  </div>
                  <div className="mb-3">
                    <FormField
                      label="Description"
                      error={errors.recipe_items?.[index]?.description?.message}
                    >
                      <TextArea
                        {...register(`recipe_items.${index}.description`)}
                        rows={2}
                        placeholder="Grade A electronic components"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-6 pt-4">
            <Button
              type="button"
              onClick={() => navigate("/production/recipes")}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft size={16} /> Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              className="gap-2"
            >
              <Save size={16} />{" "}
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Recipe"
                : "Create Recipe"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
