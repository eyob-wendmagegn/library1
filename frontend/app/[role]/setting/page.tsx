import Layout from '@/components/Layout'

interface Props {
  params: { role: string }
}

export default function Setting({ params }: Props) {
  return (
    <Layout role={params.role}>
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Settings</h1>
        <p className="text-gray-600">Manage your account preferences.</p>
      </div>
    </Layout>
  )
}