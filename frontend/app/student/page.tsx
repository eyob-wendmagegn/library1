'use client';

import Layout from '@/components/Layout';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n'; // ← ADDED
import { useEffect, useState } from 'react';
import { FiBookOpen, FiCheck, FiClock, FiEye, FiRotateCcw, FiXCircle } from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Borrow {
  bookTitle: string;
  borrowedAt: string;
  returnedAt?: string;
  fine: number;
  status: string;
}

interface Request {
  _id: string;
  bookTitle: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  dueDate?: string;
}

interface CurrentBook {
  bookId: string;
  bookTitle: string;
  dueDate: string;
  borrowedAt: string;
  fine: number;
}

interface StudentStats {
  totalBorrowed: number;
  totalViews: number;
  booksToReturn: number;
  currentBooks: CurrentBook[];
  history: Borrow[];
  readingProgress: number;
  requests: Request[];
}

/** Native date formatter – no external deps */
const formatDate = (dateStr: string, fmt: 'MMM dd') => {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (fmt === 'MMM dd') return `${months[d.getMonth()]} ${d.getDate()}`;
  return d.toLocaleDateString();
};

export default function StudentDashboard() {
  const { t } = useTranslation(); // ← ADDED
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.student);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const user = JSON.parse(userData);
        const res = await api.get('/borrows', {
          params: {
            search: user.id || user.userId,
            limit: 50
          }
        });

        // Filter requests for this user
        const userRequests = res.data.borrows.filter((borrow: any) =>
          borrow.userId === (user.id || user.userId) &&
          ['pending', 'approved', 'rejected'].includes(borrow.status)
        );

        setRequests(userRequests);
      } catch (e: any) {
        console.error('Failed to fetch requests:', e);
      }
    };

    fetchStats();
    fetchRequests();
  }, []);

  const returnBook = async (bookId: string) => {
    if (!confirm(t('returnBookConfirm') || 'Return this book?')) return;
    try {
      await api.post('/borrows/return', { bookId });
      window.location.reload();
    } catch {
      alert(t('returnFailed') || 'Failed to return book');
    }
  };

  if (loading)
    return (
      <Layout role="student">
        <div className="p-6 text-center">{t('loading') || 'Loading...'}</div>
      </Layout>
    );

  if (error)
    return (
      <Layout role="student">
        <div className="p-6 text-red-500">{error}</div>
      </Layout>
    );

  if (!stats) return null;

  const historyChart = stats.history.map(h => ({
    name: formatDate(h.borrowedAt, 'MMM dd'),
    books: 1,
  }));

  return (
    <Layout role="student">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t('studentDashboard') || 'Student Dashboard'}
        </h1>

        {/* ==== STAT CARDS ==== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total Borrowed */}
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiBookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('totalBorrowedBooks') || 'Total Borrowed Books'}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalBorrowed}</p>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiEye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('totalViews') || 'Total Views'}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
            </div>
          </div>

          {/* Books to Return */}
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiRotateCcw className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('booksToReturn') || 'Books to Return'}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.booksToReturn}</p>
            </div>
          </div>

          {/* Reading Progress */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-600 mb-2">{t('readingProgress') || 'Reading Progress'}</p>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs font-semibold text-green-600">{t('completed') || 'Completed'}</span>
                <span className="text-xs font-semibold text-green-600">{stats.readingProgress}%</span>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${stats.readingProgress}%` }}
                  className="bg-green-500 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==== CURRENTLY BORROWED ==== */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('currentlyBorrowedBooks') || 'Currently Borrowed Books'}
          </h2>

          {stats.currentBooks.length === 0 ? (
            <p className="text-gray-500">{t('noActiveBorrows') || 'No active borrows.'}</p>
          ) : (
            <div className="space-y-3">
              {stats.currentBooks.map(book => {
                const isOverdue = new Date(book.dueDate) < new Date();
                return (
                  <div
                    key={book.bookId}
                    className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{book.bookTitle}</h3>
                      <p className="text-sm text-gray-500">
                        {t('due') || 'Due'}: {book.dueDate}
                        {isOverdue && (
                          <span className="ml-2 text-red-600 font-medium">({t('overdue') || 'Overdue'})</span>
                        )}
                      </p>
                      {book.fine > 0 && (
                        <p className="text-sm text-red-600">{t('fine') || 'Fine'}: {book.fine} ETB</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${isOverdue
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {isOverdue ? t('dueSoon') || 'Due Soon' : t('active') || 'Active'}
                      </span>

                      <button
                        onClick={() => returnBook(book.bookId)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                      >
                        {t('return') || 'Return'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ==== BOOK REQUESTS ==== */}
        {requests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('myRequests') || 'My Requests'}
            </h2>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{request.bookTitle}</h3>
                    <p className="text-sm text-gray-500">
                      {t('requested') || 'Requested'}: {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                    {request.dueDate && (
                      <p className="text-sm text-gray-500">
                        {t('due') || 'Due'}: {new Date(request.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {request.rejectionReason && (
                      <p className="text-sm text-red-600">
                        {t('reason') || 'Reason'}: {request.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <>
                        <FiClock className="w-4 h-4 text-yellow-500" />
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {t('pending') || 'Pending'}
                        </span>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <>
                        <FiCheck className="w-4 h-4 text-green-500" />
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('approved') || 'Approved'}
                        </span>
                      </>
                    )}
                    {request.status === 'rejected' && (
                      <>
                        <FiXCircle className="w-4 h-4 text-red-500" />
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t('rejected') || 'Rejected'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==== HISTORY CHART ==== */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('borrowingHistory') || 'Borrowing History'}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="books" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}