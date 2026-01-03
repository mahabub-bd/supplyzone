import {
  Calendar,
  DollarSign,
  Edit2,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useGetCashRegistersQuery } from "../../features/cash-register/cashRegisterApi";
import { CashRegister, CashRegisterStatus } from "../../types/cashregister";
import { formatCurrencyEnglish } from "../../utlis";

const CashRegisterManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage] = useState(1);
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const itemsPerPage = 10;

  // Query cash registers
  const {
    data: registersResponse,
    isLoading,
    error,
  } = useGetCashRegistersQuery({
    search: searchTerm,
    status:
      statusFilter !== "all" ? (statusFilter as CashRegisterStatus) : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const registers = registersResponse?.data || [];
  const pagination = registersResponse?.meta;

  // Filter registers based on search and status
  const filteredRegisters = useMemo(() => {
    let filtered = registers;

    if (searchTerm) {
      filtered = filtered.filter(
        (register) =>
          register.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          register.branch?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (register) => register.status === statusFilter
      );
    }

    return filtered;
  }, [registers, searchTerm, statusFilter]);

  const handleViewDetails = (register: CashRegister) => {
    setSelectedRegister(register);
    setShowDetailsModal(true);
  };

  const handleEdit = (register: CashRegister) => {
    setSelectedRegister(register);
    // TODO: Implement edit modal
  };

  const handleDelete = (register: CashRegister) => {
    setSelectedRegister(register);
    setShowDeleteModal(true);
  };

  const getRegisterStatusBadge = (status: CashRegisterStatus) => {
    switch (status) {
      case "open":
        return { color: "success" as const, text: "Open" };
      case "closed":
        return { color: "light" as const, text: "Closed" };
      case "maintenance":
        return { color: "warning" as const, text: "Maintenance" };
      default:
        return { color: "light" as const, text: status };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Failed to load cash registers. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cash Register Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage cash registers, track transactions, and monitor balances
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Register
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search registers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: "all", label: "All Status" },
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
                { value: "maintenance", label: "Maintenance" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Registers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {registers.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Open Registers
              </p>
              <p className="text-2xl font-bold text-green-600">
                {registers.filter((r) => r.status === "open").length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrencyEnglish(
                  registers.reduce(
                    (sum, r) => sum + Number(r.current_balance),
                    0
                  )
                )}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Today's Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {/* TODO: Calculate from transactions */}0
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader>Register Name</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Opening Balance</TableCell>
                  <TableCell isHeader>Current Balance</TableCell>
                  <TableCell isHeader>Closing Balance</TableCell>
                  <TableCell isHeader>Open By</TableCell>
                  <TableCell isHeader>Close By</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredRegisters.length > 0 ? (
                  filteredRegisters.map((register) => (
                    <TableRow key={register.id}>
                      <TableCell className="table-body">
                        <div>
                          <div className="font-medium">{register.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {register.branch?.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={getRegisterStatusBadge(register.status).color}
                          size="sm"
                        >
                          {getRegisterStatusBadge(register.status).text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCurrencyEnglish(
                              Number(register.opening_balance)
                            )}
                          </div>
                          {register.opened_at && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(
                                register.opened_at
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrencyEnglish(
                            Number(register.current_balance)
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {register.actual_amount
                            ? formatCurrencyEnglish(
                                Number(register.actual_amount)
                              )
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {register.opened_by?.full_name || "-"}
                      </TableCell>
                      <TableCell>
                        {register.closed_by?.full_name || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-start gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(register)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(register)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(register)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                      No cash registers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {pagination && (
          <div className="mt-4 flex justify-center text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {Math.ceil(pagination.total / itemsPerPage)}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        className="max-w-xl"
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Cash Register Details"
      >
        {selectedRegister && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Register Name
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedRegister.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <Badge
                  color={getRegisterStatusBadge(selectedRegister.status).color}
                >
                  {getRegisterStatusBadge(selectedRegister.status).text}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Balance
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyEnglish(
                    Number(selectedRegister.current_balance)
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedRegister.branch?.name}
                </p>
              </div>
              {selectedRegister.opened_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Opened At
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedRegister.opened_at).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedRegister.opened_by && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Opened By
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedRegister.opened_by?.full_name || "N/A"}
                  </p>
                </div>
              )}
            </div>

            {selectedRegister.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedRegister.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal - TODO */}
      <Modal
        isOpen={showCreateModal}
        className="max-w-xl"
        onClose={() => setShowCreateModal(false)}
        title="Create Cash Register"
      >
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Create cash register form will be implemented here.
          </p>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        className="max-w-xl"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Cash Register"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the cash register "
            {selectedRegister?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                /* TODO: Implement delete */
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CashRegisterManagementPage;
