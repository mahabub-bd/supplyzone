import { zodResolver } from "@hookform/resolvers/zod";
import { Download } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  FormField,
  SelectField,
} from "../../../../components/form/form-elements/SelectFiled";
import TextArea from "../../../../components/form/input/TextArea";
import Button from "../../../../components/ui/button/Button";
import { Modal } from "../../../../components/ui/modal";

import { useBulkCreateAttendanceMutation } from "../../../../features/attendance/attendanceApi";
import { useGetBranchesQuery } from "../../../../features/branch/branchApi";

import {
  BulkAttendanceFormType,
  bulkAttendanceSchema,
} from "./bulk-attendance.schema";

interface BulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkAttendanceModal({
  isOpen,
  onClose,
}: BulkAttendanceModalProps) {
  const { data: branchesData } = useGetBranchesQuery();
  const [bulkCreate, { isLoading }] = useBulkCreateAttendanceMutation();

  const branches = branchesData?.data || [];

  // React Hook Form Initialization
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BulkAttendanceFormType>({
    resolver: zodResolver(bulkAttendanceSchema),
    defaultValues: {
      branch_id: "",
      jsonData: "",
    },
  });

  const jsonData = watch("jsonData");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        branch_id: "",
        jsonData: "",
      });
    }
  }, [isOpen, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setValue("jsonData", content, { shouldValidate: true });
        };
        reader.readAsText(selectedFile);
      } else {
        toast.error("Please upload a JSON file");
      }
    }
  };

  const onSubmit = async (values: BulkAttendanceFormType) => {
    try {
      const parsedData = JSON.parse(values.jsonData);

      await bulkCreate({
        attendance_records: parsedData,
        branch_id: Number(values.branch_id),
      }).unwrap();

      toast.success(
        `Successfully uploaded ${parsedData.length} attendance records`
      );
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to upload attendance records"
      );
    }
  };

  const downloadSampleJSON = () => {
    const sample = [
      {
        employee_id: 1,
        date: "2025-12-10",
        check_in: "2025-12-10T09:00:00",
        check_out: "2025-12-10T17:30:00",
        status: "present",
        notes: "On time",
      },
      {
        employee_id: 2,
        date: "2025-12-10",
        check_in: "2025-12-10T09:15:00",
        check_out: "2025-12-10T17:30:00",
        status: "late",
        notes: "15 minutes late",
      },
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_sample.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
      title="Bulk Attendance Upload"
    >
      {/* Sample Download */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-300">
              Need a sample format?
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Download a sample JSON file to see the required format
            </p>
          </div>
          <button
            onClick={downloadSampleJSON}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download size={16} />
            Download Sample
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Branch Select */}
        <Controller
          name="branch_id"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Branch"
              data={branches}
              value={field.value}
              onChange={field.onChange}
              error={errors.branch_id?.message}
            />
          )}
        />

        {/* File Upload */}
        <FormField label="Upload JSON File" error={errors.jsonData?.message}>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#2a2a2a] dark:border-white/10 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
            />
          </div>
        </FormField>

        {/* JSON Data Preview/Edit */}
        {jsonData && (
          <Controller
            name="jsonData"
            control={control}
            render={({ field }) => (
              <FormField label="Data Preview" error={errors.jsonData?.message}>
                <TextArea
                  placeholder="Enter or edit JSON data"
                  rows={10}
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.jsonData}
                  className="font-mono text-sm"
                />
              </FormField>
            )}
          />
        )}

        {/* Instructions */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-white/5">
          <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
            JSON Format Requirements:
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>Must be an array of attendance records</li>
            <li>Required fields: employee_id, date, check_in, status</li>
            <li>Optional fields: check_out, break_start, break_end, notes</li>
            <li>Date format: YYYY-MM-DD</li>
            <li>Time format: YYYY-MM-DDTHH:MM:SS</li>
            <li>Valid status values: present, absent, late, half_day, leave</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload Attendance"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
