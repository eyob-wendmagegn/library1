import Layout from '@/components/Layout'

export default function StudentNews() {
  return (
    <Layout role="librarian">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">student news</h1>
        <p className="text-gray-600">View, search, and manage all books.</p>
      </div>
    </Layout>
  )
}