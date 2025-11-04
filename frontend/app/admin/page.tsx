import Layout from '@/components/Layout'

export default function AdminDashboard() {
  return (
    <Layout role="admin">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome! Manage users, reports, and system settings.</p>
      </div>
    </Layout>
  )
}