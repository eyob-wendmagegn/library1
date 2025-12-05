// app/librarian/borrow/page.tsx
'use client';

import Layout from '@/components/Layout';
import api, { setAuthToken } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FiBookOpen,
  FiCheckCircle,
  FiRotateCcw,
  FiSearch,
  FiX
} from 'react-icons/fi';

interface Borrow {
  _id: string;
  userId: string;
  username: string;
  bookId: string;
  bookTitle: string;
  dueDate: string;
  returnedAt: string | null;
  fine: number;
  status?: string;
  requestedAt?: string;
  rejectionReason?: string;
}

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
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white flex items-center gap-2 text-sm shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}
    >
      <FiCheckCircle className="w-4 h-4" />
      {toast.message}
    </motion.div>
  );
}

function BorrowForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    userId: '', username: '', bookId: '', bookName: '', dueDate: '',
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'bookId' || name === 'bookName') {
        const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        updated.dueDate = due.toISOString().slice(0, 16);
      }
      return updated;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/borrows/borrow', {
        ...form,
        dueDate: new Date(form.dueDate).toISOString(),
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || t('borrowFailed'));
    }
  };

  return (
    <motion.form onSubmit={submit} className="space-y-3 text-sm">
      {['userId', 'username', 'bookId', 'bookName'].map((f, i) => (
        <motion.div key={f} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <input
            name={f}
            placeholder={t(f.replace(/([A-Z])/g, ' $1').trim())}
            required
            value={form[f as keyof typeof form]}
            onChange={handle}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
      ))}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <input type="datetime-local" name="dueDate" required value={form.dueDate} onChange={handle} className="w-full border p-2 rounded" />
      </motion.div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
        {t('borrowBook')}
      </motion.button>
    </motion.form>
  );
}

function ReturnForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ userId: '', bookId: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/borrows/return', form);
      alert(`${t('returned')}! ${t('fine')}: ETB ${res.data.fine}`);
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || t('returnFailed'));
    }
  };

  return (
    <motion.form onSubmit={submit} className="space-y-3 text-sm">
      {['userId', 'bookId'].map((f, i) => (
        <motion.div key={f} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <input
            name={f}
            placeholder={t(f.replace(/([A-Z])/g, ' $1').trim())}
            required
            value={form[f as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500"
          />
        </motion.div>
      ))}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-orange-600 text-white py-2 rounded">
        {t('returnBook')}
      </motion.button>
    </motion.form>
  );
}

function ApprovalForm({ borrow, onSuccess }: { borrow: Borrow; onSuccess: () => void }) {
  const { t } = useTranslation();
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/borrows/approve', {
        borrowId: borrow._id,
        action,
        reason: action === 'reject' ? reason : undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || t('actionFailed'));
    }
  };

  return (
    <motion.form onSubmit={submit} className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="font-semibold">{borrow.bookTitle}</p>
        <p className="text-sm text-gray-600">{t('requestedBy')}: {borrow.username}</p>
        <p className="text-sm text-gray-600">{t('requested')}: {new Date(borrow.requestedAt || '').toLocaleString()}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('action')}</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="approve"
              checked={action === 'approve'}
              onChange={(e) => setAction(e.target.value as 'approve')}
              className="mr-2"
            />
            <span className="text-green-600">{t('approve')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="reject"
              checked={action === 'reject'}
              onChange={(e) => setAction(e.target.value as 'reject')}
              className="mr-2"
            />
            <span className="text-red-600">{t('reject')}</span>
          </label>
        </div>
      </div>

      {action === 'reject' && (
        <div>
          <label className="block text-sm font-medium mb-2">{t('rejectionReason')}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500"
            rows={3}
            placeholder={t('optionalReason') || 'Optional reason for rejection'}
          />
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className={`w-full py-2 rounded text-white ${action === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}
      >
        {action === 'approve' ? t('approveRequest') : t('rejectRequest')}
      </motion.button>
    </motion.form>
  );
}

export default function LibrarianBorrow() {
  const { t } = useTranslation();
  const [borrowed, setBorrowed] = useState<Borrow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  const [showBorrow, setShowBorrow] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Borrow | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
  }, []);

  const fetchBorrowed = async () => {
    try {
      const params: any = { page, limit, search };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/borrows', { params });
      setBorrowed(res.data.borrows);
      setTotal(res.data.total);
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || t('failedToLoadBorrowed'), type: 'error' });
    }
  };

  useEffect(() => {
    fetchBorrowed();
  }, [page, search, statusFilter]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeAll = () => {
    setShowBorrow(false);
    setShowReturn(false);
    setShowApproval(false);
    setSelectedRequest(null);
  };

  const handleApproval = (borrow: Borrow) => {
    setSelectedRequest(borrow);
    setShowApproval(true);
  };

  return (
    <Layout role="librarian">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t('borrowManagement')}</h1>
          <p className="text-gray-600 mb-6">{t('manageBorrowingAndReturns')}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowBorrow(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <FiBookOpen /> {t('borrow')}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowReturn(true)}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg">
              <FiRotateCcw /> {t('return')}
            </motion.button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <FiSearch className="text-gray-500" />
              <input
                type="text"
                placeholder={t('search') + '...'}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('allStatus') || 'All Status'}</option>
              <option value="pending">{t('pending') || 'Pending'}</option>
              <option value="approved">{t('approved') || 'Approved'}</option>
              <option value="rejected">{t('rejected') || 'Rejected'}</option>
              <option value="borrowed">{t('borrowed') || 'Borrowed'}</option>
              <option value="returned">{t('returned') || 'Returned'}</option>
            </select>
          </div>
        </div>

        {/* Borrowed Books Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 text-sm">
                <tr>
                  <th className="text-left px-4 py-3">{t('userId')}</th>
                  <th className="text-left px-4 py-3">{t('username')}</th>
                  <th className="text-left px-4 py-3">{t('book')}</th>
                  <th className="text-left px-4 py-3">{t('requested') || 'Requested'}</th>
                  <th className="text-left px-4 py-3">{t('due')}</th>
                  <th className="text-left px-4 py-3">{t('status')}</th>
                  <th className="text-left px-4 py-3">{t('fine')}</th>
                  <th className="text-left px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {borrowed.map((b, i) => (
                  <motion.tr key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{b.userId}</td>
                    <td className="px-4 py-3">{b.username}</td>
                    <td className="px-4 py-3">{b.bookTitle}</td>
                    <td className="px-4 py-3">
                      {b.requestedAt ? new Date(b.requestedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        b.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            b.status === 'borrowed' ? 'bg-green-100 text-green-800' :
                              b.returnedAt ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {b.status === 'pending' ? t('pending') :
                          b.status === 'approved' ? t('approved') :
                            b.status === 'rejected' ? t('rejected') :
                              b.status === 'borrowed' ? t('borrowed') :
                                b.returnedAt ? t('returned') : t('active')}
                      </span>
                      {b.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{b.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-red-600">ETB {b.fine}</td>
                    <td className="px-4 py-3">
                      {b.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproval(b)}
                          className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                        >
                          <FiCheckCircle /> {t('review')}
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showBorrow && (
            <Modal onClose={closeAll}>
              <h2 className="text-2xl font-bold mb-4">{t('borrowBook')}</h2>
              <BorrowForm onSuccess={() => { closeAll(); fetchBorrowed(); showToast(t('borrowedSuccess'), 'success'); }} />
            </Modal>
          )}
          {showReturn && (
            <Modal onClose={closeAll}>
              <h2 className="text-2xl font-bold mb-4">{t('returnBook')}</h2>
              <ReturnForm onSuccess={() => { closeAll(); fetchBorrowed(); showToast(t('returnedSuccess'), 'success'); }} />
            </Modal>
          )}
          {showApproval && selectedRequest && (
            <Modal onClose={closeAll}>
              <h2 className="text-2xl font-bold mb-4">{t('reviewRequest')}</h2>
              <ApprovalForm
                borrow={selectedRequest}
                onSuccess={() => {
                  closeAll();
                  fetchBorrowed();
                  showToast(t('requestProcessed') || 'Request processed successfully', 'success');
                }}
              />
            </Modal>
          )}
          {toast && <Toast toast={toast} />}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}
