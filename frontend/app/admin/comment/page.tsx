import Layout from '@/components/Layout'

export default function AdminComment() {
  return (
    <Layout role="admin">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Comment</h1>
        <p className="text-gray-600">Add, edit, or remove users from the system.</p>
      </div>
    </Layout>
  )
}