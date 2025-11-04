import Layout from '@/components/Layout'

export default function StudentDashboard() {
  return (
    <Layout role="student">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Student Dashboard</h1>
        <p className="text-gray-600">Browse and search for available books.</p>
      </div>
    </Layout>
  )
}