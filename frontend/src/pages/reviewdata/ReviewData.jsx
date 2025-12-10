import React, { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, getFilteredRowModel, getSortedRowModel } from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { FaSortUp, FaSortDown } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import { Card } from "@/components/ui/card";
import useFetch from '../../hooks/useFetch';
import useContext from '../../zustand/useContext';
import { Spinner } from "@/components/ui/spinner";

const ReviewData = () => {
    const [columnVisibility, setColumnVisibility] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    
    const targetAirline = useContext((state) => state.targetAirline);
    
    const url = useMemo(() => {
        if (!targetAirline) return null;
        return `/airlines/${encodeURIComponent(targetAirline)}/reviews`;
    }, [targetAirline]);
    
    const { data, loading } = useFetch(url);

    const ColumnFilter = ({ column, data, accessorKey }) => {
        const [filterValue, setFilterValue] = useState("all");
        
        const uniqueValues = useMemo(() => {
            const values = data.map(row => row[accessorKey]).filter(Boolean);
            return [...new Set(values)];
        }, [data, accessorKey]);
    
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="-ml-2 h-8 w-8">
                        <IoFilter className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    <DropdownMenuCheckboxItem
                        checked={filterValue === "all"}
                        onCheckedChange={() => {
                            setFilterValue("all");
                            column.setFilterValue(undefined);
                        }}
                    >
                        All
                    </DropdownMenuCheckboxItem>
                    {uniqueValues.map(value => (
                        <DropdownMenuCheckboxItem
                            key={value}
                            checked={filterValue === value}
                            onCheckedChange={() => {
                                setFilterValue(value);
                                column.setFilterValue(value);
                            }}
                        >
                            {value}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const columns = [
        {
            id: "index",
            header: "#",
            meta: { headerName: "#" },
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "reviewId",
            header: "Review ID",
            meta: { headerName: "Review ID" },
            cell: ({ row }) => <span className="font-mono">{row.getValue("reviewId")}</span>,
        },
        {
            accessorKey: "title",
            header: "Title",
            meta: { headerName: "Title" },
            cell: ({ row }) => <span className="font-medium">{row.getValue("title")}</span>,
        },
        {
            accessorKey: "score",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="ml-2 hover:bg-transparent font-bold flex items-center"
                >
                    Score
                    <div className="flex flex-col">
                        <FaSortUp 
                            style={{ width: '20px', height: '20px' }}
                            className={`-mb-2.5 ${column.getIsSorted() === "asc" ? "text-black" : "text-gray-400"}`} 
                        />
                        <FaSortDown
                            style={{ width: '20px', height: '20px' }} 
                            className={`-mt-2.5 ${column.getIsSorted() === "desc" ? "text-black" : "text-gray-400"}`} 
                        />
                    </div>
                </Button>
            ),
            meta: { headerName: "Score" },
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <span className="font-semibold text-[#5D5FEF]">{row.getValue("score")}</span>
                    <span className="text-gray-500 ml-1">/ 10</span>
                </div>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "content",
            header: "Content",
            cell: ({ row }) => (
                <span className="whitespace-nowrap">
                    {row.getValue("content")}
                </span>
            ),
        },
        {
            accessorKey: "verifiedType",
            header: ({ column }) => (
                <div className="flex items-center justify-center gap-2">
                    <span>Verified Type</span>
                    <ColumnFilter column={column} data={reviewData} accessorKey="verifiedType" />
                </div>
            ),
            meta: { headerName: "Verified Type" },
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.getValue("verifiedType") === "✅ Trip Verified" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-700"
                }`}>
                    {row.getValue("verifiedType")}
                </span>
            ),
        },
        {
            accessorKey: "userName",
            header: "User Name",
            meta: { headerName: "User Name" },
            cell: ({ row }) => <span>{row.getValue("userName")}</span>,
        },
        {
            accessorKey: "country",
            header: ({ column }) => (
                <div className="flex items-center justify-center gap-2">
                    <span>Country</span>
                    <ColumnFilter column={column} data={reviewData} accessorKey="country" />
                </div>
            ),
            meta: { headerName: "Country" },
            cell: ({ row }) => <span>{row.getValue("country")}</span>,
        },
        {
            accessorKey: "reviewDate",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="ml-2 hover:bg-transparent font-bold flex items-center"
                >
                    Review Date
                    <div className="flex flex-col">
                        <FaSortUp 
                            style={{ width: '20px', height: '20px' }}
                            className={`-mb-2.5 ${column.getIsSorted() === "asc" ? "text-black" : "text-gray-400"}`} 
                        />
                        <FaSortDown
                            style={{ width: '20px', height: '20px' }} 
                            className={`-mt-2.5 ${column.getIsSorted() === "desc" ? "text-black" : "text-gray-400"}`} 
                        />
                    </div>
                </Button>
            ),
            meta: { headerName: "Review Date" },
            cell: ({ row }) => <span>{row.getValue("reviewDate")}</span>,
            enableSorting: true,
        },
        {
            accessorKey: "aircraft",
            header: ({ column }) => (
                <div className="flex items-center justify-center gap-2">
                    <span>Aircraft</span>
                    <ColumnFilter column={column} data={reviewData} accessorKey="aircraft" />
                </div>
            ),
            meta: { headerName: "Aircraft" },
            cell: ({ row }) => <span>{row.getValue("aircraft")}</span>,
        },
        {
            accessorKey: "typeOfTraveller",
            header: ({ column }) => (
                <div className="flex items-center justify-center gap-2">
                    <span>Type of Traveller</span>
                    <ColumnFilter column={column} data={reviewData} accessorKey="typeOfTraveller" />
                </div>
            ),
            meta: { headerName: "Type of Traveller" },
            cell: ({ row }) => <span>{row.getValue("typeOfTraveller")}</span>,
        },
        {
            accessorKey: "seatType",
            header: ({ column }) => (
                <div className="flex items-center justify-center gap-2">
                    <span>Seat Type</span>
                    <ColumnFilter column={column} data={reviewData} accessorKey="seatType" />
                </div>
            ),
            meta: { headerName: "Seat Type" },
            cell: ({ row }) => <span>{row.getValue("seatType")}</span>,
        },
        {
            accessorKey: "flownDate",
            header: "Flown Date",
            meta: { headerName: "Flown Date" },
            cell: ({ row }) => <span>{row.getValue("flownDate")}</span>,
        },
        {
            accessorKey: "recommended",
            header: ({ column }) => (
                <div className="flex items-center justify-center gap-2">
                    <span>Recommended</span>
                    <ColumnFilter column={column} data={reviewData} accessorKey="recommended" />
                </div>
            ),
            meta: { headerName: "Recommended" },
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.getValue("recommended") === "yes" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-red-100 text-red-700"
                }`}>
                    {row.getValue("recommended")}
                </span>
            ),
        },
    ];

    const reviewData = useMemo(() => data || [], [data]);

    const table = useReactTable({
        data: reviewData,
        columns,
        state: { globalFilter, columnVisibility },
        globalFilterFn: 'includesString',
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });


    return (
        <Card className="bg-white p-6 rounded-[20px] border border-[#f8f9fa] shadow-[0px_4px_20px_#ededed80] flex-1 flex flex-col gap-2 my-2 overflow-hidden">
            {!targetAirline ? (
                <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-xl font-semibold text-center">
                        ✈️ Please search for an airline to view reviews
                    </div>
                </div>
            ) : loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spinner className="w-10 h-10 text-[#5D5FEF]" />
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-2">
                        <Input
                            placeholder="Search reviews..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="max-w-2xl h-12"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto h-12">
                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllLeafColumns()
                                    .filter((column) => column.columnDef.enableHiding !== false)
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={() => column.toggleVisibility()}
                                        >
                                            {column.columnDef.meta?.headerName || column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    <div className="rounded-md border flex-1 flex flex-col">
                        <div className="overflow-x-auto flex-1">
                            <Table className="min-w-full">
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} className={`font-bold ${header.column.id === "content" ? "text-left" : "text-center"}`}>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id} className={`${cell.column.id === "content" ? "text-left" : "text-center"}`}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={table.getAllColumns().length} className="p-0 h-0 border-none" />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                        {!table.getRowModel().rows.length && (
                            <div className="absolute top-[50px] bottom-0 left-0 right-0 flex items-center justify-center">
                                <span className="text-xl font-semibold">🔍 No reviews found</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );
};

export default ReviewData
