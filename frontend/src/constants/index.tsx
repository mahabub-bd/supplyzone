import {
  Banknote,
  CalendarDays,
  CircleDollarSign,
  FileText,
  GitBranch,
  LayoutDashboard,
  Package2Icon,
  Settings,
  ShoppingCart,
  UserCircle,
  Users,
  UsersRound,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react";
import { NavItem } from "../layout/AppSidebar";

// ============================================================================
// MAIN NAVIGATION - Organized by ERP Module
// ============================================================================

const navItems: NavItem[] = [
  // ========== DASHBOARD ==========
  {
    icon: <LayoutDashboard />,
    name: "Dashboard",
    path: "/",
    requiredPermission: "dashboard.view",
  },

  // ========== SALES MODULE ==========
  {
    icon: <ShoppingCart />,
    name: "Sales",
    requiredPermission: "sales.view",
    subItems: [
      {
        name: "POS / New Sale",
        path: "/pos",
        requiredPermission: "pos.view",
      },
      {
        name: "Quotations",
        path: "/quotations",
        requiredPermission: "quotation.view",
      },
      {
        name: "Sales List",
        path: "/sales",
        requiredPermission: "sales.view",
      },
      {
        name: "Sales Returns",
        path: "/sales-return",
        requiredPermission: "sale_return.view",
      },
      {
        name: "Today's Sales",
        path: "/pos/sales-summary",
        requiredPermission: "pos.view",
      },
      {
        name: "POS Sales History",
        path: "/pos/sales-list",
        requiredPermission: "pos.view",
      },
      {
        name: "POS Transactions",
        path: "/pos/transactions",
        requiredPermission: "pos.view",
      },
    ],
  },

  // ========== PURCHASE MODULE ==========
  {
    icon: <CalendarDays />,
    name: "Purchases",
    requiredPermission: "purchase.view",
    subItems: [
      {
        name: "Purchase Orders",
        path: "/purchase",
        requiredPermission: "purchase.view",
      },
      {
        name: "Purchase Returns",
        path: "/purchase-returns",
        requiredPermission: "purchase_return.view",
      },
      {
        name: "Suppliers",
        path: "/suppliers",
        requiredPermission: "suppliers.view",
      },
    ],
  },

  // ========== INVENTORY MODULE ==========
  {
    icon: <Warehouse />,
    name: "Inventory",
    requiredPermission: "inventory.view",
    subItems: [
      {
        name: "Stock Movements",
        path: "/inventory/stock-movements",
        requiredPermission: "inventory.view",
      },
      {
        name: "Inventory Journal",
        path: "/inventory/journal",
        requiredPermission: "inventory.view",
      },
      {
        name: "Stock - Product Wise",
        path: "/inventory/stock-product-wise",
        requiredPermission: "inventory.view",
      },
      {
        name: "Stock - Material Wise",
        path: "/inventory/stock-material-wise",
        requiredPermission: "inventory.view",
      },
      {
        name: "Stock - Batch Wise",
        path: "/inventory/stock-batch-wise",
        requiredPermission: "inventory.view",
      },
      {
        name: "Stock - Warehouse Wise",
        path: "/inventory/stock-warehouse-wise",
        requiredPermission: "inventory.view",
      },
      {
        name: "Warehouses",
        path: "/warehouses",
        requiredPermission: "warehouse.view",
      },
    ],
  },

  // ========== PRODUCT CATALOG ==========
  {
    icon: <Package2Icon />,
    name: "Products",
    requiredPermission: "product.view",
    subItems: [
      {
        name: "Products List",
        path: "/products",
        requiredPermission: "product.view",
      },
      {
        name: "Components List",
        path: "/components",
        requiredPermission: "product.view",
      },
      {
        name: "Categories",
        path: "/categories",
        requiredPermission: "category.view",
      },
      {
        name: "Brands",
        path: "/brands",
        requiredPermission: "brand.view",
      },
      {
        name: "Units",
        path: "/units",
        requiredPermission: "unit.view",
      },
      {
        name: "Tags",
        path: "/tags",
        requiredPermission: "tag.view",
      },
    ],
  },

  // ========== PRODUCTION ==========
  {
    icon: <Wrench />,
    name: "Production",
    requiredPermission: "production.view",
    subItems: [
      {
        name: "Production Orders",
        path: "/production/orders",
        requiredPermission: "production.view",
      },
      {
        name: "Production Recipes",
        path: "/production/recipes",
        requiredPermission: "production.view",
      },
      {
        name: "Material Consumption",
        path: "/production/material-consumption",
        requiredPermission: "production.view",
      },
    ],
  },

  // ========== ACCOUNTING & FINANCE ==========
  {
    icon: <CircleDollarSign />,
    name: "Accounting",
    requiredPermission: "account.view",
    subItems: [
      {
        name: "Chart of Accounts",
        path: "/accounts/list",
        requiredPermission: "account.view",
      },
      {
        name: "Cash & Bank Accounts",
        path: "/accounts/cash-bank",
        requiredPermission: "account.view",
      },
      {
        name: "Journal Entries",
        path: "/accounts/journal",
        requiredPermission: "account.view",
      },
      {
        name: "Payments",
        path: "/accounts/payment",
        requiredPermission: "account.view",
      },
      {
        name: "Balance Sheet",
        path: "/accounts/balances",
        requiredPermission: "account.view",
      },
      {
        name: "Trial Balance",
        path: "/accounts/trial-balance",
        requiredPermission: "account.view",
      },
    ],
  },

  // ========== CASH MANAGEMENT ==========
  {
    icon: <Wallet />,
    name: "Cash Register",
    requiredPermission: "cashregister.view",
    subItems: [
      {
        name: "Register Management",
        path: "/cash-register",
        requiredPermission: "cashregister.view",
      },
      {
        name: "Operations",
        path: "/cash-register/operations",
        requiredPermission: "cashregister.view",
      },
      {
        name: "Transactions",
        path: "/cash-register/transactions",
        requiredPermission: "cashregister.view",
      },
    ],
  },

  // ========== EXPENSES ==========
  {
    icon: <Banknote />,
    name: "Expenses",
    requiredPermission: "expense.view",
    subItems: [
      {
        name: "All Expenses",
        path: "/expenses",
        requiredPermission: "expense.view",
      },
      {
        name: "Expense Categories",
        path: "/expenses/category",
        requiredPermission: "expense.view",
      },
    ],
  },

  // ========== CRM - CUSTOMER MANAGEMENT ==========
  {
    icon: <UserCircle />,
    name: "Customers",
    requiredPermission: "customer.view",
    subItems: [
      {
        name: "Customer List",
        path: "/customers",
        requiredPermission: "customer.view",
      },
      {
        name: "Customer Groups",
        path: "/customers-groups",
        requiredPermission: "customergroup.view",
      },
    ],
  },

  // ========== HRM - HUMAN RESOURCES ==========
  {
    icon: <UsersRound />,
    name: "Human Resources",
    requiredPermission: "hrm.view",
    subItems: [
      {
        name: "Employees",
        path: "/hrm/employees",
        requiredPermission: "employee.view",
      },
      {
        name: "Departments",
        path: "/hrm/departments",
        requiredPermission: "department.view",
      },
      {
        name: "Designations",
        path: "/hrm/designations",
        requiredPermission: "designation.view",
      },
      {
        name: "Attendance",
        path: "/hrm/attendance",
        requiredPermission: "attendance.view",
      },
      {
        name: "Leave Requests",
        path: "/hrm/leave-requests",
        requiredPermission: "leave.view",
      },
      {
        name: "Leave Approvals",
        path: "/hrm/leave-approvals",
        requiredPermission: "hrm.leave_approvals.view",
      },
      {
        name: "Payroll",
        path: "/hrm/payroll",
        requiredPermission: "payroll.view",
      },
      {
        name: "Approval Delegations",
        path: "/hrm/approval-delegations",
        requiredPermission: "hrm.approval_delegations.view",
      },
    ],
  },

  // ========== ORGANIZATION SETUP ==========
  {
    icon: <GitBranch />,
    name: "Organization",
    requiredPermission: "branch.view",
    subItems: [
      {
        name: "Branches",
        path: "/branches",
        requiredPermission: "branch.view",
      },
    ],
  },

  // ========== USER MANAGEMENT & SECURITY ==========
  {
    icon: <Users />,
    name: "User Management",
    requiredPermission: "user.view",
    subItems: [
      {
        name: "Users",
        path: "/users",
        requiredPermission: "user.view",
      },
      {
        name: "Roles",
        path: "/roles",
        requiredPermission: "role.view",
      },
      {
        name: "Permissions",
        path: "/permissions",
        requiredPermission: "permission.view",
      },
      {
        name: "Assign Permissions",
        path: "/permissions/assign-role",
        requiredPermission: "permissionassign.view",
      },
    ],
  },

  // ========== SYSTEM SETTINGS ==========
  {
    icon: <Settings />,
    name: "Settings",
    requiredPermission: "settings.view",
    subItems: [
      {
        name: "Business Settings",
        path: "/settings/business",
        requiredPermission: "settings.view",
      },
      {
        name: "Receipt Settings",
        path: "/settings/receipt",
        requiredPermission: "settings.view",
      },
      {
        name: "Database Backup",
        path: "/backup",
        // requiredPermission: "backup.view",
      },
    ],
  },
];

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================

const othersItems: NavItem[] = [
  {
    icon: <FileText />,
    name: "Reports & Analytics",
    requiredPermission: "report.view",
    subItems: [
      {
        name: "Sales Report",
        path: "/reports/sales",
        requiredPermission: "report.sales",
      },
      {
        name: "Purchase Report",
        path: "/reports/purchase",
        requiredPermission: "report.purchase",
      },
      {
        name: "Inventory Report",
        path: "/reports/inventory",
        requiredPermission: "report.inventory",
      },
      {
        name: "Profit & Loss Report",
        path: "/reports/profit-loss",
        requiredPermission: "report.profitloss",
      },
      {
        name: "Customer Report",
        path: "/reports/customers",
        requiredPermission: "report.customer",
      },
    ],
  },
];

export { navItems, othersItems };

