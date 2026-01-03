import { zodResolver } from "@hookform/resolvers/zod";
import {
  DollarSign,
  Lock,
  MinusCircle,
  PlusCircle,
  Search,
  ShoppingCart,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

import { useGetAccountsQuery } from "../../features/accounts/accountsApi";
import {
  useCloseCashRegisterMutation,
  useGetAvailableCashRegistersQuery,
  useGetCashRegistersQuery,
  useOpenCashRegisterMutation,
} from "../../features/cash-register/cashRegisterApi";
import { useGetCustomersQuery } from "../../features/customer/customerApi";

import { FormField } from "../../components/form/form-elements/SelectFiled";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import ThermalReceipt58mm from "../../components/receipt/ThermalReceipt58mm";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useGetProductWiseReportQuery } from "../../features/inventory/inventoryApi";
import { useCreatePosSaleMutation } from "../../features/pos/posApi";
import { useGetReceiptPreviewQuery } from "../../features/settings/settingsApi";
import { useGetWarehousesQuery } from "../../features/warehouse/warehouseApi";
import { useModal } from "../../hooks/useModal";
import { Account } from "../../types/accounts";
import { Warehouse } from "../../types/branch";
import { CashRegister } from "../../types/cashregister";
import { Customer } from "../../types/customer";
import {
  CartItem,
  CloseCounterFormData,
  DiscountType,
  ExtendedProduct,
  OpenCashRegisterFormValues,
  openCashRegisterSchema,
  PaymentMethodExtended,
  SaleReceiptData,
} from "../../types/posPage";
import { ReceiptPreviewData } from "../../types/settings";
import CustomerFormModal from "../Customer/components/CustomerFormModal";

export default function POSPage() {
  const [searchProduct, setSearchProduct] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(0);
  const [selectedCashRegister, setSelectedCashRegister] = useState<number>(0);
  const [discountType, setDiscountType] = useState<DiscountType>("fixed");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodExtended>("cash");
  const [paymentAccountCode, setPaymentAccountCode] = useState("");
  const [completedSaleData, setCompletedSaleData] =
    useState<SaleReceiptData | null>(null);

  // 🔹 Use the useModal hook for modal state management
  const customerModal = useModal();
  const receiptModal = useModal();
  const openRegisterModal = useModal();
  const closeCounterModal = useModal();

  // Initialize React Hook Form for Open Cash Register
  const {
    register,
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<OpenCashRegisterFormValues>({
    resolver: zodResolver(openCashRegisterSchema),
    mode: "onSubmit", // Only validate on submit
    defaultValues: {
      cash_register_id: 0,
      opening_balance: 0,
      notes: "",
    },
  });

  // API Queries
  const { data: warehouseData } = useGetWarehousesQuery();
  const { data: customerData, refetch: refetchCustomers } =
    useGetCustomersQuery();
  const { data: accountsData } = useGetAccountsQuery({
    type: "asset",
    isCash: true,
    isBank: true,
  });
  const { data: cashRegistersData } = useGetAvailableCashRegistersQuery();
  const { data: allRegistersData } = useGetCashRegistersQuery({});
  const [openCashRegister, { isLoading: isOpeningRegister }] =
    useOpenCashRegisterMutation();
  const [closeCashRegister, { isLoading: isClosingRegister }] =
    useCloseCashRegisterMutation();
  const { data: productReportData } = useGetProductWiseReportQuery({
    search: searchProduct,
    product_type: "finished_good,resale",
  });
  const { data: receiptSettingsData } = useGetReceiptPreviewQuery();
  const [createSale, { isLoading: isCreating }] = useCreatePosSaleMutation();

  // Data extraction
  const warehouses = (warehouseData?.data || []) as Warehouse[];
  const customers = (customerData?.data || []) as Customer[];
  const accounts = (accountsData?.data || []) as Account[];
  const cashRegisters = (cashRegistersData?.data || []) as CashRegister[];
  const allRegisters = (allRegistersData?.data || []) as CashRegister[];
  const receiptSettings = (receiptSettingsData?.data || {
    business_name: null,
    email: null,
    phone: null,
    address: null,
    website: null,
    currency: "BDT",
    currency_symbol: "৳",
    tax_registration: null,
    company_registration: null,
    footer_text: null,
    receipt_header: null,
    include_barcode: false,
    include_customer_details: true,
    logo_url: "",
    default_invoice_layout: "standard",
    show_product_images: false,
    show_product_skus: true,
    show_item_tax_details: false,
    show_payment_breakdown: true,
    invoice_paper_size: "A4",
    print_duplicate_copy: false,
    invoice_footer_message: null,
    use_thermal_printer: true,
  }) as ReceiptPreviewData;

  // Auto-select the first available cash register
  useEffect(() => {
    if (cashRegisters.length > 0) {
      setSelectedCashRegister(cashRegisters[0].id);
    } else {
      setSelectedCashRegister(0);
    }
  }, [cashRegisters]);

  // Extract products from product report
  const products: ExtendedProduct[] =
    productReportData?.data?.flatMap((item: any) =>
      item.warehouses.map((w: any) => ({
        product: item.product,
        purchased_quantity: w.purchased_quantity || 0,
        sold_quantity: w.sold_quantity || 0,
        remaining_quantity: w.remaining_quantity,
        batch_no: w.batch_no || "",
        purchase_value: w.purchase_value || 0,
        sale_value: w.sale_value || 0,
        warehouse_id: w.warehouse_id,
        warehouse_name: w.warehouse?.name || "",
      }))
    ) || [];

  // Filter products by search and warehouse
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.product.name
      .toLowerCase()
      .includes(searchProduct.toLowerCase());
    const matchesWarehouse =
      !selectedWarehouse || p.warehouse_id === selectedWarehouse;
    const hasStock = p.remaining_quantity > 0;
    return matchesSearch && matchesWarehouse && hasStock;
  });

  // Filter accounts by payment method
  const filteredAccounts = accounts.filter((acc: Account) =>
    paymentMethod === "cash"
      ? acc.isCash
      : paymentMethod === "bank"
      ? acc.isBank
      : false
  );

  // Get selected customer's group discount
  const selectedCustomerData = customers.find(
    (c) => String(c.id) === selectedCustomer
  );
  const groupDiscountPercentage = selectedCustomerData?.group
    ?.discount_percentage
    ? Number(selectedCustomerData.group.discount_percentage)
    : 0;

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const tax = (subtotal * taxPercentage) / 100;
  const amountWithVAT = subtotal + tax;

  // Calculate group discount (always percentage-based on amountWithVAT)
  const groupDiscount = (amountWithVAT * groupDiscountPercentage) / 100;

  // Calculate manual discount (also on amountWithVAT, not after group discount)
  const manualDiscount =
    discountType === "fixed"
      ? discountValue
      : (amountWithVAT * discountValue) / 100;

  // Total discount is sum of both
  const totalDiscount = groupDiscount + manualDiscount;

  const total = amountWithVAT - totalDiscount;
  const due = total - paidAmount;

  const addToCart = (productData: ExtendedProduct) => {
    if (!selectedWarehouse) {
      return toast.error("Please select a warehouse first");
    }

    const product = productData.product;
    const warehouse = warehouses.find((w) => w.id === productData.warehouse_id);

    if (!warehouse) {
      return toast.error("Warehouse not found");
    }

    if (productData.remaining_quantity <= 0) {
      return toast.error("Product out of stock");
    }

    const existingItem = cart.find(
      (item) =>
        item.product_id === product.id &&
        item.warehouse_id === productData.warehouse_id
    );

    if (existingItem) {
      if (existingItem.quantity >= productData.remaining_quantity) {
        return toast.error("Cannot exceed available stock");
      }
      updateQuantity(
        product.id,
        productData.warehouse_id,
        existingItem.quantity + 1
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          warehouse_id: productData.warehouse_id,
          warehouse_name: warehouse.name,
          quantity: 1,
          unit_price: Number(product.selling_price),
          available_stock: productData.remaining_quantity,
          batch_no: productData.batch_no,
          product_image:
            product.images && product.images.length > 0
              ? product.images[0].url
              : undefined,
        },
      ]);
      toast.success(`${product.name} added to cart`);
    }
  };

  const updateQuantity = (
    productId: number,
    warehouseId: number,
    newQty: number
  ) => {
    if (newQty <= 0) {
      return removeFromCart(productId, warehouseId);
    }

    const item = cart.find(
      (i) => i.product_id === productId && i.warehouse_id === warehouseId
    );

    if (item && newQty > item.available_stock) {
      return toast.error(
        `Only ${item.available_stock} units available in stock`
      );
    }

    setCart(
      cart.map((item) =>
        item.product_id === productId && item.warehouse_id === warehouseId
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const removeFromCart = (productId: number, warehouseId: number) => {
    setCart(
      cart.filter(
        (item) =>
          item.product_id !== productId || item.warehouse_id !== warehouseId
      )
    );
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    setPaidAmount(0);
    setDiscountValue(0);
    setTaxPercentage(0);
    setSelectedCustomer("");
  };

  const handleOpenRegister = async (data: OpenCashRegisterFormValues) => {
    try {
      await openCashRegister({
        cash_register_id: data.cash_register_id,
        opening_balance: data.opening_balance || 0,
        notes: data.notes,
      }).unwrap();

      toast.success("Cash register opened successfully!");
      openRegisterModal.closeModal();
      resetForm(); // Reset form after successful submission
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to open cash register");
    }
  };

  const handleCloseCounter = async (data: CloseCounterFormData) => {
    if (!selectedCashRegister) {
      return toast.error("Please select a cash register first");
    }

    try {
      await closeCashRegister({
        cash_register_id: selectedCashRegister,
        actual_amount: data.actual_amount,
        notes: data.notes,
      }).unwrap();

      toast.success("Cash register closed successfully!");
      closeCounterModal.closeModal();
      setSelectedCashRegister(0);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to close cash register");
    }
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      return toast.error("Please select a customer");
    }
    if (cart.length === 0) {
      return toast.error("Cart is empty");
    }
    if (paidAmount > total) {
      return toast.error("Paid amount cannot exceed total");
    }
    if (paidAmount > 0 && !paymentAccountCode) {
      return toast.error("Please select a payment account");
    }
    if (!selectedCashRegister) {
      return toast.error("Please select a cash register");
    }

    try {
      const payload: any = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          warehouse_id: item.warehouse_id,
          quantity: item.quantity,
          discount: 0,
        })),
        branch_id: 1,
        customer_id: Number(selectedCustomer),
        cash_register_id: selectedCashRegister,
        discount_type: discountType,
        discount: discountValue,
        tax_percentage: taxPercentage,
        paid_amount: paidAmount,
      };

      // Only add payment fields if payment is made
      if (paidAmount > 0 && paymentAccountCode) {
        payload.payment_method = paymentMethod;
        payload.account_code = paymentAccountCode;
      }

      const response = await createSale(payload).unwrap();

      toast.success("Sale completed successfully!");

      // Prepare thermal receipt data
      const receiptData = {
        invoice_no: response?.data?.invoice_no || `INV-${Date.now()}`,
        items: cart.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.quantity * item.unit_price,
        })),
        subtotal: subtotal,
        discount: totalDiscount,
        tax: tax,
        total: total,
        paid_amount: paidAmount,
        due_amount: due,
        customer_name: selectedCustomerData?.name || "Walk-in Customer",
        customer_phone: selectedCustomerData?.phone,
        payment_method: paidAmount > 0 ? paymentMethod : undefined,
        branch_name: "Main Branch",
        served_by: "Cashier",
        created_at: new Date().toISOString(),
      };

      setCompletedSaleData(receiptData);
      receiptModal.openModal();
      clearCart();
    } catch (error: any) {
      toast.error(error?.data?.message || "Sale failed");
    }
  };

  return (
    <div className="w-full h-full">
      <PageMeta
        title="POS - Point of Sale"
        description="Quick sale interface"
      />
      <PageBreadcrumb pageTitle="POS" />

      {/* Customer Modal */}
      <CustomerFormModal
        isOpen={customerModal.isOpen}
        onClose={() => {
          customerModal.closeModal();
          refetchCustomers();
        }}
        customer={null}
      />

      <div className="flex justify-end mb-4">
        <Button
          onClick={customerModal.openModal}
          variant="primary"
          size="sm"
          startIcon={<UserPlus size={18} />}
        >
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-300px)]">
        {/* Left Side - Products */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
          {/* Search & Warehouse Selection */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                  size={18}
                />
                <Input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={String(selectedWarehouse)}
                onChange={(value) => setSelectedWarehouse(Number(value))}
                placeholder="Select Warehouses"
                options={[
                  { value: "0", label: "All Warehouses" },
                  ...warehouses.map((w) => ({
                    value: String(w.id),
                    label: w.name,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((productData, index) => {
                const product = productData.product;
                return (
                  <button
                    key={`${product.id}-${productData.warehouse_id}-${index}`}
                    onClick={() => addToCart(productData)}
                    className="group border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-brand-500 dark:hover:border-brand-600 hover:shadow-md transition-all bg-white dark:bg-gray-900 flex flex-col items-center"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-colors overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <ShoppingCart
                        size={32}
                        className={`${
                          product.images && product.images.length > 0
                            ? "hidden"
                            : ""
                        } text-gray-400 dark:text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-400`}
                      />
                    </div>
                    <h3 className="font-medium text-sm text-center text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-brand-600 dark:text-brand-400 font-semibold text-base mb-1">
                      ৳{Number(product.selling_price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Stock: {productData.remaining_quantity}
                    </p>
                    {productData.warehouse_name && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {productData.warehouse_name}
                      </p>
                    )}
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No products found</p>
                  <p className="text-sm mt-1">
                    Try adjusting your search or warehouse filter
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Cart & Checkout */}
        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide">
          {/* Cash Register Selection */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {cashRegisters.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {cashRegisters[0].name}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    Open
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      <span className="text-gray-600 dark:text-gray-400">
                        Current Balance:
                      </span>{" "}
                      ৳
                      <span>
                        {parseFloat(cashRegisters[0].current_balance).toFixed(
                          2
                        )}
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  onClick={closeCounterModal.openModal}
                  variant="warning"
                  size="sm"
                  startIcon={<Lock size={16} />}
                  className="w-full"
                >
                  Close Counter
                </Button>
              </div>
            ) : (
              <Button
                onClick={openRegisterModal.openModal}
                variant="success"
                size="sm"
                startIcon={<DollarSign size={16} />}
                className="w-full"
              >
                Open Register
              </Button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <FormField label="Customer">
              <Select
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                placeholder="Select a customer"
                options={customers.map((c) => ({
                  value: String(c.id),
                  label: `${c.customer_code} — ${c.name}`,
                }))}
              />
            </FormField>
          </div>

          {/* Cart Items */}
          <div className="flex-1  bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Cart Items
              </h3>
              <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-sm font-medium">
                {cart.length} {cart.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={`${item.product_id}-${item.warehouse_id}`}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow"
                >
                  {/* Product Image, Name and Warehouse */}
                  <div className="flex items-start gap-3 mb-2">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                        {item.product_name}
                      </h4>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📍 {item.warehouse_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📦 Available: {item.available_stock} units
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart(item.product_id, item.warehouse_id)
                      }
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors shrink-0"
                      title="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Quantity Controls and Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Qty:
                      </span>
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.warehouse_id,
                              item.quantity - 1
                            )
                          }
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <MinusCircle
                            size={16}
                            className="text-gray-600 dark:text-gray-400"
                          />
                        </button>
                        <span className="px-3 font-semibold text-sm text-gray-900 dark:text-white min-w-10 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.warehouse_id,
                              item.quantity + 1
                            )
                          }
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                          disabled={item.quantity >= item.available_stock}
                        >
                          <PlusCircle
                            size={16}
                            className="text-gray-600 dark:text-gray-400"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        @ ৳{item.unit_price.toFixed(2)}
                      </p>
                      <p className="font-bold text-base text-brand-600 dark:text-brand-400">
                        ৳{(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <ShoppingCart
                      size={40}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Add products to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Discount & Tax */}
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Discount Type">
                <Select
                  className="h-8"
                  value={discountType}
                  onChange={(value) =>
                    setDiscountType(value as "fixed" | "percentage")
                  }
                  options={[
                    { value: "fixed", label: "Fixed" },
                    { value: "percentage", label: "%" },
                  ]}
                />
              </FormField>

              <FormField
                label={`Discount ${discountType === "percentage" ? "(%)" : ""}`}
              >
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-8"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Tax (%)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-8"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  placeholder="0.00"
                />
              </FormField>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Method">
                <Select
                  className="h-8"
                  value={paymentMethod}
                  onChange={(value) => {
                    setPaymentMethod(value as PaymentMethodExtended);
                    setPaymentAccountCode("");
                  }}
                  options={[
                    { value: "cash", label: "Cash" },
                    { value: "bank", label: "Bank & MFS" },
                  ]}
                />
              </FormField>

              {(paymentMethod === "cash" || paymentMethod === "bank") && (
                <FormField label="Account">
                  <Select
                    className="h-8"
                    value={paymentAccountCode}
                    onChange={setPaymentAccountCode}
                    placeholder="Select Account"
                    options={filteredAccounts.map((acc) => ({
                      value: acc.code,
                      label: `${acc.name} - ${acc.code}`,
                    }))}
                  />
                </FormField>
              )}
            </div>

            <FormField label="Paid Amount">
              <Input
                type="number"
                min="0"
                step="0.01"
                className="h-8"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                placeholder="0.00"
              />
            </FormField>
          </div>

          {/* Summary & Checkout */}
          <div
            className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 
                p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-sm"
          >
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Tax</span>
                <span>+৳{tax.toFixed(2)}</span>
              </div>

              {/* Group Discount */}
              {groupDiscount > 0 && (
                <div className="flex justify-between text-blue-600 dark:text-blue-400 text-xs">
                  <span>
                    Group Discount ({selectedCustomerData?.group?.name} -{" "}
                    {groupDiscountPercentage}%)
                  </span>
                  <span>-৳{groupDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Manual Discount */}
              {manualDiscount > 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400 text-xs">
                  <span>
                    Discount{" "}
                    {discountType === "percentage" && `(${discountValue}%)`}
                  </span>
                  <span>-৳{manualDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Total Discount */}
              {totalDiscount > 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400 font-semibold">
                  <span>Total Discount</span>
                  <span>-৳{totalDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>৳{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-semibold text-orange-600 dark:text-orange-400">
                <span>Due</span>
                <span>৳{due.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {cart.length > 0 && (
                <Button
                  onClick={clearCart}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  Clear Cart
                </Button>
              )}
              <Button
                onClick={handleCheckout}
                disabled={
                  isCreating ||
                  !selectedCustomer ||
                  cart.length === 0 ||
                  !selectedCashRegister
                }
                variant="success"
                size="sm"
                className="w-full"
              >
                {isCreating ? "Processing..." : "Complete Sale"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Open Cash Register Modal */}
      <Modal
        className="max-w-xl"
        isOpen={openRegisterModal.isOpen}
        onClose={() => {
          openRegisterModal.closeModal();
          resetForm();
        }}
        title="Open Cash Register"
      >
        <form
          onSubmit={handleFormSubmit(handleOpenRegister)}
          className="space-y-4"
        >
          <FormField
            label={
              <>
                Select Register <span className="text-red-500">*</span>
              </>
            }
            error={errors.cash_register_id?.message}
          >
            <Controller
              name="cash_register_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value > 0 ? String(field.value) : ""}
                  onChange={(value) => {
                    const numValue = value ? Number(value) : 0;
                    field.onChange(numValue);
                    setSelectedCashRegister(numValue);
                  }}
                  placeholder="Select a register to open"
                  options={allRegisters
                    .filter((register) => register.status === "closed")
                    .map((register) => ({
                      value: String(register.id),
                      label: `${register.name} ${register.register_code || ""}`,
                    }))}
                />
              )}
            />
          </FormField>

          <FormField
            label="Opening Balance (Optional)"
            error={errors.opening_balance?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("opening_balance", { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Notes (Optional)" error={errors.notes?.message}>
            <Input placeholder="Opening notes..." {...register("notes")} />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => {
                openRegisterModal.closeModal();
                resetForm();
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isOpeningRegister}
              variant="success"
              size="sm"
            >
              {isOpeningRegister ? "Opening..." : "Open Register"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Counter Modal */}
      <Modal
        className="max-w-xl"
        isOpen={closeCounterModal.isOpen}
        onClose={closeCounterModal.closeModal}
        title="Close Cash Register"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleCloseCounter({
              actual_amount: parseFloat(
                formData.get("actual_amount") as string
              ),
              notes: formData.get("notes") as string,
            });
          }}
          className="space-y-4"
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Expected Balance:
              </span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ৳
                {cashRegisters.length > 0
                  ? parseFloat(cashRegisters[0].current_balance).toFixed(2)
                  : "0.00"}
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              This is the system calculated balance
            </p>
          </div>

          <FormField
            label={
              <>
                Actual Amount Counted <span className="text-red-500">*</span>
              </>
            }
          >
            <Input
              name="actual_amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Enter the actual cash counted"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Count all cash in the register and enter the total amount
            </p>
          </FormField>

          <FormField label="Notes (Optional)">
            <Input
              name="notes"
              placeholder="e.g., Shortage due to cash refund..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={closeCounterModal.closeModal}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isClosingRegister}
              variant="warning"
              size="sm"
              startIcon={<Lock size={16} />}
            >
              {isClosingRegister ? "Closing..." : "Close Register"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Thermal Receipt Modal */}
      {receiptModal.isOpen && completedSaleData && (
        <ThermalReceipt58mm
          receiptSettings={receiptSettings}
          saleData={completedSaleData}
          onClose={() => {
            receiptModal.closeModal();
            setCompletedSaleData(null);
          }}
        />
      )}
    </div>
  );
}
