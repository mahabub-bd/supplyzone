import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Sale } from "../../../types/sales";

const SalesTable = ({ sales }: any) => (
  <div className="max-w-full overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell isHeader>Invoice</TableCell>
          <TableCell isHeader>Date</TableCell>
          <TableCell isHeader>Items</TableCell>
          <TableCell isHeader>Total</TableCell>
          <TableCell isHeader>Paid</TableCell>
          <TableCell isHeader>Due</TableCell>
          <TableCell isHeader>Sale Type</TableCell>
          <TableCell isHeader>Status</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((s: Sale) => (
          <TableRow key={s.id} className="border-b">
            <TableCell className="table-body">
              <Link
                to={`/sales/${s.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {s.invoice_no}
              </Link>
            </TableCell>

            <TableCell className="table-body">
              {new Date(s.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="table-body">{s.items?.length || 0}</TableCell>
            <td className="table-body">{Number(s.total).toLocaleString()}</td>
            <TableCell className="table-body text-green-600 font-medium">
              {Number(s.paid_amount).toLocaleString()}
            </TableCell>
            <TableCell className="table-body text-red-500 font-medium">
              {(Number(s.total) - Number(s.paid_amount)).toLocaleString()}
            </TableCell>
            <TableCell className="capitalize flex items-center gap-1">
              {s.sale_type === "pos" ? "POS" : "Regular"}
            </TableCell>
            <TableCell className="table-body capitalize">{s.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default SalesTable;
