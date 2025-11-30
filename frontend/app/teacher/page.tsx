// app/teacher/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { FiBook, FiBookOpen, FiRotateCw, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/lib/i18n';

interface TeacherData {
  totals: { addedBooks: number; borrowedBooks: number; returnedBooks: number };
  charts: { booksAdded: any; borrowedTrend: any };
  recentActivity: Array<{ action: string; book: string; date: string }>;
}

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.teacher);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout role="teacher">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const { totals, charts, recentActivity } = data;

  const safeValue = (val: number | undefined) => (val ?? 0).toLocaleString();

  const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${bg} mb-3`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{safeValue(value)}</p>
    </div>
  );

  return (
    <Layout role="teacher">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h1 className="text-3xl font-bold text-gray-800">{t('teacherDashboard')}</h1>
          <p className="text-gray-600 mt-1">{t('trackBooksBorrowsReturns')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={FiBook} label={t('booksAdded')} value={totals.addedBooks} bg="bg-green-100" color="text-green-600" />
          <StatCard icon={FiBookOpen} label={t('borrowedBooks')} value={totals.borrowedBooks} bg="bg-orange-100" color="text-orange-600" />
          <StatCard icon={FiRotateCw} label={t('returnedBooks')} value={totals.returnedBooks} bg="bg-blue-100" color="text-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('booksAddedLast7Days')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.booksAdded.labels.map((l: string, i: number) => ({ day: l, added: charts.booksAdded.data[i] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="added" fill="#34d399" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('borrowedBooksLast4Weeks')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={charts.borrowedTrend.labels.map((l: string, i: number) => ({ week: l, borrowed: charts.borrowedTrend.data[i] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="borrowed" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('recentActivity')}</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiActivity className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {act.action} "{act.book}"
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{act.date}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4">{t('noActivityYet')}</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}