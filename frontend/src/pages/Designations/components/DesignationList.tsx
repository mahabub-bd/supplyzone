import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  useDeleteDesignationMutation,
  useGetDesignationsQuery,
} from "../../../features/designation/designationApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";
import { Designation } from "../../../types";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Input from "../../../components/form/input/InputField";
import Badge from "../../../components/ui/badge/Badge";
import DesignationFormModal from "./DesignationFormModal";

export default function DesignationList() {
  const { data, isLoading, isError } = useGetDesignationsQuery();
  const [deleteDesignation] = useDeleteDesignationMutation();

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editDesignation, setEditDesignation] = useState<Designation | null>(
    null
  );
  const [designationToDelete, setDesignationToDelete] =
    useState<Designation | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const canCreate = useHasPermission("designation.create");
  const canUpdate = useHasPermission("designation.update");
  const canDelete = useHasPermission("designation.delete");

  const designations = data?.data?.items || [];

  // Filter designations based on search input
  const filteredDesignations = designations.filter((designation) => {
    const searchLower = searchInput.toLowerCase();
    return (
      designation.title?.toLowerCase().includes(searchLower) ||
      designation.code?.toLowerCase().includes(searchLower) ||
      designation.level?.toLowerCase().includes(searchLower) ||
      designation.parentDesignation?.title?.toLowerCase().includes(searchLower)
    );
  });

  const openCreateModal = () => {
    setEditDesignation(null);
    formModal.openModal();
  };

  const openEditModal = (designation: Designation) => {
    setEditDesignation(designation);
    formModal.openModal();
  };

  const openDeleteDialog = (designation: Designation) => {
    setDesignationToDelete(designation);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!designationToDelete) return;
    try {
      await deleteDesignation(designationToDelete.id).unwrap();
      toast.success("Designation deleted successfully");
    } catch {
      toast.error("Failed to delete designation");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Designations" />;

  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch designations.</p>;

  return (
    <>
      <PageHeader
        title="Designation Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={openCreateModal}
        permission="designation.create"
      />

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search by title, code, or level..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader>Title</TableCell>

                <TableCell isHeader className="hidden lg:table-cell">
                  Level
                </TableCell>

                <TableCell isHeader className="hidden xl:table-cell">
                  Parent
                </TableCell>
                <TableCell isHeader className="hidden xl:table-cell">
                  Permissions
                </TableCell>
                <TableCell isHeader className="hidden sm:table-cell">
                  Status
                </TableCell>
                <TableCell isHeader className="table-header text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredDesignations.length > 0 ? (
                filteredDesignations.map((designation) => (
                  <TableRow key={designation.id}>
                    <TableCell className="table-body font-medium">
                      <div>
                        <div>{designation.title}</div>
                        {/* Show code on mobile/tablet */}
                        <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {designation.code}
                        </div>
                        {/* Show level on mobile/medium tablet */}
                        <div className="lg:hidden text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="capitalize">
                            {designation.level.replace(/_/g, " ")}
                          </span>
                        </div>
                        {/* Show status badge on mobile */}
                        <div className="sm:hidden mt-1">
                          <Badge
                            color={designation.isActive ? "success" : "error"}
                            size="sm"
                          >
                            {designation.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="table-body hidden lg:table-cell">
                      <span className="capitalize">
                        {designation.level.replace(/_/g, " ")}
                      </span>
                    </TableCell>

                    <TableCell className="table-body hidden xl:table-cell">
                      {designation.parentDesignation?.title || "-"}
                    </TableCell>
                    <TableCell className="table-body hidden xl:table-cell">
                      <div className="flex gap-1">
                        {designation.canApproveLeave && (
                          <Badge color="info" size="sm">
                            Leave
                          </Badge>
                        )}
                        {designation.canApprovePayroll && (
                          <Badge color="warning" size="sm">
                            Payroll
                          </Badge>
                        )}
                        {!designation.canApproveLeave &&
                          !designation.canApprovePayroll && (
                            <span className="text-gray-400">-</span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="table-body hidden sm:table-cell">
                      <Badge
                        color={designation.isActive ? "success" : "error"}
                        size="sm"
                      >
                        {designation.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-2 py-3 sm:px-4">
                      <div className="flex justify-start gap-1">
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            tooltip="Edit"
                            onClick={() => openEditModal(designation)}
                            color="blue"
                          />
                        )}
                        {canDelete && (
                          <IconButton
                            tooltip="Delete"
                            icon={Trash2}
                            onClick={() => openDeleteDialog(designation)}
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
                    colSpan={8}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchInput
                      ? "No designations match your search"
                      : "No designations found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(canCreate || canUpdate) && (
        <DesignationFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          designation={editDesignation}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Designation"
          message={`Are you sure you want to delete "${designationToDelete?.title}"?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
