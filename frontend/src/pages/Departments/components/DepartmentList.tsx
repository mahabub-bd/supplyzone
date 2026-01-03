import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Input from "../../../components/form/input/InputField";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
} from "../../../features/department/departmentApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";
import { Department } from "../../../types";
import DepartmentFormModal from "./DepartmentFormModal";

export default function DepartmentList() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const canCreate = useHasPermission("department.create");
  const canUpdate = useHasPermission("department.update");
  const canDelete = useHasPermission("department.delete");
  const canView = useHasPermission("department.view");

  const departments = data?.data || [];

  // Filter departments based on search input
  const filteredDepartments = departments.filter((department) => {
    const searchLower = searchInput.toLowerCase();
    return (
      department.name?.toLowerCase().includes(searchLower) ||
      department.code?.toLowerCase().includes(searchLower) ||
      department.manager_name?.toLowerCase().includes(searchLower) ||
      department.description?.toLowerCase().includes(searchLower)
    );
  });

  const openCreateModal = () => {
    setEditDepartment(null);
    formModal.openModal();
  };

  const openEditModal = (department: Department) => {
    setEditDepartment(department);
    formModal.openModal();
  };

  const openDeleteDialog = (department: Department) => {
    setDepartmentToDelete(department);
    deleteModal.openModal();
  };

  const viewDepartment = (department: Department) => {
    navigate(`/departments/${department.id}`);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    try {
      await deleteDepartment(departmentToDelete.id).unwrap();
      toast.success("Department deleted successfully");
    } catch {
      toast.error("Failed to delete department");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Departments" />;

  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch departments.</p>;

  return (
    <>
      <PageHeader
        title="Department Management"
        icon={<Plus size={16} />}
        addLabel="Add Department"
        onAdd={openCreateModal}
        permission="department.create"
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
            placeholder="Search by name, code, or manager..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="hidden sm:table-cell">Code</TableCell>
                <TableCell isHeader>Department Name</TableCell>
                <TableCell isHeader className="hidden lg:table-cell">Description</TableCell>
                <TableCell isHeader className="hidden md:table-cell">Manager</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="table-body font-medium hidden sm:table-cell">
                      {department.code}
                    </TableCell>

                    <TableCell className="table-body font-medium">
                      <div>
                        <div>{department.name}</div>
                        {/* Show code on mobile */}
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Code: {department.code}
                        </div>
                        {/* Show manager on mobile/tablet */}
                        {department.manager_name && (
                          <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Manager: {department.manager_name}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="table-body hidden lg:table-cell">
                      {department.description || "-"}
                    </TableCell>

                    <TableCell className="table-body hidden md:table-cell">
                      {department.manager_name ? (
                        <div>
                          <div className="font-medium">
                            {department.manager_name}
                          </div>
                          {department.manager_email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {department.manager_email}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="table-body">
                      <Badge
                        size="sm"
                        color={
                          department.status === "active" ? "success" : "warning"
                        }
                      >
                        {department.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex justify-start gap-1 sm:gap-2">
                        {canView && (
                          <IconButton
                            icon={Eye}
                            tooltip="View"
                            onClick={() => viewDepartment(department)}
                            color="green"
                          />
                        )}
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            tooltip="Edit"
                            onClick={() => openEditModal(department)}
                            color="blue"
                          />
                        )}
                        {canDelete && (
                          <IconButton
                            icon={Trash2}
                            tooltip="Delete"
                            onClick={() => openDeleteDialog(department)}
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
                    colSpan={6}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchInput
                      ? "No departments match your search"
                      : "No departments found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(canCreate || canUpdate) && (
        <DepartmentFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          department={editDepartment}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Department"
          message={`Are you sure you want to delete "${departmentToDelete?.name}"?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
