"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Edit, Trash2, Filter, Send, LucideIcon } from 'lucide-react';
import { cn } from '@/helpers/utils'; // Adjust path if necessary

// --- TypeScript Interfaces ---
export interface ColumnDef {
    key: string;
    label: string;
    sortable?: boolean;
}

export interface DataTableProps {
    data: any[];
    columns: ColumnDef[];
    filterableColumns?: string[];
    onEdit?: (id: string) => void;
    onDelete?: (item: any) => void;
    onView?: (item: any) => void;
    onPublish?: (item: any) => void;
}

export default function DataTable({
    data = [],
    columns,
    filterableColumns = [],
    onEdit,
    onDelete,
    onView,
    onPublish,
}: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersState, setFiltersState] = useState<Record<string, string>>({ status: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Scans data for the keys passed in and pulls out all unique values
    const dynamicFilters = useMemo(() => {
        if (!data || !filterableColumns.length) return [];

        return filterableColumns.map(columnKey => {
            // Find all unique values for this specific column
            const uniqueValues = [...new Set(data.map(item => item[columnKey]))].filter(Boolean) as string[];

            // Find the matching column definition to use its nice Label
            const columnDef = columns.find(c => c.key === columnKey);

            return {
                key: columnKey,
                label: columnDef ? columnDef.label : columnKey,
                values: uniqueValues.sort() // Alphabetize the dropdowns
            };
        });
    }, [data, filterableColumns, columns]);

    // Filter data based on search term and status
    const filteredData = data.filter((item) => {
        const matchesSearch = Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Dynamic Filter check
        const matchesFilters = Object.entries(filtersState).every(([key, val]) => {
            // If the user hasn't selected a filter for this column, or selected "all", ignore it
            if (val === "all" || val === undefined) return true;
            return String(item[key]) === String(val);
        });

        return matchesSearch && matchesFilters;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Helper function to change page and scroll up
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    const formatValue = (value: any, key: string) => {
        // Safe number formatting check
        if ((key === 'price' || key === 'product_price') && typeof value === 'number') {
            return `₱${value.toFixed(2)}`;
        }

        if (key === 'status' || key === 'has_image' || key === 'open_24_hrs') {
            const statusColors: Record<string, string> = {
                // POSITIVE
                active: 'bg-green-100 text-green-800',
                yes: 'bg-green-100 text-green-800',
                approved: 'bg-green-100 text-green-800',
                published: 'bg-green-100 text-green-800',

                // NEGATIVE
                inactive: 'bg-red-100 text-red-800',
                no: 'bg-red-100 text-red-800',
                rejected: 'bg-red-100 text-red-800',

                // WARNING
                draft: 'bg-yellow-100 text-yellow-800',
                pending: 'bg-yellow-100 text-yellow-800',

                // DEFAULT
                archived: 'bg-gray-100 text-gray-800',
            };

            const stringVal = String(value).toLowerCase();
            return (
                <Badge className={cn('capitalize', statusColors[stringVal] || 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800')}>
                    {value}
                </Badge>
            );
        }
        if (key === 'createdAt' || key === 'date_updated' || key === 'date') {
            return value;
        }
        return value;
    };

    const ActionButton = ({ icon: Icon, onClick, hoverColor }: { icon: LucideIcon, onClick: () => void, hoverColor: string }) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn("h-8 w-8 p-0 text-gray-500 transition-colors", hoverColor)}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );

    return (
        <div className="space-y-6 max-md:mb-[4.5rem]">
            {/* Toolbar */}
            <div id="toolbar" className="flex flex-col gap-2 bg-gray-50 pt-4 rounded-lg">

                {/* Top Row: Search Bar & Desktop Results Count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full bg-white"
                        />
                    </div>

                    {/* Hidden on mobile, shows on the right on desktop */}
                    <div className="hidden sm:block text-sm text-gray-500 shrink-0">
                        Showing {filteredData.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
                        {filteredData.length} results
                    </div>
                </div>

                {/* Bottom Row: Filters */}
                <div className="max-sm:grid max-sm:grid-cols-2 flex flex-wrap items-center gap-2">
                    {dynamicFilters.map(filter => (
                        <Select
                            key={filter.key}
                            value={filtersState[filter.key] || "all"} // Default to "all" visually
                            onValueChange={(val) => {
                                setFiltersState(prev => ({ ...prev, [filter.key]: val }));
                                setCurrentPage(1); // Reset to page 1 when a filter is applied!
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-40 bg-white select-none capitalize overflow-hidden">
                                <div className="flex items-center">
                                    <Filter className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                                    <SelectValue placeholder={filter.label} />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white select-none cursor-pointer">
                                <SelectItem
                                    className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold"
                                    value="all"
                                >
                                    All {filter.label}
                                </SelectItem>

                                {filter.values.map((value: string) => (
                                    <SelectItem
                                        className="cursor-pointer capitalize data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold"
                                        key={value}
                                        value={String(value)}
                                    >
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}
                </div>

                {/* Mobile-only Results Count */}
                <div className="text-sm text-gray-500 sm:hidden text-center max-sm:mt-4">
                    Showing {filteredData.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
                    {filteredData.length} results
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-auto shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                        <Search className="h-10 w-10 mb-4 text-gray-300" />
                                        <p className="text-base font-semibold text-gray-900">No results found</p>
                                        <p className="text-sm mt-1">We couldn&apos;t find anything matching your search or filters.</p>
                                        <Button
                                            variant="link"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFiltersState({ status: 'all' });
                                            }}
                                            className="mt-4 text-blue-600"
                                        >
                                            Clear all filters
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item, index) => (
                                <tr
                                    key={item._id || index}
                                    className={cn(
                                        'hover:bg-gray-50 transition-colors',
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                    )}
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                            {column.key === 'actions' ? (
                                                <div className="flex items-center space-x-2">
                                                    {onView && <ActionButton icon={Eye} onClick={() => onView(item)} hoverColor="hover:text-blue-600" />}
                                                    {onEdit && <ActionButton icon={Edit} onClick={() => onEdit(item._id)} hoverColor="hover:text-green-600" />}
                                                    {onDelete && <ActionButton icon={Trash2} onClick={() => onDelete(item)} hoverColor="hover:text-red-600" />}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-900">
                                                    {formatValue(item[column.key], column.key)}
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {paginatedData.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                        <Search className="h-10 w-10 mb-4 text-gray-300" />
                        <p className="text-base font-semibold text-gray-900">No results found</p>
                        <p className="text-sm text-gray-500 mt-1">Adjust your search or filters to find what you&apos;re looking for.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchTerm('');
                                setFiltersState({ status: 'all' });
                            }}
                            className="mt-6"
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    paginatedData.map((item, index) => {
                        // Identify the key pieces of data to establish hierarchy
                        const titleColumn = columns[0]; // Assume first column is the main identifier
                        const statusColumn = columns.find(c => c.key === 'status' || c.key === 'open_24_hrs' || c.key === 'has_image');
                        const otherColumns = columns.filter(c =>
                            c.key !== 'actions' &&
                            c.key !== titleColumn.key &&
                            c.key !== 'status' &&
                            c.key !== 'open_24_hrs' &&
                            c.key !== 'has_image'
                        );

                        return (
                            <div key={item._id || index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                {/* Card Header */}
                                <div className="p-4 border-b border-gray-100 flex justify-between items-start gap-4 bg-gray-50/50">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 truncate">
                                            {formatValue(item[titleColumn.key], titleColumn.key)}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                                            {titleColumn.label}
                                        </p>
                                    </div>
                                    {statusColumn && (
                                        <div className="shrink-0 mt-0.5">
                                            {formatValue(item[statusColumn.key], statusColumn.key)}
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                        {otherColumns.map((column) => (
                                            <div key={column.key} className={cn(
                                                "flex flex-col",
                                                (column.key === "product_name" || column.key === "address" || column.key === "name") && "col-span-2"
                                            )}>
                                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                    {column.label}
                                                </span>
                                                <span className="text-sm text-gray-800 font-medium truncate">
                                                    {formatValue(item[column.key], column.key)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                {(onView || onEdit || onDelete || onPublish) && (
                                    <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-100 flex flex-wrap justify-end gap-1">
                                        {onView && (
                                            <Button variant="ghost" size="sm" onClick={() => onView(item)} className="h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50">
                                                <Eye className="h-4 w-4 mr-2" /> View
                                            </Button>
                                        )}
                                        {onPublish && (
                                            <Button variant="ghost" size="sm" onClick={() => onPublish(item)} className="h-9 text-green-600 hover:text-green-700 hover:bg-green-50/50">
                                                <Send className="h-4 w-4 mr-2" /> Publish
                                            </Button>
                                        )}
                                        {onEdit && (
                                            <Button variant="ghost" size="sm" onClick={() => onEdit(item._id)} className="h-9 text-green-600 hover:text-green-700 hover:bg-green-50/50">
                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button variant="ghost" size="sm" onClick={() => onDelete(item)} className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50/50">
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Page <span className="font-medium">{currentPage}</span> of{' '}
                                <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-r-none"
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5) {
                                        if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                    }
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className="rounded-none"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-l-none"
                                >
                                    Next
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
