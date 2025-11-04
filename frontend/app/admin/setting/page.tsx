import Layout from '@/components/Layout'

export default function AdminSetting() {
  return (
    <Layout role="admin">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Settings</h1>
        <p className="text-gray-600">Manage system preferences, users, and security.</p>
      </div>
    </Layout>
  )
}