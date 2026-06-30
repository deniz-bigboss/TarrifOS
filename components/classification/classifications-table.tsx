"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HumanReviewBadge } from "@/components/human-review-badge";
import { countryName, formatDate } from "@/lib/utils";

export interface ClassificationRow {
  id: string;
  productName: string;
  category: string | null;
  code: string;
  destination: string | null;
  origin: string | null;
  confidence: number | null;
  confidenceLabel: string | null;
  humanReview: boolean;
  createdAt: string;
}

export function ClassificationsTable({ rows }: { rows: ClassificationRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState("");
  const [confidence, setConfidence] = useState("");
  const [review, setReview] = useState("");
  const [category, setCategory] = useState("");

  const destinations = useMemo(
    () => unique(rows.map((r) => r.destination).filter(Boolean) as string[]),
    [rows],
  );
  const categories = useMemo(
    () => unique(rows.map((r) => r.category).filter(Boolean) as string[]),
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search && !`${r.productName} ${r.code}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (destination && r.destination !== destination) return false;
      if (confidence && r.confidenceLabel !== confidence) return false;
      if (review === "required" && !r.humanReview) return false;
      if (review === "cleared" && r.humanReview) return false;
      if (category && r.category !== category) return false;
      return true;
    });
  }, [rows, search, destination, confidence, review, category]);

  const columns = useMemo<ColumnDef<ClassificationRow>[]>(
    () => [
      {
        header: "Product",
        accessorKey: "productName",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.productName}</span>
        ),
      },
      {
        header: "Code",
        accessorKey: "code",
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.code || "—"}</span>
        ),
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: ({ row }) => (
          <span className="capitalize text-sm text-muted-foreground">
            {row.original.category || "—"}
          </span>
        ),
      },
      {
        header: "Lane",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.origin} → {row.original.destination}
          </span>
        ),
      },
      {
        header: "Confidence",
        accessorKey: "confidence",
        cell: ({ row }) => {
          const c = row.original;
          if (c.confidence == null) return "—";
          return (
            <Badge
              variant={
                c.confidenceLabel === "high"
                  ? "success"
                  : c.confidenceLabel === "medium"
                    ? "warning"
                    : "destructive"
              }
            >
              {Math.round(c.confidence * 100)}% · {c.confidenceLabel}
            </Badge>
          );
        },
      },
      {
        header: "Status",
        cell: ({ row }) => <HumanReviewBadge required={row.original.humanReview} />,
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label className="text-xs">Search</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Product or code"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Destination</Label>
          <Select value={destination} onChange={(e) => setDestination(e.target.value)}>
            <option value="">All</option>
            {destinations.map((d) => (
              <option key={d} value={d}>{countryName(d)} ({d})</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Confidence</Label>
          <Select value={confidence} onChange={(e) => setConfidence(e.target.value)}>
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Review</Label>
          <Select value={review} onChange={(e) => setReview(e.target.value)}>
            <option value="">All</option>
            <option value="required">Needs review</option>
            <option value="cleared">Auto-cleared</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  No classifications match these filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/classifications/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {filtered.length} of {rows.length} classifications
      </p>
    </div>
  );
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
