// components/CommentForm.tsx
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { FiSend } from 'react-icons/fi';

export default function CommentForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ userId: '', username: '', comment: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: any) => {
    e.preventDefault();
    if (!form.userId || !form.username || !form.comment) return alert('All fields required');

    setLoading(true);
    try {
      await api.post('/comments', form); // ← NO ROLE
      alert('Comment sent to admin');
      setForm({ userId: '', username: '', comment: '' });
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input name="userId" placeholder="Your ID (e.g. 000003)" required value={form.userId} onChange={handle} className="w-full border rounded p-2" />
      <input name="username" placeholder="Your Name" required value={form.username} onChange={handle} className="w-full border rounded p-2" />
      <textarea name="comment" placeholder="Write your comment..." required rows={4} value={form.comment} onChange={handle} className="w-full border rounded p-2" />
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 disabled:opacity-70">
        <FiSend /> {loading ? 'Sending...' : 'Send Comment'}
      </button>
    </form>
  );
}