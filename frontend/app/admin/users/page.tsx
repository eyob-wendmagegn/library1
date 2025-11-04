import Layout from '@/components/Layout'

export default function AdminUsers() {
  return (
    <Layout role="admin">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Manage Users</h1>
        <p className="text-gray-600">Here you can add, edit, or remove users from the system.</p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm">User list will appear here...</p>
        </div>
      </div>
    </Layout>
  )
}