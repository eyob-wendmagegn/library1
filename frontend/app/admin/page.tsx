// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { FiUsers, FiBook, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/lib/i18n'; // ← ADDED

interface AdminData {
  totals: {
    users: number;
    activeUsers: number;
    deactiveUsers: number;
    books: number;
    posts: number;
    reports: number;
  };
  charts: {
    userGrowth: { labels: string[]; data: number[] };
    postActivity: { labels: string[]; data: number[] };
  };
  recentUsers: Array<{ name: string; username: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const { t } = useTranslation(); // ← ADDED
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.admin);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const { totals, charts, recentUsers } = data;

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in">
      <div className={`p-3 rounded-lg ${color} animate-pulse-once`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{t(label)}</p> {/* ← TRANSLATED */}
        <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <Layout role="admin">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-5 animate-slide-down">
          <h1 className="text-3xl font-bold text-gray-800">{t('adminDashboard')}</h1> {/* ← TRANSLATED */}
          <p className="text-gray-600 mt-1">{t('welcomeAdmin')}</p> {/* ← TRANSLATED */}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatCard icon={FiUsers} label="totalUsers" value={totals.users} color="bg-blue-600" />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <StatCard icon={FiBook} label="totalBooks" value={totals.books} color="bg-green-600" />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <StatCard icon={FiFileText} label="totalPosts" value={totals.posts} color="bg-purple-600" />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <StatCard icon={FiTrendingUp} label="totalReports" value={totals.reports} color="bg-red-600" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('userGrowth')}</h3> {/* ← TRANSLATED */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={charts.userGrowth.labels.map((l, i) => ({ name: l, users: charts.userGrowth.data[i] }))}
                className="animate-chart-load"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('postsActivity')}</h3> {/* ← TRANSLATED */}
            <ResponsiveContainer width="100%" height={250}>
              <LineChart 
                data={charts.postActivity.labels.map((l, i) => ({ name: l, posts: charts.postActivity.data[i] }))}
                className="animate-chart-load"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="posts" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('recentlyRegisteredUsers')}</h3> {/* ← TRANSLATED */}
          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user, i) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg animate-slide-in-left"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.username}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">{t('noRecentUsers')}</p> 
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulseOnce {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes chartLoad {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.5s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.4s ease-out forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-pulse-once {
          animation: pulseOnce 0.6s ease-out;
        }

        .animate-chart-load {
          animation: chartLoad 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </Layout>
  );
}