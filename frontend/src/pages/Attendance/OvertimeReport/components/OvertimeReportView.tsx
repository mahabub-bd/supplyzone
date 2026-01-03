import { Clock, Search } from "lucide-react";
import { useState } from "react";
import Loading from "../../../../components/common/Loading";
import PageHeader from "../../../../components/common/PageHeader";
import Input from "../../../../components/form/input/InputField";
import Badge from "../../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { useGetOvertimeReportQuery } from "../../../../features/attendance/attendanceApi";
import { useGetBranchesQuery } from "../../../../features/branch/branchApi";
import { getOvertimeBadgeColor } from "../../../../utlis";

export default function OvertimeReportView() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError } = useGetOvertimeReportQuery({
    start_date: startDate,
    end_date: endDate,
    branch_id: selectedBranch ? Number(selectedBranch) : undefined,
  });

  const { data: branchesData } = useGetBranchesQuery();

  const overtimeData = data?.data;
  const branches = branchesData?.data || [];
  const employeeBreakdown = overtimeData?.employee_breakdown || [];

  // Filter overtime based on search input
  const filteredOvertime = employeeBreakdown.filter((record) => {
    const searchLower = searchInput.toLowerCase();
    return record.employee_name?.toLowerCase().includes(searchLower);
  });

  const getOvertimeLevel = (hours: string) => {
    const hoursNum = parseFloat(hours);
    if (hoursNum >= 40) return "high";
    if (hoursNum >= 20) return "medium";
    return "low";
  };

  if (isLoading) return <Loading message="Loading Overtime Report" />;

  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch overtime report.</p>;

  return (
    <>
      <PageHeader title="Overtime Report" icon={<Clock size={16} />} />

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search by employee name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Date and Branch Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#1e1e1e] dark:border-white/10 dark:text-white"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {overtimeData && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Employees
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {filteredOvertime.length}
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Overtime Hours
            </div>
            <div className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
              {overtimeData.total_overtime_hours}
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Employees with Overtime
            </div>
            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {overtimeData.total_employees_with_overtime}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredOvertime.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader>Employee</TableCell>
                  <TableCell isHeader>Total Overtime</TableCell>
                  <TableCell isHeader className="hidden sm:table-cell">
                    Days with OT
                  </TableCell>
                  <TableCell isHeader className="hidden md:table-cell">
                    Avg OT/Day
                  </TableCell>
                  <TableCell isHeader className="hidden lg:table-cell">
                    Regular Hours
                  </TableCell>
                  <TableCell isHeader>Level</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredOvertime.map((record) => {
                  const level = getOvertimeLevel(record.total_overtime_hours);

                  return (
                    <TableRow key={record.employee_id}>
                      <TableCell className="table-body font-medium">
                        <div>
                          <div>{record.employee_name}</div>
                          {/* Show stats on mobile */}
                          <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Days: {record.days_with_overtime}
                          </div>
                          <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Avg: {record.average_overtime_per_day} hrs/day
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="table-body">
                        <div className="font-semibold text-orange-600 dark:text-orange-400">
                          {record.total_overtime_hours} hrs
                        </div>
                      </TableCell>

                      <TableCell className="table-body hidden sm:table-cell">
                        {record.days_with_overtime}
                      </TableCell>

                      <TableCell className="table-body hidden md:table-cell">
                        {record.average_overtime_per_day} hrs
                      </TableCell>

                      <TableCell className="table-body hidden lg:table-cell">
                        {record.total_regular_hours} hrs
                      </TableCell>

                      <TableCell className="table-body">
                        <Badge color={getOvertimeBadgeColor(level)} size="sm">
                          {level.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-white/5 dark:bg-[#1e1e1e]">
          <p className="text-gray-500 dark:text-gray-400">
            {searchInput
              ? "No records match your search"
              : "No overtime records found for the selected period"}
          </p>
        </div>
      )}
    </>
  );
}
