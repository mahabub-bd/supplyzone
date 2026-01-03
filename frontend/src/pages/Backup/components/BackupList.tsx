import {
  Clock,
  Download,
  FileText,
  HardDrive,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Badge from "../../../components/ui/badge/Badge";

import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useCreateManualBackupMutation,
  useDeleteBackupRecordMutation,
  useGetAllBackupsQuery,
} from "../../../features/backup/backupApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { BackupResponseDto, BackupStatus } from "../../../types/backup";
import { formatDateTime } from "../../../utlis";
import BackupFormModal from "./BackupFormModal";

export default function BackupList() {
  /* ================= FILTER STATES ================= */
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  /* ================= MODAL STATES ================= */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<BackupResponseDto | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  /* ================= API ================= */
  const { data: backups = [], isLoading, isError, error } = useGetAllBackupsQuery();
  const [createManualBackup] = useCreateManualBackupMutation();
  const [deleteBackupRecord] = useDeleteBackupRecordMutation();

  /* ================= PERMISSIONS ================= */
  const canCreate = useHasPermission("backup.create");
  const canDelete = useHasPermission("backup.delete");

  /* ================= DERIVED ================= */
  const filteredBackups = useMemo(() => {
    let result = backups;

    // Filter by status
    if (selectedStatus) {
      result = result.filter((b) => b.status === selectedStatus);
    }

    // Filter by search
    if (searchInput) {
      const search = searchInput.toLowerCase();
      result = result.filter(
        (backup) =>
          backup.file_name.toLowerCase().includes(search) ||
          backup.status.toLowerCase().includes(search)
      );
    }

    return result;
  }, [backups, searchInput, selectedStatus]);

  const getStatusColor = (status: BackupStatus) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "failed":
        return "error";
      case "pending":
        return "info";
      default:
        return "light";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  /* ================= HANDLERS ================= */
  const handleCreateBackup = async (data: any) => {
    try {
      await createManualBackup(data).unwrap();
      toast.success("Backup created successfully");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create backup");
    }
  };

  const handleDownload = (backup: BackupResponseDto) => {
    // For S3 URL, open in new tab or trigger download
    if (backup.s3_url) {
      window.open(backup.s3_url, '_blank');
      toast.success("Opening backup download");
    } else {
      toast.error("No download URL available");
    }
  };

  const confirmDelete = async () => {
    if (!backupToDelete) return;
    try {
      await deleteBackupRecord(backupToDelete.id).unwrap();
      toast.success("Backup deleted successfully");
      setIsDeleteModalOpen(false);
      setBackupToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete backup");
    }
  };

  if (isLoading)
    return <Loading message="Loading Backup Records" />;
  if (isError)
    return (
      <div className="p-6 text-red-500">
        <p>Failed to load backups.</p>
        <p className="text-sm">{JSON.stringify(error)}</p>
      </div>
    );

  return (
    <>
      <PageHeader
        title="Database Backup"
        subtitle="Manage and download database backups"
        icon={<Plus size={16} />}
        addLabel="Create Backup"
        onAdd={() => setIsCreateModalOpen(true)}
        permission="backup.create"
      />

      {/* ================= HEADER INFO ================= */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <HardDrive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Backup Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create manual backups of your PostgreSQL database
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock size={16} />
            <span>Automatic backup scheduled daily at 2:00 AM UTC</span>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search backups..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>

        <SelectField
          label=""
          placeholder="All Status"
          value={selectedStatus}
          onChange={setSelectedStatus}
          data={[
            { id: "", name: "All Status" },
            { id: "pending", name: "Pending" },
            { id: "in_progress", name: "In Progress" },
            { id: "completed", name: "Completed" },
            { id: "failed", name: "Failed" },
          ]}
        />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="overflow-hidden rounded-xl border bg-white dark:bg-[#1e1e1e] dark:border-white/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Backup Name</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Size</TableCell>
              <TableCell isHeader>Created</TableCell>
              <TableCell isHeader>Completed</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredBackups.length ? (
              filteredBackups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{backup.file_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          by {backup.created_by}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color={getStatusColor(backup.status)} size="sm">
                      {backup.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(backup.file_size)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDateTime(backup.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {backup.status === "completed" ? formatDateTime(backup.created_at) : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === backup.id ? null : backup.id
                            )
                          }
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        <Dropdown
                          isOpen={openDropdownId === backup.id}
                          onClose={() => setOpenDropdownId(null)}
                          className="min-w-40"
                        >
                          {backup.status === "completed" && (
                            <DropdownItem
                              onClick={() => {
                                handleDownload(backup);
                                setOpenDropdownId(null);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Download size={16} />
                              Download
                            </DropdownItem>
                          )}
                          {canDelete && (
                            <DropdownItem
                              onClick={() => {
                                setBackupToDelete(backup);
                                setIsDeleteModalOpen(true);
                                setOpenDropdownId(null);
                              }}
                              className="flex items-center gap-2 text-red-600 dark:text-red-400"
                            >
                              <Trash2 size={16} />
                              Delete
                            </DropdownItem>
                          )}
                        </Dropdown>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-gray-500"
                >
                  No backup records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ================= MODALS ================= */}
      {canCreate && (
        <BackupFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateBackup}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          title="Delete Backup"
          message={`Are you sure you want to delete "${backupToDelete?.file_name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setBackupToDelete(null);
          }}
        />
      )}
    </>
  );
}
