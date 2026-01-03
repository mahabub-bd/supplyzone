import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Loading from "./components/common/Loading";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./route/protected";
import PublicRoute from "./route/public-route";

// Critical pages loaded eagerly (auth and dashboard)
import SignIn from "./pages/AuthPages/SignIn";
import Home from "./pages/Dashboard/Home";
import NotFound from "./pages/OtherPage/NotFound";

// Lazy-loaded pages for code splitting
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Calendar = lazy(() => import("./pages/Calendar"));

// UI Elements & Charts (typically used for demos/testing)
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));

// Settings & Permissions
const BusinessSettingsPage = lazy(() => import("./pages/Settings/Business"));
const ReceiptSettingsPage = lazy(() => import("./pages/Settings"));
const BackupPage = lazy(() => import("./pages/Backup"));
const PermissionsPage = lazy(() => import("./pages/PermissionPage"));
const PermissionAssignPage = lazy(() => import("./pages/PermissionAssignPage"));
const RolesPage = lazy(() => import("./pages/Role"));
const UsersPage = lazy(() => import("./pages/UserPage"));

// Catalog Management
const BrandsPage = lazy(() => import("./pages/Brand"));
const CategoryPage = lazy(() => import("./pages/Category"));
const TagPage = lazy(() => import("./pages/Tag"));
const UnitPage = lazy(() => import("./pages/Unit"));
const BranchPage = lazy(() => import("./pages/Branch"));
const WarehousePage = lazy(() => import("./pages/Warehouse"));

// Product Management
const ProductPage = lazy(() => import("./pages/Product"));
const ComponentPage = lazy(() => import("./pages/Product/ComponentPage"));
const ProductDetailPage = lazy(() => import("./pages/Product/components/ProductDetailPage"));
const ProductFormPage = lazy(() => import("./pages/Product/components/ProductFormPage"));

// Supplier Management
const SuppliersPage = lazy(() => import("./pages/Supplier"));
const SupplierDetailPage = lazy(() => import("./pages/Supplier/components/SupplierDetailPage"));
const SupplierLedgerPage = lazy(() => import("./pages/Supplier/components/SupplierLedgerPage"));

// Customer Management
const CustomerPage = lazy(() => import("./pages/Customer"));
const CustomerDetailPage = lazy(() => import("./pages/Customer/components/CustomerDetailPage"));
const CustomerFormPage = lazy(() => import("./pages/Customer/components/CustomerFormPage"));
const CustomerLedgerPage = lazy(() => import("./pages/Customer/components/CustomerLedgerPage"));
const CustomerGroupPage = lazy(() => import("./pages/CustomerGroup"));

// Purchase Management
const PurchasePage = lazy(() => import("./pages/Purchase"));
const PurchaseCreate = lazy(() => import("./pages/Purchase/components/PurchaseCreate"));
const PurchaseEdit = lazy(() => import("./pages/Purchase/components/PurchaseEdit"));
const PurchaseDetailPage = lazy(() => import("./pages/Purchase/components/PurchaseDetailPage"));
const PurchaseReturnPage = lazy(() => import("./pages/Purchase-Return"));
const PurchaseReturnDetailPage = lazy(() => import("./pages/Purchase-Return/components/PurchaseReturnDetailPage"));

// Sales Management
const SalesPage = lazy(() => import("./pages/Sales"));
const SaleFormPage = lazy(() => import("./pages/Sales/components/SaleFormPage"));
const SaleDetailPage = lazy(() => import("./pages/Sales/components/SaleDetailPage"));

// Quotation Management
const QuotationPage = lazy(() => import("./pages/Quotation"));
const QuotationCreate = lazy(() => import("./pages/Quotation/Create"));
const QuotationDetail = lazy(() => import("./pages/Quotation/Detail"));
const QuotationEdit = lazy(() => import("./pages/Quotation/Edit"));

// POS Management
const POSPage = lazy(() => import("./pages/POS/POSPage"));
const PosSalesListPage = lazy(() => import("./pages/POS/PosSalesListPage"));
const PosSaleDetailPage = lazy(() => import("./pages/POS/PosSaleDetailPage"));
const PosSalesSummaryPage = lazy(() => import("./pages/POS/PosSalesSummaryPage"));
const PosTransactionHistoryPage = lazy(() => import("./pages/POS/PosTransactionHistoryPage"));

// Cash Register Management
const CashRegisterManagementPage = lazy(() => import("./pages/CashRegister/CashRegisterManagementPage"));
const CashRegisterOperationsPage = lazy(() => import("./pages/CashRegister/CashRegisterOperationsPage"));
const CashRegisterTransactionsPage = lazy(() => import("./pages/CashRegister/CashRegisterTransactionsPage"));
const CashRegisterVarianceReportPage = lazy(() => import("./pages/CashRegister/CashRegisterVarianceReportPage"));

// Inventory Management
const InventoryPageBatchWise = lazy(() => import("./pages/Inventory/batch-wise"));
const InventoryProductPage = lazy(() => import("./pages/Inventory/product-wise/InventoryProductPage"));
const InventoryMaterialPage = lazy(() => import("./pages/Inventory/product-wise/InventoryMaterialPage"));
const InventoryProductWarehouseWise = lazy(() => import("./pages/Inventory/warehouse-wise"));
const StockMovementPage = lazy(() => import("./pages/Inventory/stock-movement"));
const InventoryJournalPage = lazy(() => import("./pages/Inventory/inventory-journal"));

// Accounting
const AccountBalancePage = lazy(() => import("./pages/Accounts/AccountBalance"));
const AccountLedgerPage = lazy(() => import("./pages/Accounts/AccountLedgerPage"));
const AccountListPage = lazy(() => import("./pages/Accounts/AccountList"));
const CashandBank = lazy(() => import("./pages/Accounts/CashandBank"));
const JournalPage = lazy(() => import("./pages/Accounts/JournalPage"));
const PaymentsPage = lazy(() => import("./pages/Accounts/payments"));
const PaymentDetailsPage = lazy(() => import("./pages/Accounts/payments/components/PaymentDetails"));
const TrialBalancePage = lazy(() => import("./pages/Accounts/TrialBalance"));

// Expenses
const ExpenseCategoryPage = lazy(() => import("./pages/ExpenseCategory"));
const ExpensesPage = lazy(() => import("./pages/Expenses"));

// HRM
const DepartmentPage = lazy(() => import("./pages/Departments"));
const DepartmentProfilePage = lazy(() => import("./pages/Departments/DepartmentProfilePage"));
const DesignationPage = lazy(() => import("./pages/Designations"));
const EmployeePage = lazy(() => import("./pages/Employees"));
const EmployeeProfilePage = lazy(() => import("./pages/Employees/EmployeeProfilePage"));
const AttendanceListPage = lazy(() => import("./pages/Attendance/AttendanceList"));
const AttendanceSummaryPage = lazy(() => import("./pages/Attendance/AttendanceSummary"));
const LeaveRequestPage = lazy(() => import("./pages/Leave"));
const LeaveRequestDetail = lazy(() => import("./pages/Leave/components/LeaveRequestDetail"));
const LeaveApprovalsPage = lazy(() => import("./pages/LeaveApprovals"));

// Production Management
const ProductionOrderList = lazy(() => import("./pages/Production/Order"));
const ProductionOrderDetailPage = lazy(() => import("./pages/Production/Order/ProductionOrderDetailPage"));
const ProductionOrderFormPage = lazy(() => import("./pages/Production/Order/ProductionOrderFormPage"));
const ProductionRecipeList = lazy(() => import("./pages/Production/Recipe/ProductionRecipeList"));
const ProductionRecipeFormPage = lazy(() => import("./pages/Production/Recipe/ProductionRecipeFormPage"));

// Reports Management
const ReportsPage = lazy(() => import("./pages/Reports"));
const SalesReportPage = lazy(() => import("./pages/Reports/SalesReportPage"));
const PurchaseReportPage = lazy(() => import("./pages/Reports/PurchaseReportPage"));
const InventoryReportPage = lazy(() => import("./pages/Reports/InventoryReportPage"));
const ProfitLossReportPage = lazy(() => import("./pages/Reports/ProfitLossReportPage"));
const StockReportPage = lazy(() => import("./pages/Reports/StockReportPage"));
const ProductsReportPage = lazy(() => import("./pages/Reports/ProductsReportPage"));
const EmployeesReportPage = lazy(() => import("./pages/Reports/EmployeesReportPage"));
const ExpenseReportPage = lazy(() => import("./pages/Reports/ExpenseReportPage"));
const SummaryReportPage = lazy(() => import("./pages/Reports/SummaryReportPage"));
const CustomersReportPage = lazy(() => import("./pages/Reports/CustomersReportPage"));

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Suspense fallback={<Loading message="Loading..." />}>
        <Routes>
          {/* Public Route */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
          <Route path="/dashboard" element={<Home />} />
          {/* Pages */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<div>Blank Page</div>} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings/business" element={<BusinessSettingsPage />} />
          <Route path="/settings/receipt" element={<ReceiptSettingsPage />} />
          <Route path="/backup" element={<BackupPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/units" element={<UnitPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route
            path="/permissions/assign-role"
            element={<PermissionAssignPage />}
          />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/tags" element={<TagPage />} />
          <Route path="/warehouses" element={<WarehousePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/components" element={<ComponentPage />} />
          // For creating a product
          <Route path="/products/create" element={<ProductFormPage />} />
          // For viewing a product
          <Route path="/products/view/:id" element={<ProductDetailPage />} />
          // For editing a product
          <Route path="/products/edit/:id" element={<ProductFormPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
          <Route
            path="/suppliers/:id/ledger"
            element={<SupplierLedgerPage />}
          />
          {/* Purchase List */}
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/purchases/create" element={<PurchaseCreate />} />
          <Route path="/purchases/edit/:id" element={<PurchaseEdit />} />
          {/* Purchase Detail */}
          <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
          {/* Quotation Routes */}
          <Route path="/quotations" element={<QuotationPage />} />
          <Route path="/quotations/create" element={<QuotationCreate />} />
          <Route path="/quotations/:id" element={<QuotationDetail />} />
          <Route path="/quotations/edit/:id" element={<QuotationEdit />} />
          <Route
            path="/inventory/stock-batch-wise"
            element={<InventoryPageBatchWise />}
          />
          <Route
            path="/inventory/stock-product-wise"
            element={<InventoryProductPage />}
          />
          <Route
            path="/inventory/stock-material-wise"
            element={<InventoryMaterialPage />}
          />
          <Route
            path="/inventory/stock-warehouse-wise"
            element={<InventoryProductWarehouseWise />}
          />
          <Route
            path="/inventory/stock-movements"
            element={<StockMovementPage />}
          />
          <Route path="/inventory/journal" element={<InventoryJournalPage />} />
          <Route path="/accounts/balances" element={<AccountBalancePage />} />
          <Route path="/accounts/journal" element={<JournalPage />} />
          <Route path="/accounts/payment" element={<PaymentsPage />} />
          <Route path="/payments/:id" element={<PaymentDetailsPage />} />
          <Route path="/accounts/list" element={<AccountListPage />} />
          <Route path="/accounts/cash-bank" element={<CashandBank />} />
          <Route
            path="/accounts/ledger/:accountCode"
            element={<AccountLedgerPage />}
          />
          <Route
            path="/accounts/trial-balance"
            element={<TrialBalancePage />}
          />
          <Route path="/branches" element={<BranchPage />} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/customers/new" element={<CustomerFormPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
          <Route
            path="/customers/:id/ledger"
            element={<CustomerLedgerPage />}
          />
          <Route path="customers-groups" element={<CustomerGroupPage />} />
          <Route path="/expenses/category" element={<ExpenseCategoryPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales/create" element={<SaleFormPage />} />
          <Route path="/sales/:id" element={<SaleDetailPage />} />
          <Route
            path="/sales-return"
            element={<div>Sales Return - Coming Soon</div>}
          />
          <Route path="/purchase-returns" element={<PurchaseReturnPage />} />
          <Route
            path="/purchase-returns/:id"
            element={<PurchaseReturnDetailPage />}
          />
          {/* POS Routes */}
          <Route path="/pos" element={<POSPage />} />
          <Route path="/pos/sales-list" element={<PosSalesListPage />} />
          <Route path="/pos/sales/:id" element={<PosSaleDetailPage />} />
          <Route path="/pos/sales-summary" element={<PosSalesSummaryPage />} />
          <Route
            path="/pos/transactions"
            element={<PosTransactionHistoryPage />}
          />
          {/* Cash Register Routes */}
          <Route
            path="/cash-register"
            element={<CashRegisterManagementPage />}
          />
          <Route
            path="/cash-register/operations"
            element={<CashRegisterOperationsPage />}
          />
          <Route
            path="/cash-register/transactions"
            element={<CashRegisterTransactionsPage />}
          />
          <Route
            path="/cash-register/variance-reports"
            element={<CashRegisterVarianceReportPage />}
          />
          {/* HRM */}
          <Route path="/hrm/departments" element={<DepartmentPage />} />
          <Route
            path="/hrm/departments/:id"
            element={<DepartmentProfilePage />}
          />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/departments/:id" element={<DepartmentProfilePage />} />
          <Route path="/hrm/designations" element={<DesignationPage />} />
          <Route path="/hrm/employees" element={<EmployeePage />} />
          <Route path="/hrm/attendance" element={<AttendanceListPage />} />
          <Route
            path="/hrm/attendance/summary-report"
            element={<AttendanceSummaryPage />}
          />
          <Route path="/hrm/leave-requests" element={<LeaveRequestPage />} />
          <Route
            path="/hrm/leave-requests/:id"
            element={<LeaveRequestDetail />}
          />
          <Route path="/hrm/leave-approvals" element={<LeaveApprovalsPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
          {/* Production Routes */}
          <Route path="/production/orders" element={<ProductionOrderList />} />
          <Route
            path="/production/orders/create"
            element={<ProductionOrderFormPage />}
          />
          <Route
            path="/production/orders/:id"
            element={<ProductionOrderDetailPage />}
          />
          <Route
            path="/production/orders/:id/edit"
            element={<ProductionOrderFormPage />}
          />
          <Route
            path="/production/recipes"
            element={<ProductionRecipeList />}
          />
          <Route
            path="/production/recipes/create"
            element={<ProductionRecipeFormPage />}
          />
          <Route
            path="/production/recipes/:id/edit"
            element={<ProductionRecipeFormPage />}
          />
          {/* Reports Routes */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/sales" element={<SalesReportPage />} />
          <Route path="/reports/purchase" element={<PurchaseReportPage />} />
          <Route path="/reports/inventory" element={<InventoryReportPage />} />
          <Route path="/reports/profit-loss" element={<ProfitLossReportPage />} />
          <Route path="/reports/stock" element={<StockReportPage />} />
          <Route path="/reports/products" element={<ProductsReportPage />} />
          <Route path="/reports/employees" element={<EmployeesReportPage />} />
          <Route path="/reports/expense" element={<ExpenseReportPage />} />
          <Route path="/reports/summary" element={<SummaryReportPage />} />
          <Route path="/reports/customers" element={<CustomersReportPage />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
