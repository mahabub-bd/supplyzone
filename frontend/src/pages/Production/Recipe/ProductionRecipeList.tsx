import {
  ChefHat,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useDeleteProductionRecipeMutation,
  useGetProductionRecipesQuery,
} from "../../../features/production/productionRecipeApi";
import {
  useProductionRecipeStatus,
  useProductionRecipeType,
} from "../../../features/production/recipe-hooks";
import { useHasPermission } from "../../../hooks/useHasPermission";
import {
  ProductionRecipeStatus,
  ProductionRecipeType,
  RecipeFilters,
} from "../../../types/production-recipe";

export default function ProductionRecipeList() {
  const navigate = useNavigate();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<
    ProductionRecipeStatus | undefined
  >();
  const [selectedType, setSelectedType] = useState<
    ProductionRecipeType | undefined
  >();
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build filter object
  const filters: RecipeFilters = {
    page,
    limit,
    search: debouncedSearch,
    status: selectedStatus,
    recipe_type: selectedType,
  };

  const { data, isLoading, isError } = useGetProductionRecipesQuery(filters);
  const [deleteRecipe] = useDeleteProductionRecipeMutation();

  const recipes = data?.data || [];
  const meta = data?.meta;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const canEdit = useHasPermission("production.edit");
  const canDelete = useHasPermission("production.delete");

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedStatus, selectedType]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput("");
    setSelectedStatus(undefined);
    setSelectedType(undefined);
    setPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchInput || selectedStatus !== undefined || selectedType !== undefined;

  // 🔹 Route Handlers
  const canView = useHasPermission("production.view");
  const openViewPage = useCallback(
    (recipe: any) => {
      navigate(`/production/recipes/${recipe.id}`);
    },
    [navigate]
  );

  const openCreatePage = useCallback(() => {
    navigate("/production/recipes/create");
  }, [navigate]);

  const openEditPage = useCallback(
    (recipe: any) => {
      navigate(`/production/recipes/${recipe.id}/edit`);
    },
    [navigate]
  );

  // 🔹 Delete Handling
  const openDeleteDialog = useCallback((recipe: any) => {
    setRecipeToDelete(recipe);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!recipeToDelete) return;
    try {
      await deleteRecipe(recipeToDelete.id).unwrap();
      toast.success("Production recipe deleted successfully");
    } catch {
      toast.error("Failed to delete production recipe");
    } finally {
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
    }
  }, [recipeToDelete, deleteRecipe]);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setRecipeToDelete(null);
  }, []);

  // 🔹 Dropdown Handling
  const toggleDropdown = useCallback(
    (recipeId: number) => {
      setActiveDropdown(activeDropdown === recipeId ? null : recipeId);
    },
    [activeDropdown]
  );

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // 🔹 Loading & Error States
  if (isLoading) return <Loading message="Loading Production Recipes..." />;
  if (isError)
    return (
      <p className="p-6 text-red-500">Failed to fetch production recipes.</p>
    );

  // Status and Type helpers
  const getStatusInfo = useProductionRecipeStatus();
  const getTypeInfo = useProductionRecipeType();

  return (
    <>
      {/* Header Section */}
      <PageHeader
        title="Production Recipes"
        icon={<Plus size={16} />}
        addLabel="Create Recipe"
        onAdd={openCreatePage}
        permission="production.create"
      />

      {/* Search & Filters */}
      <div className="mb-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by recipe name, code, product..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            }`}
          >
            Filters{" "}
            {hasActiveFilters &&
              `(${
                [searchInput, selectedStatus, selectedType].filter(Boolean)
                  .length
              })`}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              <X size={16} />
              Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <SelectField
                label="Status"
                data={[
                  { id: "", name: "All Status" },
                  { id: "draft", name: "Draft" },
                  { id: "active", name: "Active" },
                  { id: "inactive", name: "Inactive" },
                  { id: "archived", name: "Archived" },
                ]}
                value={selectedStatus || ""}
                onChange={(value) =>
                  setSelectedStatus(value as ProductionRecipeStatus)
                }
              />

              {/* Type Filter */}
              <SelectField
                label="Recipe Type"
                data={[
                  { id: "", name: "All Types" },
                  { id: "manufacturing", name: "Manufacturing" },
                  { id: "assembly", name: "Assembly" },
                  { id: "formulation", name: "Formulation" },
                  { id: "mixing", name: "Mixing" },
                  { id: "processing", name: "Processing" },
                  { id: "packaging", name: "Packaging" },
                ]}
                value={selectedType || ""}
                onChange={(value) =>
                  setSelectedType(value as ProductionRecipeType)
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader>Recipe Details</TableCell>
                <TableCell isHeader>Type</TableCell>
                <TableCell isHeader>Finished Product</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Materials</TableCell>
                <TableCell isHeader>Standard Quantity</TableCell>
                <TableCell isHeader>Estimated Time</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {recipes.length > 0 ? (
                recipes.map((recipe: any) => {
                  const statusInfo = getStatusInfo(recipe.status);
                  const typeInfo = getTypeInfo(recipe.recipe_type);

                  return (
                    <TableRow
                      key={recipe.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="py-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {recipe.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {recipe.recipe_code}
                          </div>
                          <div className="text-sm text-gray-500">
                            v{recipe.version}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeInfo.icon}</span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              typeInfo.color === "blue"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                : typeInfo.color === "green"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : typeInfo.color === "purple"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                                : typeInfo.color === "orange"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                                : typeInfo.color === "teal"
                                ? "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300"
                                : typeInfo.color === "indigo"
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                            }`}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="text-gray-900 dark:text-white">
                          {recipe.finished_product?.name || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {recipe.finished_product?.sku || "-"}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            statusInfo.color === "green"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : statusInfo.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                              : statusInfo.color === "blue"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              : statusInfo.color === "gray"
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                              : statusInfo.color === "orange"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                          }`}
                        >
                          {statusInfo.label}
                        </span>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="text-sm">
                          <div>{recipe.summary?.total_materials || 0}</div>
                          <div className="text-gray-500">
                            {recipe.summary?.required_materials || 0} required
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="text-sm">
                          {recipe.standard_quantity} {recipe.unit_of_measure}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="text-sm">
                          {recipe.estimated_time_minutes
                            ? `${Math.round(
                                recipe.estimated_time_minutes / 60
                              )}h`
                            : "-"}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3">
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(recipe.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Actions"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>

                          <Dropdown
                            isOpen={activeDropdown === recipe.id}
                            onClose={() => {
                              closeDropdown();
                              closeDeleteModal();
                            }}
                            className="min-w-40"
                          >
                            {canView && (
                              <DropdownItem
                                onClick={() => {
                                  openViewPage(recipe);
                                  closeDropdown();
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye size={16} />
                                View
                              </DropdownItem>
                            )}

                            {canEdit && (
                              <DropdownItem
                                onClick={() => {
                                  openEditPage(recipe);
                                  closeDropdown();
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Pencil size={16} />
                                Edit
                              </DropdownItem>
                            )}

                            {canDelete && (
                              <DropdownItem
                                onClick={() => {
                                  openDeleteDialog(recipe);
                                  closeDropdown();
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                Delete
                              </DropdownItem>
                            )}
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2 w-full justify-center">
                      <ChefHat size={48} className="text-gray-300" />
                      <p className="text-lg font-medium">
                        No production recipes found
                      </p>
                      <p className="text-sm">
                        Get started by creating your first production recipe
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={{
            currentPage: meta.page,
            totalPages: meta.totalPages,
            total: meta.total,
          }}
          onPageChange={handlePageChange}
          currentPageItems={recipes.length}
          itemsPerPage={limit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {canDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          title="Delete Production Recipe"
          message={`Are you sure you want to delete "${recipeToDelete?.name}"? This action cannot be undone.`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </>
  );
}
