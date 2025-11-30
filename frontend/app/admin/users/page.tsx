// app/admin/users/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n'; // ← ADDED

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  department?: string;
  status: 'active' | 'deactive';
}

export default function AdminUsers() {
  const { t } = useTranslation(); // ← ADDED
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg: t(msg), type }); // ← TRANSLATED
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: { page, limit, search, role: roleFilter },
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (e: any) {
      console.error(e);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const totalPages = Math.ceil(total / limit);

  const handleCreate = async (data: any) => {
    try {
      await api.post('/users', data);
      setShowModal(false);
      fetchUsers();
      showToast('userCreated');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'userCreateFailed', 'error');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await api.put(`/users/${id}`, data);
      setEditingUser(null);
      setShowModal(false);
      fetchUsers();
      showToast('userUpdated');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'userUpdateFailed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteUserConfirm'))) return; // ← TRANSLATED
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      showToast('userDeleted');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'userDeleteFailed', 'error');
    }
  };

  const toggleStatus = useCallback((user: User) => {
    if (user.role === 'admin') return;

    const newStatus = user.status === 'active' ? 'deactive' : 'active';

    setUsers(prev => {
      const updated = [...prev];
      const index = updated.findIndex(u => u.id === user.id);
      if (index !== -1) {
        updated[index] = { ...updated[index], status: newStatus };
      }
      return updated;
    });

    api.put(`/users/${user.id}`, { status: newStatus }).catch(() => {
      setUsers(prev => {
        const updated = [...prev];
        const index = updated.findIndex(u => u.id === user.id);
        if (index !== -1) {
          updated[index] = { ...updated[index], status: user.status };
        }
        return updated;
      });
    });
  }, []);

  const UserFormModal = () => {
    const isEdit = !!editingUser;
    const [form, setForm] = useState({
      id: editingUser?.id ?? '',
      name: editingUser?.name ?? '',
      username: editingUser?.username ?? '',
      role: editingUser?.role ?? 'student',
      department: editingUser?.department ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { ...form };
      if (isEdit) {
        handleUpdate(editingUser.id, payload);
      } else {
        handleCreate(payload);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowModal(false)}
      >
        <motion.div
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-gray-800">
              {isEdit ? t('editUser') : t('addNewUser')} {/* ← TRANSLATED */}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <FiX size={22} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.input
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              required
              placeholder={t('id')}
              value={form.id}
              disabled={isEdit}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border rounded-lg font-mono disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            <motion.input
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              required
              placeholder={t('fullName')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            <motion.input
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              required
              placeholder={t('username')}
              disabled={isEdit}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            <motion.select
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="student">{t('student')}</option>
              <option value="teacher">{t('teacher')}</option>
              <option value="librarian">{t('librarian')}</option>
              <option value="admin">{t('admin')}</option>
            </motion.select>

            <motion.input
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              placeholder={t('departmentOptional')}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            <div className="flex gap-3 pt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 text-sm rounded-lg font-medium shadow-md hover:shadow-lg transition"
              >
                {isEdit ? t('update') : t('create')} {/* ← TRANSLATED */}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 text-sm rounded-lg hover:bg-gray-300 transition"
              >
                {t('cancel')} {/* ← TRANSLATED */}
              </motion.button>
            </div>
          </form>

          {!isEdit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-xs"
            >
              <p className="font-medium text-green-800">
                {t('defaultPassword')}: <strong>temp123</strong>
              </p>
              <p className="text-green-700">{t('changeOnFirstLogin')}</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <Layout role="admin">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-4 md:p-6 max-w-6xl mx-auto"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-white text-sm font-medium backdrop-blur-md ${
                  toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
                }`}
              >
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center mb-6"
          >
            <h1 className="text-3xl font-bold text-gray-800">{t('manageUsers')}</h1> {/* ← TRANSLATED */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingUser(null);
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:shadow-lg transition-shadow"
            >
              <FiPlus size={18} /> {t('addUser')} {/* ← TRANSLATED */}
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 mb-6"
          >
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder={t('searchUsers')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">{t('allRoles')}</option>
              <option value="admin">{t('admin')}</option>
              <option value="librarian">{t('librarian')}</option>
              <option value="teacher">{t('teacher')}</option>
              <option value="student">{t('student')}</option>
            </select>
          </motion.div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('id')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('name')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('username')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('role')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('status')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="inline-block"
                      >
                        {t('loading')}...
                      </motion.div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">
                      {t('noUsersFound')}
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-t hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition"
                    >
                      <td className="px-4 py-3 font-mono text-gray-600 text-xs">{u.id}</td>
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.username}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'librarian'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'teacher'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {t(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="h-2 w-2 bg-green-500 rounded-full"
                            />
                            {t('active')}
                          </span>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleStatus(u)}
                            className="w-11 h-6 rounded-full p-0.5 cursor-pointer focus:outline-none shadow-inner"
                            style={{
                              backgroundColor: u.status === 'active' ? '#10b981' : '#e5e7eb',
                            }}
                          >
                            <motion.div
                              layout
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className={`w-5 h-5 rounded-full bg-white shadow-md ${
                                u.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </motion.button>
                        )}
                      </td>
                      <td className="px-4 py-3 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.2, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingUser(u);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={t('edit')}
                        >
                          <FiEdit2 size={16} />
                        </motion.button>
                        {u.role !== 'admin' && (
                          <motion.button
                            whileHover={{ scale: 1.2, rotate: -90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(u.id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label={t('delete')}
                          >
                            <FiTrash2 size={16} />
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between items-center mt-6 text-sm"
            >
              <p className="text-gray-600">
                {t('showing')} {(page - 1) * limit + 1}–{Math.min(page * limit, total)} {t('of')} {total}
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-xl text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  {t('prev')}
                </motion.button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + Math.max(1, page - 2);
                  if (p > totalPages) return null;
                  return (
                    <motion.button
                      key={p}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 border rounded-xl text-sm transition ${
                        page === p
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </motion.button>
                  );
                }).filter(Boolean)}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-xl text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  {t('next')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">{showModal && <UserFormModal />}</AnimatePresence>
    </Layout>
  );
}