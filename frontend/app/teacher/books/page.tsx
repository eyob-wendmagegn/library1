//app/teacher/books/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiChevronUp, 
  FiChevronDown, 
  FiFilter,
  FiMoreVertical,
  FiEye,
  FiEyeOff,
  FiColumns
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

// TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  SortingFn,
} from '@tanstack/react-table';

const emptyAddForm = { id: '', name: '', title: '', category: '', publisher: '', isbn: '', copies: 0 };

// Modal Component
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <FiX className="w-6 h-6" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}

// Toast Component
function Toast({ toast }: { toast: { message: string; type: 'success' | 'error' } }) {
  return (
    <motion.div
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      exit={{ x: 100 }}
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg text-white flex items-center gap-2 ${
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {toast.message}
    </motion.div>
  );
}

// Add Book Form Component
function AddBookForm({ form, setForm, onSubmit }: any) {
  const { t } = useTranslation();
  const handle = (e: any) =>
    setForm({
      ...form,
      [e.target.name]: e.target.name === 'copies' ? +e.target.value : e.target.value,
    });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      {['id', 'name', 'title', 'category', 'publisher', 'isbn'].map((f) => (
        <input
          key={f}
          name={f}
          placeholder={t(f) || f.charAt(0).toUpperCase() + f.slice(1)}
          required
          value={form[f]}
          onChange={handle}
          className="w-full border p-2 rounded"
        />
      ))}
      <input
        type="number"
        name="copies"
        placeholder={t('copies') || 'Copies'}
        required
        min="0"
        value={form.copies}
        onChange={handle}
        className="w-full border p-2 rounded"
      />
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">
        {t('addBook') || 'Add Book'}
      </button>
    </form>
  );
}

// Column Menu Component
function ColumnMenu({ column, onClose }: { column: any; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48"
    >
      <div className="p-2">
        <button
          onClick={() => {
            column.toggleSorting(false);
            onClose();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
        >
          <FiChevronUp className="w-4 h-4" />
          Sort Ascending
        </button>
        <button
          onClick={() => {
            column.toggleSorting(true);
            onClose();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
        >
          <FiChevronDown className="w-4 h-4" />
          Sort Descending
        </button>
        {column.getIsSorted() && (
          <button
            onClick={() => {
              column.clearSorting();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
          >
            <FiX className="w-4 h-4" />
            Clear Sort
          </button>
        )}
        
        <div className="border-t my-1"></div>
        
        <button
          onClick={() => {
            column.toggleVisibility();
            onClose();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
        >
          {column.getIsVisible() ? (
            <>
              <FiEyeOff className="w-4 h-4" />
              Hide Column
            </>
          ) : (
            <>
              <FiEye className="w-4 h-4" />
              Show Column
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Columns Visibility Menu Component
function ColumnsVisibilityMenu({ table, onClose }: { table: any; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Map column IDs to display names
  const columnDisplayNames: { [key: string]: string } = {
    id: 'ID',
    title: 'Title',
    name: 'Name',
    category: 'Category',
    publisher: 'Publisher',
    isbn: 'ISBN',
    copies: 'Copies',
    status: 'Status'
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48"
    >
      <div className="p-2">
        <div className="text-xs font-semibold text-gray-500 px-2 py-1 uppercase tracking-wide">
          Show/Hide Columns
        </div>
        {table.getAllLeafColumns().map((column: any) => (
          <label key={column.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex-1">{columnDisplayNames[column.id] || column.id}</span>
          </label>
        ))}
        <div className="border-t my-1"></div>
        <button
          onClick={() => {
            table.resetColumnVisibility();
            onClose();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded text-blue-600"
        >
          <FiEye className="w-4 h-4" />
          Show All Columns
        </button>
      </div>
    </div>
  );
}

// Sortable Column Header Component
function SortableHeader({ column, children }: { column: any; children: React.ReactNode }) {
  const [showMenu, setShowMenu] = useState(false);
  const sorted = column.getIsSorted();

  return (
    <div className="flex items-center justify-between group relative">
      <div className="flex items-center gap-1 flex-1">
        <span>{children}</span>
        <div className="flex flex-col">
          {sorted === 'asc' ? (
            <FiChevronUp className="w-3 h-3 text-blue-600" />
          ) : sorted === 'desc' ? (
            <FiChevronDown className="w-3 h-3 text-blue-600" />
          ) : (
            <>
              <FiChevronUp className="w-2 h-2 text-gray-400" />
              <FiChevronDown className="w-2 h-2 text-gray-400 -mt-1" />
            </>
          )}
        </div>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FiMoreVertical className="w-3 h-3 text-gray-500" />
      </button>
      
      {showMenu && (
        <ColumnMenu column={column} onClose={() => setShowMenu(false)} />
      )}
    </div>
  );
}

// Custom sorting function for ID column to handle numeric values
const numericSort: SortingFn<any> = (rowA, rowB, columnId) => {
  const valueA = rowA.getValue(columnId);
  const valueB = rowB.getValue(columnId);
  
  // Convert to numbers for comparison
  const numA = Number(valueA);
  const numB = Number(valueB);
  
  // If both are valid numbers, compare numerically
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  
  // Fallback to string comparison
  return String(valueA).localeCompare(String(valueB));
};

// Main Teacher Books Component
export default function TeacherBooks() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showSearch, setShowSearch] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/books', { params: { search } });
      setBooks(res.data.books);
    } catch (e: any) {
      showToast(e.response?.data?.message || t('failedToLoadBooks') || 'Failed to load books', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async () => {
    try {
      await api.post('/books', addForm);
      setShowAdd(false);
      setAddForm(emptyAddForm);
      showToast(t('bookAdded') || 'Book added successfully', 'success');
      fetchBooks();
    } catch (e: any) {
      showToast(e.response?.data?.message || t('addFailed') || 'Failed to add book', 'error');
    }
  };

  // Define columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <SortableHeader column={column}>
            ID
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue('id')}</span>
        ),
        size: 80,
        sortingFn: numericSort, // Use custom numeric sorting for ID
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Title
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue('title')}</span>
        ),
        size: 200,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Name
          </SortableHeader>
        ),
        size: 150,
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Category
          </SortableHeader>
        ),
        cell: ({ row }) => row.getValue('category') || '-',
        size: 150,
      },
      {
        accessorKey: 'publisher',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Publisher
          </SortableHeader>
        ),
        cell: ({ row }) => row.getValue('publisher') || '-',
        size: 150,
      },
      {
        accessorKey: 'isbn',
        header: ({ column }) => (
          <SortableHeader column={column}>
            ISBN
          </SortableHeader>
        ),
        cell: ({ row }) => row.getValue('isbn') || '-',
        size: 150,
      },
      {
        accessorKey: 'copies',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Copies
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const copies = row.getValue('copies') as number;
          return (
            <span className="text-sm font-medium">
              {copies}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <SortableHeader column={column}>
            Status
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const copies = row.original.copies;
          const status = copies > 0 ? 'Available' : 'Out of Stock';
          return (
            <span className={`text-sm font-medium ${
              status === 'Available' ? 'text-green-600' : 'text-red-600'
            }`}>
              {status}
            </span>
          );
        },
        size: 120,
      },
    ],
    []
  );

  // Initialize table
  const table = useReactTable({
    data: books,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Layout role="teacher">
      <div className="space-y-6 p-4">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('teacherLibrary') || 'Teacher Library'}</h1>
              <p className="text-gray-600">{t('addAndViewBooks') || 'Add and view books'}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setShowAdd(true)} 
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiPlus /> {t('addBook') || 'Add Book'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex gap-2">
            <FiSearch className="text-gray-500 mt-2" />
            <input
              placeholder={t('searchBooks') || 'Search books...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Search and Filter Controls */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Show/Hide Search Button */}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  title={showSearch ? "Hide search" : "Show search"}
                >
                  <FiSearch className="w-4 h-4" />
                  {showSearch ? "Hide search" : "Show search"}
                </button>

                {/* Columns Visibility Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                    className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    title="Show/Hide columns"
                  >
                    <FiColumns className="w-4 h-4" />
                    
                  </button>
                  
                  {showColumnsMenu && (
                    <ColumnsVisibilityMenu 
                      table={table} 
                      onClose={() => setShowColumnsMenu(false)} 
                    />
                  )}
                </div>
              </div>
              
              {/* Global Search */}
              {showSearch && (
                <div className="flex items-center gap-2">
                  <FiSearch className="text-gray-500" />
                  <input
                    placeholder="Search all columns..."
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(String(e.target.value))}
                    className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider border-r last:border-r-0"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id} 
                          className="px-4 py-3 text-sm text-gray-900 border-r last:border-r-0"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                      {isLoading ? 'Loading books...' : (t('noBooksFound') || 'No books found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Exact match to image */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Rows per page</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )} of {table.getFilteredRowModel().rows.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAdd && (
          <Modal onClose={() => setShowAdd(false)}>
            <h2 className="text-xl font-bold mb-4">{t('addNewBook') || 'Add New Book'}</h2>
            <AddBookForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} />
          </Modal>
        )}
        {toast && <Toast toast={toast} />}
      </AnimatePresence>
    </Layout>
  );
}