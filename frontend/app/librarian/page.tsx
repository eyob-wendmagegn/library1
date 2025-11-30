// app/librarian/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n'; // ← ADDED
import {
  FiBook,
  FiBookOpen,
  FiRotateCcw,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion, Variants } from 'framer-motion';

interface LibrarianData {
  totals: {
    books: number;
    borrowed: number;
    returned: number;
    paid: number;
  };
  pie: {
    borrowed: number;
    available: number;
  };
  returns: {
    labels: string[];
    data: number[];
  };
  added: {
    labels: string[];
    data: number[];
  };
  borrowedTrend: {
    labels: string[];
    data: number[];
  };
  recentActivity: Array<{
    action: string;
    user: string;
    book: string;
    date: string;
    fine?: number;
  }>;
}

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function LibrarianDashboard() {
  const { t } = useTranslation(); // ← ADDED
  const [data, setData] = useState<LibrarianData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.librarian);
      } catch (err) {
        console.error('Librarian dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout role="librarian">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const { totals, pie, returns, added, borrowedTrend, recentActivity } = data;

  const StatCard = ({ icon: Icon, label, value, bg, color }: any) => (
    <motion.div
      variants={item}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{t(label)}</p>
        <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
    </motion.div>
  );

  const pieData = [
    { name: t('borrowed'), value: pie.borrowed, color: '#3b82f6' },
    { name: t('available'), value: pie.available, color: '#10b981' },
  ];

  return (
    <Layout role="librarian">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={item}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h1 className="text-3xl font-bold text-gray-800">{t('librarianDashboard')}</h1>
          <p className="text-gray-600 mt-1">{t('monitorLibraryFlow')}</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiBook}
            label="totalBooks"
            value={totals.books}
            bg="bg-blue-100"
            color="text-blue-600"
          />
          <StatCard
            icon={FiBookOpen}
            label="borrowedBooks"
            value={totals.borrowed}
            bg="bg-orange-100"
            color="text-orange-600"
          />
          <StatCard
            icon={FiRotateCcw}
            label="returnedBooks"
            value={totals.returned}
            bg="bg-green-100"
            color="text-green-600"
          />
          <StatCard
            icon={FiDollarSign}
            label="totalPaid"
            value={totals.paid}
            bg="bg-purple-100"
            color="text-purple-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Book Status Pie */}
          <motion.div
            variants={item}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('bookStatus')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Book Returns */}
          <motion.div
            variants={item}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('bookReturns')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={returns.labels.map((l, i) => ({
                  day: l,
                  returns: returns.data[i],
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="returns"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Books Added */}
          <motion.div
            variants={item}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('booksAdded')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={added.labels.map((l, i) => ({
                  day: l,
                  added: added.data[i],
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="added" fill="#34d399" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Borrowed Trend */}
          <motion.div
            variants={item}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('borrowedBooks')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={borrowedTrend.labels.map((l, i) => ({
                  week: l,
                  borrowed: borrowedTrend.data[i],
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="borrowed"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          variants={item}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('recentActivity')}</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((act, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FiActivity
                      className={`w-5 h-5 ${
                        act.action === 'Borrowed' ? 'text-orange-600' : 'text-green-600'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-800">{act.user}</p>
                      <p className="text-sm text-gray-600">
                        {t(act.action)} "{act.book}"
                        {act.fine != null && act.fine > 0 && (
                          <span className="text-red-600 ml-1 font-medium">
                            ({t('fine')}: ETB {act.fine})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{act.date}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                {t('noRecentActivity')}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}