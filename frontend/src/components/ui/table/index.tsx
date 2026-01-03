import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: ReactNode;
  isHeader?: boolean;
  rowSpan?: number;
  colSpan?: number;
  className?: string;
}

// 🟢 Table - Added table-fixed for better column control
const Table: React.FC<TableProps> = ({ children, className }) => (
  <table className={`min-w-full table-auto ${className || ""}`}>
    {children}
  </table>
);

// 🟢 Table Header with Default Border
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead
    className={`border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 ${
      className || ""
    }`}
  >
    {children}
  </thead>
);

// 🟢 Table Body with Default Divider Styling
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
  <tbody
    className={`divide-y divide-gray-100 dark:divide-gray-800 ${
      className || ""
    }`}
  >
    {children}
  </tbody>
);

// 🟢 Table Row
const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  onClick,
}) => (
  <tr className={className} onClick={onClick}>
    {children}
  </tr>
);

// 🟢 Table Cell - Enhanced with better overflow handling
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  rowSpan,
  colSpan,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";

  const defaultStyles = isHeader
    ? "px-4 py-3 text-left text-[13px] font-medium text-gray-500 dark:text-gray-400"
    : "px-4 py-3 text-[14px] text-gray-700 dark:text-gray-300";

  return (
    <CellTag
      rowSpan={rowSpan}
      colSpan={colSpan}
      className={`${defaultStyles} ${className || ""}`}
    >
      {children}
    </CellTag>
  );
};

export { Table, TableBody, TableCell, TableHeader, TableRow };
