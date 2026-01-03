import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import {
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
} from "../../../features/category/categoryApi";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Badge from "../../../components/ui/badge/Badge";
import ResponsiveImage from "../../../components/ui/images/ResponsiveImage";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";

import Loading from "../../../components/common/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import PageHeader from "../../../components/common/PageHeader";
import { CategoryWithChildren } from "../../../types/product";
import CategoryFormModal from "./CategoryFormModal";

// Flattened item type
interface FlattenedCategory {
  id: number;
  name: string;
  slug?: string | null;
  description?: string;
  status: boolean;
  logo_attachment: any;
  created_at: string;
  updated_at: string;
  category_id?: string;
  parent?: CategoryWithChildren | null;
}

const flattenCategories = (
  nodes: CategoryWithChildren[]
): FlattenedCategory[] => {
  const result: FlattenedCategory[] = [];

  const traverse = (
    list: CategoryWithChildren[],
    parent: CategoryWithChildren | null = null
  ) => {
    list.forEach((cat) => {
      // Add main category or subcategory
      result.push({
        ...cat,
        parent,
      });

      // Process children (subcategories)
      if (cat.children?.length) {
        traverse(cat.children as CategoryWithChildren[], cat);
      }
    });
  };

  traverse(nodes);
  return result;
};

export default function CategoryList() {
  const { data, isLoading, isError } = useGetCategoryTreeQuery();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categories = flattenCategories(data?.data || []);

  const canCreate = useHasPermission("category.create");
  const canUpdate = useHasPermission("category.update");
  const canDelete = useHasPermission("category.delete");

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editCategory, setEditCategory] = useState<FlattenedCategory | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] =
    useState<FlattenedCategory | null>(null);

  // Open modal to create a main category
  const openCreateCategoryModal = () => {
    setEditCategory(null);
    formModal.openModal();
  };

  // Open modal to create a subcategory under a parent
  const openCreateSubCategoryModal = (parent: FlattenedCategory) => {
    setEditCategory({
      id: 0, // Temporary ID for new subcategory
      name: "",
      status: true,
      logo_attachment: null,
      created_at: "",
      updated_at: "",
      category_id: String(parent.id), // Set parent category ID
    });
    formModal.openModal();
  };

  // Open modal to edit existing category/subcategory
  const openEditModal = (category: FlattenedCategory) => {
    setEditCategory(category);
    formModal.openModal();
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (category: FlattenedCategory) => {
    setCategoryToDelete(category);
    deleteModal.openModal();
  };

  // Confirm and execute delete
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id).unwrap();
      toast.success(
        `${
          categoryToDelete.parent ? "Subcategory" : "Category"
        } deleted successfully`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    } finally {
      deleteModal.closeModal();
      setCategoryToDelete(null);
    }
  };

  if (isLoading) return <Loading message="Loading Categories..." />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch categories.</p>;

  return (
    <>
      <PageHeader
        title="Category Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={openCreateCategoryModal}
        permission="category.create"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader>Logo</TableCell>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Type</TableCell>
                <TableCell isHeader>Parent</TableCell>

                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No categories found. Create your first category to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    {/* Logo */}
                    <TableCell className="py-3">
                      {cat.logo_attachment?.url ? (
                        <div className="aspect-video w-24">
                          <ResponsiveImage
                            src={cat.logo_attachment.url}
                            alt={cat.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <Badge size="sm" color="warning">
                          No Logo
                        </Badge>
                      )}
                    </TableCell>

                    {/* Name */}
                    <TableCell className="py-3">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {cat.parent && (
                          <span className="text-gray-400 mr-2">└─</span>
                        )}
                        {cat.name}
                      </p>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-3">
                      <Badge size="sm" color={cat.parent ? "primary" : "error"}>
                        {cat.parent ? "Subcategory" : "Main Category"}
                      </Badge>
                    </TableCell>

                    {/* Parent */}
                    <TableCell>
                      {cat.parent ? (
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <Badge size="sm" color={cat.status ? "success" : "error"}>
                        {cat.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3">
                      <div className="flex justify-start gap-2">
                        {/* Add Subcategory - Only for main categories */}
                        {!cat.parent && canCreate && (
                          <IconButton
                            icon={Plus}
                            color="green"
                            tooltip="Add "
                            onClick={() => openCreateSubCategoryModal(cat)}
                          />
                        )}

                        {/* Edit */}
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            color="blue"
                            tooltip={`Edit ${
                              cat.parent ? "Subcategory" : "Category"
                            }`}
                            onClick={() => openEditModal(cat)}
                          />
                        )}

                        {/* Delete */}
                        {canDelete && (
                          <IconButton
                            icon={Trash2}
                            color="red"
                            onClick={() => openDeleteDialog(cat)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Category / SubCategory Form Modal */}
      <CategoryFormModal
        isOpen={formModal.isOpen}
        onClose={() => {
          formModal.closeModal();
          setEditCategory(null);
        }}
        category={editCategory}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title={`Delete ${
          categoryToDelete?.parent ? "Subcategory" : "Category"
        }`}
        message={`Are you sure you want to delete "${
          categoryToDelete?.name
        }"? ${
          !categoryToDelete?.parent
            ? "This will also delete all subcategories under it."
            : ""
        }`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          deleteModal.closeModal();
          setCategoryToDelete(null);
        }}
      />
    </>
  );
}
