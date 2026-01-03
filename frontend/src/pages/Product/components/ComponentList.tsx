import {
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Loading from "../../../components/common/Loading";
import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import ResponsiveImage from "../../../components/ui/images/ResponsiveImage";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import { useGetBrandsQuery } from "../../../features/brand/brandApi";
import {
  useGetCategoriesQuery,
  useGetSubCategoriesByCategoryIdQuery,
} from "../../../features/category/categoryApi";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "../../../features/product/productApi";
import { useGetSuppliersQuery } from "../../../features/suppliers/suppliersApi";

import { Link } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { Product, ProductFilters } from "../../../types/product";
import { getProductTypeBadge } from "../../../utlis/index";

// Helper function to map badge colors to Tailwind classes
const getBadgeClasses = (color: string) => {
  const colorMap: Record<
    string,
    { bg: string; text: string; darkBg: string; darkText: string }
  > = {
    success: {
      bg: "bg-green-100",
      text: "text-green-800",
      darkBg: "dark:bg-green-900/20",
      darkText: "dark:text-green-300",
    },
    warning: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      darkBg: "dark:bg-yellow-900/20",
      darkText: "dark:text-yellow-300",
    },
    info: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      darkBg: "dark:bg-blue-900/20",
      darkText: "dark:text-blue-300",
    },
    primary: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      darkBg: "dark:bg-indigo-900/20",
      darkText: "dark:text-indigo-300",
    },
    secondary: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      darkBg: "dark:bg-gray-900/20",
      darkText: "dark:text-gray-300",
    },
    light: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      darkBg: "dark:bg-gray-900/20",
      darkText: "dark:text-gray-300",
    },
    dark: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      darkBg: "dark:bg-gray-900/20",
      darkText: "dark:text-gray-300",
    },
  };

  return colorMap[color] || colorMap.light;
};

export default function ComponentList() {
  const navigate = useNavigate();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [selectedSupplier, setSelectedSupplier] = useState<
    number | undefined
  >();
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [selectedSubcategory, setSelectedSubcategory] = useState<
    number | undefined
  >();
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [selectedVariable, setSelectedVariable] = useState<
    boolean | undefined
  >();
  const [selectedExpiry, setSelectedExpiry] = useState<boolean | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build filter object with component product types
  const filters: ProductFilters = {
    page,
    limit,
    search: debouncedSearch,
    brandId: selectedBrand,
    supplierId: selectedSupplier,
    categoryId: selectedCategory,
    subcategoryId: selectedSubcategory,
    origin: selectedOrigin || undefined,
    isVariable: selectedVariable,
    hasExpiry: selectedExpiry,
    status: selectedStatus,
    product_type: "raw_material,component,consumable,packaging",
  };

  const { data, isLoading, isError } = useGetProductsQuery(filters);
  const [deleteProduct] = useDeleteProductMutation();

  // Fetch filter options
  const { data: brandsData } = useGetBrandsQuery();
  const { data: suppliersData } = useGetSuppliersQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: subcategoriesData } = useGetSubCategoriesByCategoryIdQuery(
    selectedCategory!,
    { skip: !selectedCategory }
  );

  const brands = brandsData?.data || [];
  const suppliers = suppliersData?.data || [];
  const categories = categoriesData?.data || [];
  const subcategories = subcategoriesData?.data || [];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const canUpdate = useHasPermission("product.update");
  const canDelete = useHasPermission("product.delete");

  const products = data?.data || [];
  const meta = data?.meta;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    selectedBrand,
    selectedSupplier,
    selectedCategory,
    selectedSubcategory,
    selectedOrigin,
    selectedVariable,
    selectedExpiry,
    selectedStatus,
  ]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput("");
    setSelectedBrand(undefined);
    setSelectedSupplier(undefined);
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSelectedOrigin("");
    setSelectedVariable(undefined);
    setSelectedExpiry(undefined);
    setSelectedStatus(undefined);
    setPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchInput ||
    selectedBrand ||
    selectedSupplier ||
    selectedCategory ||
    selectedSubcategory ||
    selectedOrigin ||
    selectedVariable !== undefined ||
    selectedExpiry !== undefined ||
    selectedStatus !== undefined;

  // 🔹 Route Handlers

  const canView = useHasPermission("product.view");
  const openViewPage = useCallback(
    (product: Product) => {
      navigate(`/products/view/${product.id}`);
    },
    [navigate]
  );

  const openCreatePage = useCallback(() => {
    navigate("/products/create");
  }, [navigate]);

  const openEditPage = useCallback(
    (product: Product) => {
      navigate(`/products/edit/${product.id}`);
    },
    [navigate]
  );

  // 🔹 Delete Handling
  const openDeleteDialog = useCallback((product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id).unwrap();
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  }, [productToDelete, deleteProduct]);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  }, []);

  // 🔹 Dropdown Handling
  const toggleDropdown = useCallback(
    (productId: number) => {
      setActiveDropdown(activeDropdown === productId ? null : productId);
    },
    [activeDropdown]
  );

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // 🔹 Loading & Error States
  if (isLoading) return <Loading message="Loading Components..." />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch components.</p>;

  return (
    <>
      {/* Header Section */}

      <PageHeader
        title="Component Management"
        icon={<Plus size={16} />}
        addLabel="Add Component"
        onAdd={openCreatePage}
        permission="product.create"
      />

      {/* Search & Filters */}
      <div className="mb-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            }`}
          >
            Filters{" "}
            {hasActiveFilters &&
              `(${
                [
                  searchInput,
                  selectedBrand,
                  selectedSupplier,
                  selectedCategory,
                  selectedSubcategory,
                  selectedOrigin,
                  selectedVariable,
                  selectedExpiry,
                  selectedStatus,
                ].filter(Boolean).length
              })`}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              <X size={16} />
              Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4">
              {/* Brand Filter */}
              <SelectField
                label="Brand"
                data={brands}
                value={selectedBrand || ""}
                onChange={(value) =>
                  setSelectedBrand(value ? Number(value) : undefined)
                }
                allowEmpty
                emptyLabel="All Brands"
              />

              {/* Supplier Filter */}
              <SelectField
                label="Supplier"
                data={suppliers}
                value={selectedSupplier || ""}
                onChange={(value) =>
                  setSelectedSupplier(value ? Number(value) : undefined)
                }
                allowEmpty
                emptyLabel="All Suppliers"
              />

              {/* Category Filter */}
              <SelectField
                label="Category"
                data={categories}
                value={selectedCategory || ""}
                onChange={(value) =>
                  setSelectedCategory(value ? Number(value) : undefined)
                }
                allowEmpty
                emptyLabel="All Categories"
              />

              {/* Subcategory Filter */}
              <SelectField
                label="Subcategory"
                data={subcategories}
                value={selectedSubcategory || ""}
                onChange={(value) =>
                  setSelectedSubcategory(value ? Number(value) : undefined)
                }
                allowEmpty
                emptyLabel="All Subcategories"
              />

              {/* Origin Filter */}
              <SelectField
                label="Origin"
                data={[
                  { id: "", name: "All Origins" },
                  { id: "china", name: "China" },
                  { id: "usa", name: "USA" },
                  { id: "japan", name: "Japan" },
                ]}
                value={selectedOrigin}
                onChange={setSelectedOrigin}
              />

              {/* Has Expiry Filter */}
              <SelectField
                label="Has Expiry"
                data={[
                  { id: "", name: "All" },
                  { id: "true", name: "Has Expiry" },
                  { id: "false", name: "No Expiry" },
                ]}
                value={
                  selectedExpiry === undefined ? "" : selectedExpiry.toString()
                }
                onChange={(value) =>
                  setSelectedExpiry(value === "" ? undefined : value === "true")
                }
              />

              {/* Status Filter */}
              <SelectField
                label="Status"
                data={[
                  { id: "", name: "All Status" },
                  { id: "true", name: "Active" },
                  { id: "false", name: "Inactive" },
                ]}
                value={
                  selectedStatus === undefined ? "" : selectedStatus.toString()
                }
                onChange={(value) =>
                  setSelectedStatus(value === "" ? undefined : value === "true")
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader colSpan={2}>
                  Component
                </TableCell>
                <TableCell isHeader>Type</TableCell>
                <TableCell isHeader>Brand</TableCell>
                <TableCell isHeader>Supplier</TableCell>
                <TableCell isHeader>Unit Price</TableCell>
                <TableCell isHeader>Purchase Price</TableCell>
                <TableCell isHeader>Stock</TableCell>
                <TableCell isHeader>Actions</TableCell>
                <TableCell isHeader>Status</TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {/* Product Info - 2 columns */}
                    <TableCell className="py-3 w-20">
                      {product.images?.[0]?.url ? (
                        <ResponsiveImage
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                          <span className="text-xs text-gray-400">
                            No Image
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          <Link
                            to={`/products/view/${product.id}`}
                            className=" hover:underline"
                          >
                            {product.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <div>
                            {product.category?.name && (
                              <span className="mr-2">
                                {product.category.name}
                              </span>
                            )}
                            {product.subcategory?.name && (
                              <span className="mr-2">
                                {product.subcategory.name}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="mr-2">SKU: {product.sku}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {product.product_type &&
                        (() => {
                          const badge = getProductTypeBadge(
                            product.product_type
                          );
                          const classes = getBadgeClasses(badge.color);
                          return (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${classes.bg} ${classes.text} ${classes.darkBg} ${classes.darkText}`}
                            >
                              {badge.text}
                            </span>
                          );
                        })()}
                    </TableCell>
                    <TableCell>
                      {product.brand?.name && (
                        <span className="mr-2">{product.brand.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.supplier?.name ? (
                        <span> {product.supplier.name}</span>
                      ) : (
                        <span className="text-gray-400 text-center">N/A</span>
                      )}
                    </TableCell>
                    {/* Pricing */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="font-medium text-green-600">
                          ৳{Number(product.selling_price).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="text-gray-500">
                          ৳{Number(product.purchase_price).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    {/* Inventory */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="font-medium">
                          {product.available_stock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.status && (
                        <span
                          className={
                            product.status ? "text-green-600" : "text-red-600"
                          }
                        >
                          {product.status ? "Active" : "Inactive"}
                        </span>
                      )}
                    </TableCell>
                    {/* Actions */}
                    <TableCell className="py-3">
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(product.id)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Actions"
                        >
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>

                        <Dropdown
                          isOpen={activeDropdown === product.id}
                          onClose={() => {
                            closeDropdown();
                            closeDeleteModal();
                          }}
                          className="min-w-40"
                        >
                          {canView && (
                            <DropdownItem
                              onClick={() => {
                                openViewPage(product);
                                closeDropdown();
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye size={16} />
                              View
                            </DropdownItem>
                          )}

                          {canUpdate && (
                            <DropdownItem
                              onClick={() => {
                                openEditPage(product);
                                closeDropdown();
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Pencil size={16} />
                              Edit
                            </DropdownItem>
                          )}

                          {canDelete && (
                            <DropdownItem
                              onClick={() => {
                                openDeleteDialog(product);
                                closeDropdown();
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Delete
                            </DropdownItem>
                          )}
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2 w-full justify-center">
                      <p className="text-lg font-medium">No components found</p>
                      <p className="text-sm">
                        Get started by adding your first component
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={{
            currentPage: meta.page,
            totalPages: meta.totalPages,
            total: meta.total,
          }}
          onPageChange={handlePageChange}
          currentPageItems={products.length}
          itemsPerPage={limit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {canDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          title="Delete Component"
          message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </>
  );
}
