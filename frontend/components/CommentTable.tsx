// components/CommentTable.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { FiSearch } from 'react-icons/fi';

export default function CommentTable() {
  const [comments, setComments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetch = async () => {
    const r = await api.get('/comments', { params: { page, limit, search } });
    setComments(r.data.comments);
    setTotal(r.data.total);
  };

  useEffect(() => { fetch(); }, [page, search]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <FiSearch className="mt-2 text-gray-500" />
          <input
            placeholder="Search comments..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] table-auto">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">User</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Comment</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {comments.map(c => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.id}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{c.username}</p>
                    <p className="text-xs text-gray-500">{c.userId}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    c.role === 'student' ? 'bg-blue-100 text-blue-800' :
                    c.role === 'teacher' ? 'bg-green-100 text-green-800' :
                    c.role === 'librarian' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {c.role}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-gray-700 truncate">{c.comment}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(c.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
        <p className="text-gray-600">{total} total</p>
        <div className="flex gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p-1))}
            disabled={page===1}
            className="px-3 py-1.5 border rounded disabled:opacity-50 text-sm"
          >
            Prev
          </button>
          <span className="px-3 py-1.5">Page {page}</span>
          <button
            onClick={() => setPage(p => p+1)}
            disabled={comments.length < limit}
            className="px-3 py-1.5 border rounded disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}