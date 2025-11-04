import Layout from '@/components/Layout'

export default function LibrarianDashboard() {
  return (
    <Layout role="librarian">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Librarian Dashboard</h1>
        <p className="text-gray-600">Manage books and library operations.</p>
      </div>
    </Layout>
  )
}