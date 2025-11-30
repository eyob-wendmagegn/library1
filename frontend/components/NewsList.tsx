// components/NewsList.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { FiSearch } from 'react-icons/fi';

export default function NewsList({ role, userId }: { role: string; userId: string }) {
  const [news, setNews] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetch = async () => {
    try {
      const r = await api.get('/news', { 
        params: { role, page, limit, search } 
      });
      setNews(r.data.news);
      setTotal(r.data.total);
    } catch (err) {
      console.error('Failed to fetch news');
    }
  };

  useEffect(() => {
    fetch();
    // Mark all news as read when viewing
    api.post('/news/read', { userId }).catch(() => {});
  }, [page, search, role, userId]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <FiSearch className="mt-2 text-gray-500" />
          <input
            placeholder="Search news..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {news.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No news available</p>
        ) : (
          news.map(n => (
            <div key={n.id} className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-700">{n.news}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {total > limit && (
        <div className="p-4 flex justify-between text-sm">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <span>Page {page}</span>
          <button onClick={() => setPage(p => p+1)} disabled={news.length < limit} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}