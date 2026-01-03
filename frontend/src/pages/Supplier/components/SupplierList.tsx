import {
  BookOpen,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import SupplierFormModal from "./SupplierFormModal";

import {
  useDeleteSupplierMutation,
  useGetSuppliersQuery,
} from "../../../features/suppliers/suppliersApi";
import { useModal } from "../../../hooks/useModal";
import { Supplier } from "../../../types/supplier";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export default function SupplierList() {
  const { data, isLoading, isError } = useGetSuppliersQuery();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const suppliers = data?.data || [];

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );
  const [activeDropdown, setActiveDropdown] = useState<string | number | null>(
    null
  );

  /* =====================
     Handlers
  ===================== */
  const openCreate = () => {
    setEditSupplier(null);
    formModal.openModal();
  };

  const openEdit = (supplier: Supplier) => {
    setEditSupplier(supplier);
    formModal.openModal();
  };

  const openDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await deleteSupplier(supplierToDelete.id).unwrap();
      toast.success("Supplier deleted successfully");
    } catch {
      toast.error("Failed to delete supplier");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Suppliers" />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch suppliers.</p>;

  return (
    <div className="w-full">
      <PageHeader
        title="Supplier Management"
        icon={<Plus size={16} />}
        addLabel="Add Supplier"
        onAdd={openCreate}
        permission="suppliers.create"
      />

      {/* =====================
         Desktop Table View (hidden on mobile)
      ===================== */}
      <div className="overflow-hidden  rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
        <div className="overflow-x-auto ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Code</TableCell>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader className="hidden md:table-cell ">
                  Contact
                </TableCell>
                <TableCell isHeader className="w-24 whitespace-nowrap">
                  Phone
                </TableCell>
                <TableCell isHeader className="hidden lg:table-cell ">
                  Email
                </TableCell>
                <TableCell isHeader className="hidden 2xl:table-cell ">
                  Address
                </TableCell>
                <TableCell isHeader>Product</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {suppliers.length > 0 ? (
                suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.supplier_code || "-"}</TableCell>
                    <TableCell>
                      <Link to={`/suppliers/${s.id}`}>
                        <div className="font-medium">{s.name}</div>
                      </Link>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">{s.contact_person || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{s.phone || "-"}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">{s.email || "-"}</div>
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell">
                      <div className="text-sm truncate max-w-xs">
                        {s.address || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-medium">
                        {s.products?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === s.id ? null : s.id
                            )
                          }
                          className="dropdown-toggle p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>

                        <Dropdown
                          isOpen={activeDropdown === s.id}
                          onClose={() => setActiveDropdown(null)}
                          className="min-w-40"
                        >
                          <DropdownItem
                            tag="a"
                            to={`/suppliers/${s.id}`}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-2"
                          >
                            <Eye size={14} />
                            View Details
                          </DropdownItem>

                          <DropdownItem
                            tag="a"
                            to={`/suppliers/${s.id}/ledger`}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-2"
                          >
                            <BookOpen size={14} />
                            View Ledger
                          </DropdownItem>

                          <DropdownItem
                            onClick={() => {
                              openEdit(s);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Pencil size={14} />
                            Edit
                          </DropdownItem>

                          <DropdownItem
                            onClick={() => {
                              openDelete(s);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No suppliers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* =====================
         Mobile Card View (visible on mobile only)
      ===================== */}
      <div className="sm:hidden space-y-3">
        {suppliers.length > 0 ? (
          suppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e] overflow-hidden shadow-sm"
            >
              {/* Card Header */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">
                      {s.name}
                    </h3>
                    {s.supplier_code && (
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Code: {s.supplier_code}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link to={`/suppliers/${s.id}`}>
                      <IconButton
                        icon={Eye}
                        tooltip="View"
                        color="purple"
                        size={12}
                      />
                    </Link>
                    <IconButton
                      icon={Pencil}
                      tooltip="Edit"
                      color="blue"
                      size={12}
                      onClick={() => openEdit(s)}
                    />
                    <IconButton
                      icon={Trash2}
                      tooltip="Delete"
                      color="red"
                      size={12}
                      onClick={() => openDelete(s)}
                    />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 py-3 space-y-2">
                {s.contact_person && (
                  <div className="flex text-[14px]">
                    <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0 font-medium">
                      Contact:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {s.contact_person}
                    </span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex text-[14px]">
                    <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0 font-medium">
                      Phone:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 break-all">
                      {s.phone}
                    </span>
                  </div>
                )}
                {s.email && (
                  <div className="flex text-[14px]">
                    <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0 font-medium">
                      Email:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {s.email}
                    </span>
                  </div>
                )}
                {s.address && (
                  <div className="flex text-[14px]">
                    <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0 font-medium">
                      Address:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 wrap-break-word">
                      {s.address}
                    </span>
                  </div>
                )}
                <div className="flex text-[14px]">
                  <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0 font-medium">
                    Products:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    {s.products?.length || 0}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to={`/suppliers/${s.id}/ledger`}
                  className="text-[13px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen size={14} />
                  View Ledger
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e] p-8 text-center">
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              No suppliers found
            </p>
          </div>
        )}
      </div>

      {/* =====================
         Modals
      ===================== */}
      <SupplierFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        supplier={editSupplier}
      />

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${supplierToDelete?.name}"?`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={deleteModal.closeModal}
      />
    </div>
  );
}
