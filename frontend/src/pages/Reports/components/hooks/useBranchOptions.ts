import { branchesApi } from "../../../../features/branch/branchApi";

export function useBranchOptions() {
  const { data: branchesData } = branchesApi.useGetBranchesQuery(undefined);
  const branches = branchesData?.data || [];

  return [
    { value: "", label: "All Branches" },
    ...branches.map((branch) => ({
      value: branch.id.toString(),
      label: branch.name,
    })),
  ];
}
