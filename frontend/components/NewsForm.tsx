// components/NewsForm.tsx
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { FiSend } from 'react-icons/fi';

export default function NewsForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ role: 'all', news: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: any) => {
    e.preventDefault();
    if (!form.news.trim()) return alert('News required');
    setLoading(true);
    try {
      await api.post('/news', form);
      alert('News posted!');
      setForm({ role: 'all', news: '' });
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Target Audience</label>
        <select name="role" value={form.role} onChange={handle} className="w-full border rounded p-2">
          <option value="all">All Users</option>
          <option value="librarian">Librarians</option>
          <option value="teacher">Teachers</option>
          <option value="student">Students</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">News Message</label>
        <textarea
          name="news"
          placeholder="Write your announcement..."
          required
          minLength={5}
          rows={4}
          value={form.news}
          onChange={handle}
          className="w-full border rounded p-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 disabled:opacity-70"
      >
        <FiSend /> {loading ? 'Posting...' : 'Post News'}
      </button>
    </form>
  );
}