// app/teacher/books/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { FiSearch, FiPlus, FiBookOpen, FiRotateCcw, FiEye, FiX, FiDollarSign } from 'react-icons/fi';
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

function BorrowForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ userId: '', username: '', bookId: '', bookName: '', dueDate: '' });

  const handle = (e: any) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === 'bookId' || e.target.name === 'bookName') {
      const now = new Date();
      const due = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      updated.dueDate = due.toISOString().slice(0, 16);
    }
    setForm(updated);
  };

  const submit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/borrows/borrow', { ...form, dueDate: new Date(form.dueDate).toISOString() });
      onSuccess();
    } catch (e: any) {
      alert(e.response?.data?.message || t('borrowFailed'));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="userId" placeholder={t('userId')} required value={form.userId} onChange={handle} className="w-full border p-2 rounded" />
      <input name="username" placeholder={t('username')} required value={form.username} onChange={handle} className="w-full border p-2 rounded" />
      <input name="bookId" placeholder={t('bookId')} required value={form.bookId} onChange={handle} className="w-full border p-2 rounded" />
      <input name="bookName" placeholder={t('bookName')} required value={form.bookName} onChange={handle} className="w-full border p-2 rounded" />
      <input type="datetime-local" name="dueDate" required value={form.dueDate} onChange={handle} min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)} className="w-full border p-2 rounded" />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">{t('borrowBook')}</button>
    </form>
  );
}

function ReturnForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ userId: '', bookId: '' });
  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await api.post('/borrows/return', form);
      alert(`${t('returned')}! Fine: ETB ${res.data.fine}`);
      onSuccess();
    } catch (e: any) {
      alert(e.response?.data?.message || t('returnFailed'));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="userId" placeholder={t('userId')} required value={form.userId} onChange={handle} className="w-full border p-2 rounded" />
      <input name="bookId" placeholder={t('bookId')} required value={form.bookId} onChange={handle} className="w-full border p-2 rounded" />
      <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded">{t('returnBook')}</button>
    </form>
  );
}

function ViewBorrowForm({ form, setForm, onSubmit }: any) {
  const { t } = useTranslation();
  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <input name="userId" placeholder={t('userId')} required value={form.userId} onChange={handle} className="w-full border p-2 rounded" />
      <input name="username" placeholder={t('username')} required value={form.username} onChange={handle} className="w-full border p-2 rounded" />
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">{t('viewMyBorrow')}</button>
    </form>
  );
}

function PayFineForm({ fine, borrowId, onSuccess, onClose }: { fine: number; borrowId: string; onSuccess: () => void; onClose: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showTelebirr, setShowTelebirr] = useState(false);
  const [mobile, setMobile] = useState('');

  const getUser = () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error(t('pleaseLoginAgain'));
    const user = JSON.parse(userData);
    const userId = user.id || user.userId || '';
    const username = user.username || user.name || '';
    if (!userId || !username) throw new Error(t('userInfoMissing'));
    return { userId, username };
  };

  const handleChapa = async () => {
    setLoading(true);
    try {
      const { userId, username } = getUser();
      const res = await api.post('/payments/init', { userId, username, amount: fine, borrowId });
      window.open(res.data.checkout_url, '_blank');
      onSuccess();
    } catch (err: any) {
      alert(err.message || err.response?.data?.message || t('chapaFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleTelebirr = async () => {
    if (!mobile.match(/^09\d{8}$/)) {
      alert(t('enterValidMobile'));
      return;
    }
    setLoading(true);
    try {
      const { userId, username } = getUser();
      await api.post('/payments/init-telebirr', { userId, username, amount: fine, borrowId, mobile });
      alert(`ETB ${fine} ${t('paidViaTelebirr')}!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message || err.response?.data?.message || t('telebirrFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">{t('payFine')}</h3>
      <p className="text-2xl font-bold text-red-600">ETB {fine}</p>

      {!showTelebirr ? (
        <div className="flex gap-2">
          <button onClick={handleChapa} disabled={loading} className="flex-1 bg-green-600 text-white py-2 rounded disabled:opacity-70">
            {loading ? t('initializing') : t('payWithChapa')}
          </button>
          <button onClick={() => setShowTelebirr(true)} className="flex-1 bg-blue-600 text-white py-2 rounded">
            {t('payWithTelebirr')}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded">{t('cancel')}</button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-medium">{t('enterMobileNumber')}</p>
          <input type="tel" placeholder="0912345678" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full border p-2 rounded" maxLength={10} />
          <div className="flex gap-2">
            <button onClick={handleTelebirr} disabled={loading || !mobile} className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-70">
              {loading ? t('processing') : t('payNow')}
            </button>
            <button onClick={() => { setShowTelebirr(false); setMobile(''); }} className="flex-1 bg-gray-300 py-2 rounded">
              {t('back')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherBooks() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<any[]>([]);
  const [myBorrow, setMyBorrow] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [viewForm, setViewForm] = useState({ userId: '', username: '' });
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

  const handleView = async () => {
    try {
      const res = await api.post('/borrows/my', viewForm);
      setMyBorrow(res.data.borrow);
      setShowView(false);
      showToast(t('borrowRecordLoaded'), 'success');
    } catch (e: any) {
      showToast(e.response?.data?.message || t('noBorrowFound'), 'error');
    }
  };

  const closeAll = () => {
    setShowAdd(false);
    setShowBorrow(false);
    setShowReturn(false);
    setShowView(false);
    setShowPay(false);
  };

  return (
    <Layout role="teacher">
      <div className="space-y-6 p-4">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('teacherLibrary')}</h1>
              <p className="text-gray-600">{t('addBorrowReturnView')}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                <FiPlus /> {t('addBook')}
              </button>
              <button onClick={() => setShowBorrow(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FiBookOpen /> {t('borrow')}
              </button>
              {myBorrow && (
                <button onClick={() => setShowReturn(true)} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                  <FiRotateCcw /> {t('return')}
                </button>
              )}
              {myBorrow?.fine > 0 && (
                <button onClick={() => setShowPay(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  <FiDollarSign /> {t('payFine')}
                </button>
              )}
              <button onClick={() => setShowView(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <FiEye /> {t('viewBorrow')}
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

        {myBorrow && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="font-semibold text-gray-800">{t('yourBorrowedBook')}</p>
            <p className="text-lg font-medium">{myBorrow.bookTitle}</p>
            <p className="text-sm text-gray-600">
              {t('due')}: {new Date(myBorrow.dueDate).toLocaleString()}
            </p>
            {myBorrow.fine > 0 && (
              <p className="text-red-600 font-bold">{t('fine')}: ETB {myBorrow.fine}</p>
            )}
          </div>
        )}

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
          <Modal onClose={closeAll}>
            <h2 className="text-xl font-bold mb-4">{t('addNewBook')}</h2>
            <AddBookForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} />
          </Modal>
        )}
        {showBorrow && (
          <Modal onClose={closeAll}>
            <h2 className="text-xl font-bold mb-4">{t('borrowABook')}</h2>
            <BorrowForm onSuccess={() => { closeAll(); showToast(t('borrowed'), 'success'); }} />
          </Modal>
        )}
        {showReturn && (
          <Modal onClose={closeAll}>
            <h2 className="text-xl font-bold mb-4">{t('returnBook')}</h2>
            <ReturnForm onSuccess={() => { closeAll(); setMyBorrow(null); showToast(t('returned'), 'success'); }} />
          </Modal>
        )}
        {showView && (
          <Modal onClose={closeAll}>
            <h2 className="text-xl font-bold mb-4">{t('viewYourBorrow')}</h2>
            <ViewBorrowForm form={viewForm} setForm={setViewForm} onSubmit={handleView} />
          </Modal>
        )}
        {showPay && myBorrow && (
          <Modal onClose={closeAll}>
            <PayFineForm fine={myBorrow.fine} borrowId={myBorrow._id} onSuccess={() => { closeAll(); setMyBorrow({ ...myBorrow, fine: 0 }); showToast(t('finePaid'), 'success'); }} onClose={closeAll} />
          </Modal>
        )}
        {toast && <Toast toast={toast} />}
      </AnimatePresence>
    </Layout>
  );
}