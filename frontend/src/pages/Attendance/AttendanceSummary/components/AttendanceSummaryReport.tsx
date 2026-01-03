import {
  CalendarDays,
  Clock,
  Percent,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import Loading from "../../../../components/common/Loading";
import PageHeader from "../../../../components/common/PageHeader";
import {
  FormField,
  SelectField,
} from "../../../../components/form/form-elements/SelectFiled";
import Input from "../../../../components/form/input/InputField";

import StatCard from "../../../../components/common/stat-card";
import { useGetAttendanceSummaryQuery } from "../../../../features/attendance/attendanceApi";
import { useGetBranchesQuery } from "../../../../features/branch/branchApi";
import { useGetDepartmentsQuery } from "../../../../features/department/departmentApi";

export default function AttendanceSummaryReport() {
  /* ---------- Date Defaults ---------- */
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(
    formatDate(new Date(today.getFullYear(), today.getMonth(), 1))
  );
  const [endDate, setEndDate] = useState(
    formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))
  );
  const [branchId, setBranchId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  /* ---------- API Calls ---------- */
  const { data, isLoading, isError } = useGetAttendanceSummaryQuery({
    start_date: startDate,
    end_date: endDate,
    branch_id: branchId ? Number(branchId) : undefined,
    department: departmentId ? Number(departmentId) : undefined,
  });

  const { data: branchesData } = useGetBranchesQuery();
  const { data: departmentsData } = useGetDepartmentsQuery();

  const summary = data?.data;
  const branches = branchesData?.data || [];
  const departments = departmentsData?.data || [];

  /* ---------- Attendance Rate ---------- */
  const attendanceRate = useMemo(() => {
    if (!summary) return "0";
    const { present, absent, late, half_day } = summary.status_breakdown;
    const total = present + absent + late + half_day;
    return total ? ((present / total) * 100).toFixed(1) : "0";
  }, [summary]);

  /* ---------- Loading & Error ---------- */
  if (isLoading) return <Loading message="Loading Attendance Summary" />;
  if (isError)
    return (
      <p className="p-6 text-red-500">Failed to fetch attendance summary</p>
    );

  return (
    <>
      <PageHeader
        title="Attendance Summary Report"
        icon={<CalendarDays size={16} />}
      />

      {/* ================= FILTERS ================= */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <FormField label="Start Date">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormField>

        <FormField label="End Date">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormField>

        <SelectField
          label="Branch"
          value={branchId}
          onChange={setBranchId}
          data={[
            { id: "", name: "All Branches" },
            ...branches.map((b) => ({
              id: b.id,
              name: b.name,
            })),
          ]}
        />

        <SelectField
          label="Department"
          value={departmentId}
          onChange={setDepartmentId}
          data={[
            { id: "", name: "All Departments" },
            ...departments.map((d) => ({
              id: d.id,
              name: d.name,
            })),
          ]}
        />
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      {summary ? (
        <>
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <StatCard
              icon={CalendarDays}
              title="Total Days"
              value={summary.total_records}
              bgColor="blue"
            />

            <StatCard
              icon={Users}
              title="Total Employees"
              value={summary.total_employees}
              bgColor="indigo"
            />

            <StatCard
              icon={Clock}
              title="Regular Hours"
              value={summary.total_regular_hours}
              bgColor="green"
              badge={{
                icon: TrendingUp,
                text: "Normal",
                color: "success",
              }}
            />

            <StatCard
              icon={Timer}
              title="Overtime Hours"
              value={summary.total_overtime_hours}
              bgColor="orange"
              badge={{
                text: "Extra",
                color: "warning",
              }}
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

          {/* ================= STATUS BREAKDOWN ================= */}
          <div className="rounded-xl border border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-white/5">
            <div className="border-b p-4 dark:border-white/5">
              <h3 className="text-lg font-semibold">Status Breakdown</h3>
            </div>

            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
              {Object.entries(summary.status_breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace("_", " ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:bg-[#1e1e1e] dark:border-white/5">
          <p className="text-gray-500 dark:text-gray-400">
            No attendance summary data available
          </p>
        </div>
      )}
    </>
  );
}
