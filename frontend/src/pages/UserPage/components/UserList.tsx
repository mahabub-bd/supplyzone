import { useState } from "react";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from "../../../features/user/userApi";

import { Pencil, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import PageHeader from "../../../components/common/PageHeader";
import { useHasPermission } from "../../../hooks/useHasPermission";

import Loading from "../../../components/common/Loading";
import { User } from "../../../types/user";
import UserFormModal from "./UserFormModal";

export default function UserList() {
  const { data, isLoading, isError } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const canUpdate = useHasPermission("user.update");
  const canDelete = useHasPermission("user.delete");
  const users = data?.data || [];

  function openCreateModal() {
    setEditUser(null);
    setIsModalOpen(true);
  }

  function openEditModal(user: User) {
    setEditUser(user);
    setIsModalOpen(true);
  }

  function openDeleteDialog(user: User) {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!userToDelete) return;

    await deleteUser(userToDelete.id);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  }

  if (isLoading) return <Loading message="Loading Users" />;

  if (isError)
    return (
      <p className="p-6 text-red-500 dark:text-red-400">
        Failed to fetch users!
      </p>
    );

  return (
    <>
      {/* Header */}

      <PageHeader
        title=" User Management"
        onAdd={openCreateModal}
        addLabel="Add"
        permission="user.create"
        icon={<Plus size={16} />}
      />

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>
                User
              </TableCell>
              <TableCell
                isHeader
              >
                Email
              </TableCell>
              <TableCell
                isHeader
              >
                Phone
              </TableCell>
              <TableCell isHeader>
                Role
              </TableCell>
              <TableCell isHeader>
                Branches
              </TableCell>
              <TableCell isHeader>
                Status
              </TableCell>
              <TableCell
                isHeader

              >
                Joined
              </TableCell>
              <TableCell isHeader>
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody  >
            {users.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell className="table-body">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800">
                      <img
                        src="/images/user/owner.jpg"
                        alt={user.full_name}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div>
                      <div className="font-medium text-gray-800 dark:text-white/90">
                        {user.full_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.username}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell >
                  {user.email}
                </TableCell>
                <TableCell >
                  {user.phone}
                </TableCell>

                <TableCell >
                  <Badge size="sm" color="primary">
                    {user.roles?.[0]?.name?.toUpperCase()}
                  </Badge>
                </TableCell>

                <TableCell >
                  {user.branches && user.branches.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.branches.slice(0, 2).map((branch) => (
                        <Badge key={branch.id} size="sm" color="primary">
                          {branch.name}
                        </Badge>
                      ))}
                      {user.branches.length > 2 && (
                        <Badge size="sm" color="primary">
                          +{user.branches.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No branches</span>
                  )}
                </TableCell>

                <TableCell >
                  <Badge
                    size="sm"
                    color={user.status === "active" ? "success" : "error"}
                  >
                    {user.status.toUpperCase()}
                  </Badge>
                </TableCell>

                <TableCell >
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell >
                  <div className="flex gap-2" >
                    {canUpdate && (
                      <IconButton
                        tooltip="Edit"
                        icon={Pencil}
                        onClick={() => openEditModal(user)}
                        color="blue"
                      />
                    )}

                    {canDelete && (
                      <IconButton
                        tooltip="Delete"
                        icon={Trash2}
                        onClick={() => openDeleteDialog(user)}
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

      {/* Mobile List View */}
      <div className="sm:hidden space-y-3">
        {users.map((user: User) => (
          <div
            key={user.id}
            className="p-3 rounded-lg border border-gray-200 bg-white dark:bg-white/3 dark:border-white/5"
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800">
                <img
                  src="/images/user/owner.jpg"
                  alt={user.full_name}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1">
                <div className="font-medium text-gray-800 dark:text-white/90">
                  {user.full_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.username}
                </div>

                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                  <br />
                  {user.phone}
                </div>

                <div className="mt-2 flex flex-wrap gap-1 justify-between">
                  <Badge size="sm" color="primary">
                    {user.roles?.[0]?.name?.toUpperCase()}
                  </Badge>

                  <Badge
                    size="sm"
                    color={user.status === "active" ? "success" : "error"}
                  >
                    {user.status.toUpperCase()}
                  </Badge>
                </div>

                {user.branches && user.branches.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Branches:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.branches.map((branch) => (
                        <Badge key={branch.id} size="sm" color="primary">
                          {branch.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteDialog(user)}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editUser}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.full_name}"?`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
