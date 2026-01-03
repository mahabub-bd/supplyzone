import { useState } from "react";

import ConfirmDialog from "../../../components/common/ConfirmDialog";

import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useDeletePermissionMutation,
  useGetPermissionsQuery,
} from "../../../features/permissions/permissionsApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { Permission } from "../../../types/role";
import PermissionFormModal from "./PermissionFormModal";

export default function PermissionList() {
  const { data, isLoading, isError } = useGetPermissionsQuery();
  const [deletePermission] = useDeletePermissionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPermission, setEditPermission] = useState<Permission | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] =
    useState<Permission | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const canUpdate = useHasPermission("permission.update");
  const canDelete = useHasPermission("permission.delete");
  const permissions = data?.data || [];

  // Pagination calculations
  const totalItems = permissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPermissions = permissions.slice(startIndex, endIndex);

  function openCreateModal() {
    setEditPermission(null);
    setIsModalOpen(true);
  }

  function openEditModal(permission: Permission) {
    setEditPermission(permission);
    setIsModalOpen(true);
  }

  function openDeleteDialog(permission: Permission) {
    setPermissionToDelete(permission);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!permissionToDelete) return;

    try {
      await deletePermission(permissionToDelete.id).unwrap();
      setIsDeleteModalOpen(false);
      setPermissionToDelete(null);
      toast("Permission Delete Sucessfully");
      // Adjust current page if necessary after deletion
      const newTotalPages = Math.ceil((totalItems - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Failed to delete permission:", error);
    }
  }

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  function handleItemsPerPageChange(value: number) {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  }

  if (isLoading) return <Loading message="Loading Permissions" />;

  if (isError)
    return <p className="p-5 text-red-500">Failed to fetch permissions.</p>;

  return (
    <>
      <PageHeader
        title="Permissions Management"
        onAdd={openCreateModal}
        addLabel="Add"
        permission="permission.create"
        icon={<Plus size={16} />}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white dark:bg-white/5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="table-header w-62.5">
                  Key
                </TableCell>
                <TableCell isHeader className="table-header w-75">
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="table-header text-right w-25"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentPermissions.map((perm) => (
                <TableRow key={perm.id}>
                  <TableCell className="table-body">{perm.key}</TableCell>

                  <TableCell className="table-body">
                    {perm.description}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {canUpdate && (
                        <IconButton
                          icon={Pencil}
                          onClick={() => openEditModal(perm)}
                          color="blue"
                        />
                      )}

                      {canDelete && (
                        <IconButton
                          icon={Trash2}
                          onClick={() => openDeleteDialog(perm)}
                          color="red"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-700 dark:text-gray-300"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              per page
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {totalItems > 0 ? startIndex + 1 : 0} -{" "}
              {Math.min(endIndex, totalItems)} of {totalItems}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>

              <span className="px-3 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <PermissionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        permission={editPermission}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Permission"
        message={`Are you sure you want to delete "${permissionToDelete?.key}"?`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
