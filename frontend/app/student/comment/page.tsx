'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import CommentForm from '@/components/CommentForm';
import { FiMessageSquare } from 'react-icons/fi';
import { useTranslation } from '@/lib/i18n'; // ← ADDED

export default function StudentComment() {
  const { t } = useTranslation(); // ← ADDED
  const [open, setOpen] = useState(false);

  return (
    <Layout role="student">
      <div className="p-6 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <FiMessageSquare className="mx-auto text-6xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('giveFeedback') || 'Give Feedback'}</h1>
          <p className="text-gray-600 mb-6">{t('shareThoughts') || 'Share your thoughts with the admin'}</p>
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <FiMessageSquare /> {t('giveComment') || 'Give Comment'}
          </button>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">{t('sendToAdmin') || 'Send to Admin'}</h2>
              <CommentForm onClose={() => setOpen(false)} />
              <button
                onClick={() => setOpen(false)}
                className="mt-4 w-full border py-2 rounded text-red-600 hover:bg-red-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}