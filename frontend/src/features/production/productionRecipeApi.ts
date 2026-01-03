import { ApiResponse } from "../../types";
import {
  CalculateMaterialRequirementsParams,
  CreateProductionRecipePayload,
  MaterialConsumption,
  MaterialConsumptionQueryDto,
  MaterialRequirementCalculation,
  ProductionRecipe,
  RecipeFilters,
  UpdateProductionRecipePayload,
} from "../../types/production-recipe";
import { apiSlice } from "../apiSlice";

export const productionRecipeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL PRODUCTION RECIPES
    getProductionRecipes: builder.query<
      ApiResponse<ProductionRecipe[]>,
      RecipeFilters
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.status) searchParams.append("status", params.status);
        if (params.recipe_type) searchParams.append("recipe_type", params.recipe_type);
        if (params.finished_product_id)
          searchParams.append("finished_product_id", params.finished_product_id.toString());
        if (params.material_type) searchParams.append("material_type", params.material_type);
        if (params.include_inactive !== undefined)
          searchParams.append("include_inactive", params.include_inactive.toString());

        return {
          url: `/production-recipe?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ProductionRecipes"],
    }),

    // 🔹 GET PRODUCTION RECIPE BY ID
    getProductionRecipeById: builder.query<
      ApiResponse<ProductionRecipe>,
      string | number
    >({
      query: (id) => ({
        url: `/production-recipe/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ProductionRecipes", id }],
    }),

    // 🔹 CALCULATE MATERIAL REQUIREMENTS
    calculateMaterialRequirements: builder.query<
      ApiResponse<MaterialRequirementCalculation>,
      CalculateMaterialRequirementsParams
    >({
      query: ({ id, quantity }) => ({
        url: `/production-recipe/calculate/${id}?quantity=${quantity}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { id }) => [{ type: "ProductionRecipes", id: `${id}-calculation` }],
    }),

    // 🔹 GET MATERIAL CONSUMPTION RECORDS
    getMaterialConsumption: builder.query<
      ApiResponse<MaterialConsumption[]>,
      MaterialConsumptionQueryDto
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.production_order_id)
          searchParams.append("production_order_id", params.production_order_id.toString());
        if (params.material_product_id)
          searchParams.append("material_product_id", params.material_product_id.toString());
        if (params.status) searchParams.append("status", params.status);
        if (params.consumption_date_from)
          searchParams.append("consumption_date_from", params.consumption_date_from);
        if (params.consumption_date_to)
          searchParams.append("consumption_date_to", params.consumption_date_to);

        return {
          url: `/production-recipe/consumption?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["MaterialConsumption"],
    }),

    // 🔹 CREATE PRODUCTION RECIPE
    createProductionRecipe: builder.mutation<
      ApiResponse<ProductionRecipe>,
      CreateProductionRecipePayload
    >({
      query: (body) => ({
        url: "/production-recipe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProductionRecipes"],
    }),

    // 🔹 UPDATE PRODUCTION RECIPE
    updateProductionRecipe: builder.mutation<
      ApiResponse<ProductionRecipe>,
      UpdateProductionRecipePayload
    >({
      query: ({ id, body }) => ({
        url: `/production-recipe/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "ProductionRecipes",
        { type: "ProductionRecipes", id },
        { type: "ProductionRecipes", id: `${id}-calculation` },
      ],
    }),

    // 🔹 DELETE PRODUCTION RECIPE
    deleteProductionRecipe: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/production-recipe/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductionRecipes"],
    }),
  }),
});

// 🔥 Export hooks
export const {
  useGetProductionRecipesQuery,
  useGetProductionRecipeByIdQuery,
  useCalculateMaterialRequirementsQuery,
  useGetMaterialConsumptionQuery,
  useCreateProductionRecipeMutation,
  useUpdateProductionRecipeMutation,
  useDeleteProductionRecipeMutation,
} = productionRecipeApi;