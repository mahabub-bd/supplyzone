import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Badge from "../../../components/ui/badge/Badge";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import {
  useDeleteExpenseCategoryMutation,
  useGetExpenseCategoriesQuery,
} from "../../../features/expense-category/expenseCategoryApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";
import { ExpenseCategory } from "../../../types/expenses";
import ExpenseCategoryFormModal from "./ExpenseCategoryFormModal";

type StatusFilter = "active" | "inactive" | "all";

export default function ExpenseCategoryList() {
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const limit = 10;

  const { data, isLoading, isError } = useGetExpenseCategoriesQuery({
    page: currentPage,
    limit,
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const [deleteExpenseCategory] = useDeleteExpenseCategoryMutation();

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editCategory, setEditCategory] = useState<ExpenseCategory | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] =
    useState<ExpenseCategory | null>(null);

  const canCreate = useHasPermission("expensecategory.create");
  const canUpdate = useHasPermission("expensecategory.update");
  const canDelete = useHasPermission("expensecategory.delete");

  const categories = data?.data || [];
  const meta = data?.meta;

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter
  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const openCreateModal = () => {
    setEditCategory(null);
    formModal.openModal();
  };

  const openEditModal = (category: ExpenseCategory) => {
    setEditCategory(category);
    formModal.openModal();
  };

  const openDeleteDialog = (category: ExpenseCategory) => {
    setCategoryToDelete(category);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteExpenseCategory(categoryToDelete.id).unwrap();
      toast.success("Expense category deleted successfully");

      // Stay on current page after deletion (server will handle pagination)
    } catch {
      toast.error("Failed to delete expense category");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Expense Categories" />;

  if (isError)
    return (
      <p className="p-6 text-red-500">Failed to fetch expense categories.</p>
    );

  return (
    <>
      <PageHeader
        title="Expense Category Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={openCreateModal}
        permission="expensecategory.create"
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-10 w-80 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <SelectField
            label=""
            value={statusFilter}
            onChange={(value) => handleStatusFilter(value as StatusFilter)}
            data={[
              { id: "all", name: "All" },
              { id: "active", name: "Active" },
              { id: "inactive", name: "Inactive" },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader className="table-header">
                  Name
                </TableCell>
                <TableCell isHeader className="table-header">
                  Description
                </TableCell>
                <TableCell isHeader className="table-header">
                  Status
                </TableCell>
                <TableCell isHeader className="table-header text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="table-body font-medium">
                      {category.name}
                    </TableCell>

                    <TableCell className="table-body">
                      {category.description}
                    </TableCell>

                    <TableCell className="table-body">
                      <Badge
                        size="sm"
                        color={category.is_active ? "success" : "error"}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            tooltip="Edit"
                            onClick={() => openEditModal(category)}
                            color="blue"
                          />
                        )}
                        {canDelete && (
                          <IconButton
                            icon={Trash2}
                            tooltip="Delete"
                            onClick={() => openDeleteDialog(category)}
                            color="red"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No expense categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3">
            <Pagination
              meta={{
                currentPage: meta.page,
                totalPages: meta.totalPages,
                total: meta.total,
              }}
              onPageChange={handlePageChange}
              currentPageItems={categories.length}
              itemsPerPage={limit}
            />
          </div>
        )}
      </div>

      {(canCreate || canUpdate) && (
        <ExpenseCategoryFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          category={editCategory}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Expense Category"
          message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
