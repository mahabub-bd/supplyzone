import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import {
  useDeleteTagMutation,
  useGetTagsQuery,
} from "../../../features/tag/tagApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import PageHeader from "../../../components/common/PageHeader";

import Loading from "../../../components/common/Loading";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Tag } from "../../../types/product";
import TagFormModal from "./TagFormModal";

export default function TagList() {
  const { data, isLoading, isError } = useGetTagsQuery();
  const [deleteTag] = useDeleteTagMutation();

  const tags = data?.data || [];

  const canCreate = useHasPermission("tag.create");
  const canUpdate = useHasPermission("tag.update");
  const canDelete = useHasPermission("tag.delete");

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const openCreate = () => {
    setEditTag(null);
    formModal.openModal();
  };
  const openEdit = (t: Tag) => {
    setEditTag(t);
    formModal.openModal();
  };
  const openDelete = (t: Tag) => {
    setTagToDelete(t);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;
    try {
      await deleteTag(tagToDelete.id).unwrap();
      toast.success("Tag deleted");
    } catch {
      toast.error("Failed to delete tag");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Tags" />;

  if (isError) return <p className="p-6 text-red-500">Failed to load tags.</p>;

  return (
    <>
      <PageHeader
        title="Tag Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={openCreate}
        permission="tag.create"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Description</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {tags.length > 0 ? (
                tags.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="table-body font-medium">
                      {t.name}
                    </TableCell>
                    <TableCell className="table-body">
                      {t.description || "-"}
                    </TableCell>
                    <TableCell className="table-body">
                      <Badge color={t.status ? "success" : "error"} size="sm">
                        {t.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-start gap-2">
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            color="blue"
                            tooltip="Edit"
                            onClick={() => openEdit(t)}
                          />
                        )}
                        {canDelete && (
                          <IconButton
                            icon={Trash2}
                            tooltip="Delete"
                            color="red"
                            onClick={() => openDelete(t)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No tags found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(canCreate || canUpdate) && (
        <TagFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          tag={editTag}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Tag"
          message={`Are you sure to delete "${tagToDelete?.name}"?`}
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
