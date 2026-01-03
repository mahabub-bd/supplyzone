import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../button/Button";

interface PaginationMeta {
  total: number;
  totalPages: number;
  page?: number;
  currentPage?: number;
  limit?: number;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  currentPageItems?: number;
  itemsPerPage?: number;
}

export default function Pagination({
  meta,
  onPageChange,
  currentPageItems = 0,
}: PaginationProps) {
  const currentPage = meta.currentPage || meta.page || 1;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < meta.totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const totalPages = meta.totalPages;
    const current = currentPage;
    const delta = 2; // Number of pages to show around current page
    let range: number[] = [];
    let rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (current + delta < totalPages) {
      rangeWithDots.push(totalPages);
    }

    if (totalPages === 1) {
      return [1];
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {currentPageItems} of {meta.total} results
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          startIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Prev
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) =>
            pageNum === "..." ? (
              <span
                key={`dots-${index}`}
                className="w-8 h-8 flex items-center justify-center text-sm text-gray-500"
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNum as number}
                onClick={() => onPageChange(pageNum as number)}
                variant={
                  (pageNum as number) === currentPage ? "primary" : "outline"
                }
                size="sm"
                className={`w-8 h-8 ${
                  (pageNum as number) === currentPage
                    ? ""
                    : "border border-gray-300"
                }`}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        <Button
          onClick={handleNextPage}
          disabled={currentPage === meta.totalPages}
          variant="outline"
          size="sm"
          endIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
