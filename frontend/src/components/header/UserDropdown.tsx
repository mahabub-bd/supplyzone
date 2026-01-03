import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { logout } from "../../features/auth/authSlice";
import { RootState } from "../../store";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const fullName = user?.full_name || user?.username || "User";
  const avatar = user?.avatar || "/images/user/owner.jpg";

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/signin");
    closeDropdown();
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-gray-700 dark:text-gray-400"
      >
        <img className="h-9 w-9 rounded-full" src={avatar} alt={fullName} />
        <span className="text-sm font-medium capitalize">{fullName}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <DropdownItem
          onItemClick={closeDropdown}
          tag="a"
          to="/profile"
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <img className="h-5 w-5 rounded-full" src={avatar} alt={fullName} />
          {fullName}
        </DropdownItem>

        <DropdownItem
          onItemClick={closeDropdown}
          tag="a"
          to="/profile"
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <Settings className="h-5 w-5" />
          Settings
        </DropdownItem>

        <DropdownItem
          onItemClick={handleLogout}
          tag="button"
          className="mt-1 flex items-center gap-2 px-2 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
