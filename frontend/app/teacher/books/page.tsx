'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { FiSearch, FiPlus, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

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

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <FiChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg border ${
            currentPage === page
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
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

// Main Teacher Books Component
export default function TeacherBooks() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books', { params: { search } });
      setBooks(res.data.books);
      setCurrentPage(1); // Reset to first page when search changes
    } catch (e: any) {
      showToast(e.response?.data?.message || t('failedToLoadBooks') || 'Failed to load books', 'error');
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

  // Pagination calculations
  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / itemsPerPage);

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

        {/* Books Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Publisher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Copies Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBooks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {t('noBooksFound') || 'No books found'}
                    </td>
                  </tr>
                ) : (
                  currentBooks.map((book: any) => (
                    <tr 
                      key={book.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {book.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {book.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {book.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {book.publisher || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {book.isbn || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          book.copies > 3 
                            ? 'bg-green-100 text-green-800'
                            : book.copies > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {book.copies}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.copies > 0 ? (
                          <span className="text-green-600 font-medium">Available</span>
                        ) : (
                          <span className="text-red-600 font-medium">Out of Stock</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
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