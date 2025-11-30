// app/admin/post/page.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import NewsForm from '@/components/NewsForm';
import { FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n'; // ← ADDED

export default function AdminPost() {
  const { t } = useTranslation(); // ← ADDED
  const [showForm, setShowForm] = useState(false);

  return (
    <Layout role="admin">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-4 md:p-6 max-w-4xl mx-auto space-y-6"
      >
        <motion.div
          initial={{ y: -40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{t('postNews')}</h1> {/* ← TRANSLATED */}
              <p className="text-gray-600">{t('announceUpdates')}</p> {/* ← TRANSLATED */}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-xl transition-all font-medium"
            >
              <FiPlus size={18} />
              {t('postNew')} {/* ← TRANSLATED */}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.85, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.85, y: 50, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 350, 
                  damping: 30 
                }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl" />

                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">{t('createNewsPost')}</h2> {/* ← TRANSLATED */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    <FiX size={22} />
                  </motion.button>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.1,
                      },
                    },
                  }}
                >
                  <NewsForm onClose={() => setShowForm(false)} />
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#fee2e2' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(false)}
                  className="mt-5 w-full border border-red-200 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-all"
                >
                  {t('cancel')} {/* ← TRANSLATED */}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}