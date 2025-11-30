// app/librarian/books/page.tsx — FIXED VERSION (TypeScript safe)
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api, { setAuthToken } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';

interface Book {
  id: string;
  name: string;
  title: string;
  category: string;
  publisher: string;
  isbn: string;
  copies: number;
}

const emptyBook: Book = { id: '', name: '', title: '', category: '', publisher: '', isbn: '', copies: 0 };

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <FiX className="w-5 h-5" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Toast({ toast }: { toast: { message: string; type: 'success' | 'error' } }) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white flex items-center gap-2 text-sm shadow-lg ${
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <FiCheckCircle className="w-4 h-4" />
      {toast.message}
    </motion.div>
  );
}

// Updated BookForm with proper type handling
function BookForm({
  form,
  setForm,
  onSubmit,
  updating,
  isEdit,
}: {
  form: Book | null;
  setForm: React.Dispatch<React.SetStateAction<Book | null>>;
  onSubmit: () => void;
  updating: boolean;
  isEdit: boolean;
}) {
  const { t } = useTranslation();

  // If form is null, show loading or fallback
  if (!form) {
    return <p className="text-center text-gray-500">{t('loading')}...</p>;
  }

  const fields: (keyof Book)[] = isEdit
    ? ['name', 'title', 'category', 'publisher', 'isbn']
    : ['id', 'name', 'title', 'category', 'publisher', 'isbn'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof Book;
    
    setForm(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        [key]: key === 'copies' ? +value || 0 : value,
      };
    });
  };

  return (
    <motion.form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      {isEdit && (
        <div>
          <label className="block text-xs font-medium">{t('id')}</label>
          <input readOnly value={form.id} className="mt-1 w-full border rounded px-2 py-1.5 bg-gray-100 text-sm" />
        </div>
      )}
      {fields.map((f, i) => (
        <motion.div key={f} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <label className="block text-xs font-medium capitalize">{t(f)}</label>
          <input
            required
            name={f}
            value={form[f] || ''}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </motion.div>
      ))}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fields.length * 0.05 }}>
        <label className="block text-xs font-medium">{t('copies')}</label>
        <input
          required
          type="number"
          name="copies"
          value={form.copies}
          onChange={handleChange}
          className="mt-1 w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </motion.div>
      <div className="sm:col-span-2 text-right">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={updating}
          className="bg-indigo-600 text-white px-4 py-2 rounded text-sm disabled:opacity-70 shadow-md hover:shadow-lg"
        >
          {updating ? t('saving') + '...' : isEdit ? t('updateBook') : t('addBook')}
        </motion.button>
      </div>
    </motion.form>
  );
}

export default function LibrarianBooks() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [showAdd, setShowAdd] = useState(false);
  const [showEditId, setShowEditId] = useState(false);
  const [inputId, setInputId] = useState('');
  const [editForm, setEditForm] = useState<Book | null>(null);
  const [updating, setUpdating] = useState(false);
  const [addForm, setAddForm] = useState<Book>(emptyBook);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', { params: { page, limit, search } });
      setBooks(res.data.books);
      setTotal(res.data.total);
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || t('failedToLoadBooks'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, search]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async () => {
    try {
      await api.post('/books', addForm);
      setShowAdd(false);
      setAddForm(emptyBook);
      showToast(t('bookAdded'), 'success');
      fetchBooks();
    } catch (err: any) {
      showToast(err.response?.data?.message || t('addFailed'), 'error');
    }
  };

  const checkBookId = async () => {
    if (!inputId.trim()) return showToast(t('enterBookId'), 'error');
    try {
      const res = await api.get(`/books/id/${inputId}`);
      setEditForm(res.data.book);
      setShowEditId(false);
      showToast(t('bookLoaded'), 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || t('notFound'), 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editForm) return;
    setUpdating(true);
    const { id, ...data } = editForm;
    try {
      await api.put(`/books/${id}`, data);
      setEditForm(null);
      showToast(t('updated'), 'success');
      fetchBooks();
    } catch (err: any) {
      showToast(err.response?.data?.message || t('updateFailed'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await api.delete(`/books/${id}`);
      showToast(t('deleted'), 'success');
      fetchBooks();
    } catch (err: any) {
      showToast(err.response?.data?.message || t('deleteFailed'), 'error');
    }
  };

  const closeAll = () => {
    setShowAdd(false);
    setShowEditId(false);
    setEditForm(null);
  };

  // Create a wrapper function for setAddForm that handles Book | null
  const setAddFormSafe = (value: React.SetStateAction<Book | null>) => {
    if (value === null) {
      setAddForm(emptyBook);
    } else if (typeof value === 'function') {
      setAddForm(prev => {
        const result = value(prev);
        return result === null ? emptyBook : result;
      });
    } else {
      setAddForm(value);
    }
  };

  return (
    <Layout role="librarian">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('bookCatalog')}</h1>
              <p className="text-sm sm:text-base text-gray-600">{t('manageBooksOnly')}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
                <FiPlus className="w-4 h-4" /> {t('add')}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowEditId(true)}
                className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                <FiEdit2 className="w-4 h-4" /> {t('edit')}
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <FiSearch className="text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={t('search') + '...'}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Books Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto">
              <thead className="bg-gray-50 text-xs sm:text-sm">
                <tr>
                  <th className="text-left px-4 py-3">{t('id')}</th>
                  <th className="text-left px-4 py-3">{t('name')}</th>
                  <th className="text-left px-4 py-3">{t('title')}</th>
                  <th className="text-left px-4 py-3">{t('category')}</th>
                  <th className="text-left px-4 py-3">{t('copies')}</th>
                  <th className="text-center px-4 py-3">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t('loading')}...</td></tr>
                ) : books.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t('noBooks')}</td></tr>
                ) : (
                  books.map((book, i) => (
                    <motion.tr key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono">{book.id}</td>
                      <td className="px-4 py-3 truncate max-w-[100px]">{book.name}</td>
                      <td className="px-4 py-3 truncate max-w-[120px]">{book.title}</td>
                      <td className="px-4 py-3 truncate max-w-[100px]">{book.category}</td>
                      <td className="px-4 py-3 text-center">{book.copies}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-800">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-600">{total} {t('total')}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 border rounded disabled:opacity-50">{t('prev')}</button>
            <span className="px-3 py-1.5">{t('page')} {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={books.length < limit}
              className="px-3 py-1.5 border rounded disabled:opacity-50">{t('next')}</button>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showAdd && (
            <Modal onClose={closeAll}>
              <h2 className="text-2xl font-bold mb-4">{t('addBook')}</h2>
              <BookForm 
                form={addForm} 
                setForm={setAddFormSafe} 
                onSubmit={handleAdd} 
                updating={false} 
                isEdit={false} 
              />
            </Modal>
          )}
          {showEditId && (
            <Modal onClose={closeAll}>
              <h2 className="text-2xl font-bold mb-4">{t('enterBookId')}</h2>
              <div className="flex gap-2">
                <input value={inputId} onChange={(e) => setInputId(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && checkBookId()}
                  className="flex-1 border p-2 rounded" placeholder={t('exampleId')} />
                <button onClick={checkBookId} className="bg-green-600 text-white px-4 py-2 rounded">{t('load')}</button>
              </div>
            </Modal>
          )}
          {editForm && (
            <Modal onClose={closeAll}>
              <h2 className="text-2xl font-bold mb-4">{t('edit')}: {editForm.id}</h2>
              <BookForm 
                form={editForm} 
                setForm={setEditForm} 
                onSubmit={handleUpdate} 
                updating={updating} 
                isEdit={true} 
              />
            </Modal>
          )}
          {toast && <Toast toast={toast} />}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}