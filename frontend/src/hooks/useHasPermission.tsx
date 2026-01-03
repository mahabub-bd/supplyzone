import { useSelector } from "react-redux";
import { RootState } from "../store";

export const useHasPermission = (permission: string) => {
  const { permissions } = useSelector((state: RootState) => state.auth);
  return permissions.includes(permission);
};
