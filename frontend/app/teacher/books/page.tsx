'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

const emptyAddForm = { id: '', name: '', title: '', category: '', publisher: '', isbn: '', copies: 0 };

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
          placeholder={t(f.toUpperCase())}
          required
          value={form[f]}
          onChange={handle}
          className="w-full border p-2 rounded"
        />
      ))}
      <input
        type="number"
        name="copies"
        placeholder={t('copies')}
        required
        value={form.copies}
        onChange={handle}
        className="w-full border p-2 rounded"
      />
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">
        {t('addBook')}
      </button>
    </form>
  );
}

export default function TeacherBooks() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books', { params: { search } });
      setBooks(res.data.books);
    } catch (e: any) {
      showToast(e.response?.data?.message || t('failedToLoadBooks'), 'error');
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
      showToast(t('bookAdded'), 'success');
      fetchBooks();
    } catch (e: any) {
      showToast(e.response?.data?.message || t('addFailed'), 'error');
    }
  };

  return (
    <Layout role="teacher">
      <div className="space-y-6 p-4">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('teacherLibrary')}</h1>
              <p className="text-gray-600">{t('addAndViewBooks')}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                <FiPlus /> {t('addBook')}
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <FiSearch className="text-gray-500 mt-2" />
            <input
              placeholder={t('searchBooks')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-8">{t('noBooksFound')}</p>
          ) : (
            books.map((book: any) => (
              <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg">{book.title}</h3>
                <p className="text-sm text-gray-600">ID: {book.id}</p>
                <p className="text-sm">{t('name')}: {book.name}</p>
                <p className={`text-sm font-medium ${book.copies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {t('copiesAvailable')}: {book.copies}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <Modal onClose={() => setShowAdd(false)}>
            <h2 className="text-xl font-bold mb-4">{t('addNewBook')}</h2>
            <AddBookForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} />
          </Modal>
        )}
        {toast && <Toast toast={toast} />}
      </AnimatePresence>
    </Layout>
  );
}