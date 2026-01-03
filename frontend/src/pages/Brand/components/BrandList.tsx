import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Badge from "../../../components/ui/badge/Badge"; // Optional if you want badges like in RoleList
import ResponsiveImage from "../../../components/ui/images/ResponsiveImage";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useDeleteBrandMutation,
  useGetBrandsQuery,
} from "../../../features/brand/brandApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";
import { Brand } from "../../../types";
import BrandFormModal from "./BrandFormModal";

export default function BrandList() {
  const { data, isLoading, isError } = useGetBrandsQuery();
  const [deleteBrand] = useDeleteBrandMutation();

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  const canCreate = useHasPermission("brand.create");
  const canUpdate = useHasPermission("brand.update");
  const canDelete = useHasPermission("brand.delete");

  const brands = data?.data || [];

  const openCreateModal = () => {
    setEditBrand(null);
    formModal.openModal();
  };

  const openEditModal = (brand: Brand) => {
    setEditBrand(brand);
    formModal.openModal();
  };

  const openDeleteDialog = (brand: Brand) => {
    setBrandToDelete(brand);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      await deleteBrand(brandToDelete.id).unwrap();
      toast.success("Brand deleted successfully");
    } catch {
      toast.error("Failed to delete brand");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Brands" />;

  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch brands.</p>;

  return (
    <>
      <PageHeader
        title="Brand Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={openCreateModal}
        permission="brand.create"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader className="table-header">
                  Logo
                </TableCell>
                <TableCell isHeader className="table-header">
                  Brand Name
                </TableCell>
                <TableCell isHeader className="table-header">
                  Description
                </TableCell>
                <TableCell isHeader className="table-header text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="table-body">
                      {brand.logo_attachment?.url ? (
                        <ResponsiveImage
                          src={brand.logo_attachment.url}
                          alt={brand.name}
                          className="h-12 w-24 rounded-md"
                        />
                      ) : (
                        <Badge size="sm" color="warning">
                          No Logo
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="table-body font-medium">
                      {brand.name}
                    </TableCell>

                    <TableCell className="table-body">
                      {brand.description || "-"}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            tooltip="Edit"
                            onClick={() => openEditModal(brand)}
                            color="blue"
                          />
                        )}
                        {canDelete && (
                          <IconButton
                            icon={Trash2}
                            tooltip="Delete"
                            onClick={() => openDeleteDialog(brand)}
                            color="red"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No brands found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(canCreate || canUpdate) && (
        <BrandFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          brand={editBrand}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Brand"
          message={`Are you sure you want to delete "${brandToDelete?.name}"?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
