// app/teacher/page.tsx
import Layout from '@/components/Layout'

export default function TeacherDashboard() {
  return (
    <Layout role="teacher">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
        <p className="text-gray-600">View assigned books and resources.</p>
      </div>
    </Layout>
  )
}