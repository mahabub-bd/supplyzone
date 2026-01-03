import z from "zod";
import {
  MaterialType,
} from "../../../types/production-recipe";

// Zod schema for recipe items
export const recipeItemSchema = z.object({
  id: z.number().optional(),
  material_product_id: z.number("Material product is required").min(1),
  material_type: z.nativeEnum(MaterialType, {
    message: "Material type is required",
  }),
  required_quantity: z
    .number("Quantity must be greater than 0")
    .min(0.0001, "Quantity must be greater than 0"),
  unit_id: z.number("Unit is required").min(1),
  consumption_rate: z.number().min(0).optional(),
  waste_percentage: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  priority: z.number().min(1),
  is_optional: z.boolean(),
});

// Zod schema for form validation
export const productionRecipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  finished_product_id: z.number("Finished product is required").min(1),
  description: z.string().optional(),
  standard_quantity: z
    .number("Standard quantity must be greater than 0")
    .min(0.0001, "Standard quantity must be greater than 0"),
  unit_id: z.number("Unit is required").min(1),
  estimated_time_minutes: z.number().min(0).optional(),
  yield_percentage: z.number().min(0).max(100).optional(),
  recipe_items: z
    .array(recipeItemSchema)
    .min(1, "At least one recipe item is required"),
});

export type ProductionRecipeFormData = z.infer<typeof productionRecipeSchema>;
