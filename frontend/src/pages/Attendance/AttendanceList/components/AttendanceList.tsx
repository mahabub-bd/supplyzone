import {
  CalendarDays,
  Clock,
  Pencil,
  Percent,
  Plus,
  Search,
  Timer,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import IconButton from "../../../../components/common/IconButton";
import Loading from "../../../../components/common/Loading";
import PageHeader from "../../../../components/common/PageHeader";
import DatePicker from "../../../../components/form/date-picker";
import { SelectField } from "../../../../components/form/form-elements/SelectFiled";
import Input from "../../../../components/form/input/InputField";
import Badge from "../../../../components/ui/badge/Badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

import {
  useDeleteAttendanceMutation,
  useGetAttendanceByIdQuery,
  useGetAttendanceListQuery,
  useGetAttendanceSummaryQuery,
} from "../../../../features/attendance/attendanceApi";
import { useGetBranchesQuery } from "../../../../features/branch/branchApi";
import { useGetEmployeesQuery } from "../../../../features/employee/employeeApi";
import { useHasPermission } from "../../../../hooks/useHasPermission";
import { AttendanceRecord } from "../../../../types";
import { formatDate, getStatusColorAttendence } from "../../../../utlis";

import StatCard from "../../../../components/common/stat-card";
import Button from "../../../../components/ui/button/Button";
import AttendanceFormModal from "./AttendanceFormModal";
import BulkAttendanceModal from "./BulkAttendanceModal";
import CheckInOutModal from "./CheckInOutModal";

export default function AttendanceList() {
  /* ================= FILTER STATES ================= */
  const [searchInput, setSearchInput] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  /* ================= MODAL STATES ================= */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCheckInOutModalOpen, setIsCheckInOutModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editAttendanceId, setEditAttendanceId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] =
    useState<AttendanceRecord | null>(null);

  /* ================= API ================= */
  const queryParams = {
    employee_id: selectedEmployee ? Number(selectedEmployee) : undefined,
    branch_id: selectedBranch ? Number(selectedBranch) : undefined,
    status: selectedStatus as any,
    start_date: startDate?.toISOString().split("T")[0],
    end_date: endDate?.toISOString().split("T")[0],
  };

  const { data, isLoading, isError } = useGetAttendanceListQuery(queryParams);

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const summaryParams = {
    start_date:
      startDate?.toISOString().split("T")[0] ||
      thirtyDaysAgo.toISOString().split("T")[0],
    end_date:
      endDate?.toISOString().split("T")[0] || today.toISOString().split("T")[0],
    branch_id: selectedBranch ? Number(selectedBranch) : undefined,
    department: undefined,
  };

  const { data: summaryData } = useGetAttendanceSummaryQuery(summaryParams);

  const { data: employeesData } = useGetEmployeesQuery();
  const { data: branchesData } = useGetBranchesQuery();

  const { data: editAttendanceData, isFetching } = useGetAttendanceByIdQuery(
    editAttendanceId ?? "",
    {
      skip: !editAttendanceId,
    }
  );

  const [deleteAttendance] = useDeleteAttendanceMutation();

  /* ================= PERMISSIONS ================= */
  const canCreate = useHasPermission("attendance.create");
  const canUpdate = useHasPermission("attendance.update");
  const canDelete = useHasPermission("attendance.delete");

  /* ================= DATA ================= */
  const attendanceRecords = data?.data || [];
  const summary = summaryData?.data;
  const employees = employeesData?.data || [];
  const branches = branchesData?.data || [];

  /* ================= DERIVED ================= */
  const filteredAttendance = attendanceRecords.filter((record) => {
    const search = searchInput.toLowerCase();
    const name = record.employee
      ? `${record.employee.first_name} ${record.employee.last_name}`.toLowerCase()
      : "";
    return (
      name.includes(search) ||
      record.date?.toLowerCase().includes(search) ||
      record.status?.toLowerCase().includes(search)
    );
  });

  const attendanceRate = useMemo(() => {
    if (!summary) return "0";
    const { present, absent, late, half_day } = summary.status_breakdown;
    const total = present + absent + late + half_day;
    return total ? ((present / total) * 100).toFixed(1) : "0";
  }, [summary]);

  /* ================= HANDLERS ================= */
  const confirmDelete = async () => {
    if (!attendanceToDelete) return;
    try {
      await deleteAttendance(attendanceToDelete.id).unwrap();
      toast.success("Attendance deleted successfully");
    } catch {
      toast.error("Failed to delete attendance");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) return <Loading message="Loading Attendance Records" />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to load attendance.</p>;

  return (
    <>
      <PageHeader
        title="Attendance Management"
        icon={<Plus size={16} />}
        addLabel="Check In / Out"
        onAdd={() => setIsCheckInOutModalOpen(true)}
        permission="attendance.create"
      />

      {/* ================= SUMMARY ================= */}
      {summary && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <StatCard
            icon={CalendarDays}
            title="Total Days"
            value={summary.total_records}
            bgColor="blue"
          />
          <StatCard
            icon={Users}
            title="Employees"
            value={summary.total_employees}
            bgColor="indigo"
          />
          <StatCard
            icon={Clock}
            title="Regular Hours"
            value={summary.total_regular_hours}
            bgColor="green"
            badge={{ icon: TrendingUp, text: "Normal", color: "success" }}
          />
          <StatCard
            icon={Timer}
            title="Overtime"
            value={summary.total_overtime_hours}
            bgColor="orange"
            badge={{ text: "Extra", color: "warning" }}
          />
          <StatCard
            icon={Percent}
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            bgColor="purple"
            badge={{
              text:
                Number(attendanceRate) >= 90
                  ? "Excellent"
                  : Number(attendanceRate) >= 75
                  ? "Good"
                  : "Low",
              color:
                Number(attendanceRate) >= 90
                  ? "success"
                  : Number(attendanceRate) >= 75
                  ? "info"
                  : "danger",
            }}
          />
        </div>
      )}

      {/* ================= FILTERS ================= */}
      <div className="mb-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Search employee or date..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <DatePicker
              id="startdate"
              value={startDate}
              onChange={(d) => setStartDate(d as Date)}
              placeholder="Start Date"
            />
            <DatePicker
              id="enddate"
              value={endDate}
              onChange={(d) => setEndDate(d as Date)}
              placeholder="End Date"
            />
          </div>

          {canCreate && (
            <Button onClick={() => setIsBulkModalOpen(true)}>
              <Upload size={16} />
              Bulk Upload
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <SelectField
            label=""
            placeholder="Select Employee"
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            data={[
              { id: "", name: "All Employees" },
              ...employees.map((e) => ({
                id: e.id,
                name: `${e.first_name} ${e.last_name}`,
              })),
            ]}
          />
          <SelectField
            label=""
            placeholder="Select Branch"
            value={selectedBranch}
            onChange={setSelectedBranch}
            data={[
              { id: "", name: "All Branches" },
              ...branches.map((b) => ({ id: b.id, name: b.name })),
            ]}
          />
          <SelectField
            label=""
            placeholder="Select Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            data={[
              { id: "", name: "All Status" },
              { id: "present", name: "Present" },
              { id: "absent", name: "Absent" },
              { id: "late", name: "Late" },
              { id: "half_day", name: "Half Day" },
              { id: "leave", name: "Leave" },
            ]}
          />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-hidden rounded-xl border bg-white dark:bg-[#1e1e1e] dark:border-white/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Employee</TableCell>
              <TableCell isHeader>Attendance Details</TableCell>
              <TableCell isHeader>Hours</TableCell>
              <TableCell isHeader>Date & Status</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAttendance.length ? (
              filteredAttendance.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {r.employee
                          ? `${r.employee.first_name} ${r.employee.last_name}`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {r.employee?.employee_code || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {r.employee?.department?.name || "N/A"} •{" "}
                        {r.employee?.designation?.title || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-green-500" />
                        <span className="text-sm">{r.check_in || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span className="text-sm">{r.check_out || "-"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-500">Regular:</span>{" "}
                        {r.regular_hours || "-"}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Overtime:</span>{" "}
                        {r.overtime_hours || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{formatDate(r.date)}</div>
                      <Badge
                        color={getStatusColorAttendence(r.status)}
                        size="sm"
                      >
                        {r.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2">
                      {canUpdate && (
                        <IconButton
                          icon={Pencil}
                          onClick={() => {
                            setEditAttendanceId(r.id);
                            setIsEditModalOpen(true);
                          }}
                        />
                      )}
                      {canDelete && (
                        <IconButton
                          icon={Trash2}
                          color="red"
                          onClick={() => {
                            setAttendanceToDelete(r);
                            setIsDeleteModalOpen(true);
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ================= MODALS ================= */}
      {canCreate && (
        <CheckInOutModal
          isOpen={isCheckInOutModalOpen}
          onClose={() => setIsCheckInOutModalOpen(false)}
        />
      )}
      {canCreate && (
        <BulkAttendanceModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}
      {canUpdate && (
        <AttendanceFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          attendance={isFetching ? null : editAttendanceData?.data || null}
        />
      )}
      {canDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          title="Delete Attendance"
          message="Are you sure you want to delete this record?"
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  );
}
