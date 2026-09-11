'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Download, Trash2, AlertTriangle, FileText, Send } from 'lucide-react';

const apiBase = '/api/v1';

interface DSRRequest {
  id: string;
  request_type: string;
  status: string;
  created_at: string;
}

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<DSRRequest[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const token = localStorage.getItem('ray_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/dsr/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || []);
      }
    } catch {}
  }

  async function submitDSR(type: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem('ray_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/dsr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ request_type: type }),
      });
      if (res.ok) {
        setToast('تم تقديم الطلب بنجاح');
        fetchRequests();
      } else {
        setToast('حدث خطأ، حاول مرة أخرى');
      }
    } catch {
      setToast('حدث خطأ في الاتصال');
    }
    setLoading(false);
    setTimeout(() => setToast(''), 3000);
  }

  const dsrActions = [
    { type: 'access', label: 'طلب نسخة من بياناتي', icon: Download, desc: 'الحصول على جميع البيانات الشخصية المخزنة' },
    { type: 'correction', label: 'تصحيح بياناتي', icon: FileText, desc: 'طلب تصحيح بيانات غير دقيقة' },
    { type: 'objection', label: 'الاعتراض على المعالجة', icon: AlertTriangle, desc: 'الاعتراض على معالجة البيانات لأغراض التسويق' },
    { type: 'portability', label: 'تصدير بياناتي', icon: Send, desc: 'استلام بياناتي في صيغة قابلة للنقل' },
  ];

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    completed: 'مكتمل',
    rejected: 'مرفوض',
  };

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Shield className="w-7 h-7" /> إعدادات الخصوصية
      </h1>

      <p className="text-gray-600 mb-6">
        وفقاً لقانون حماية البيانات الشخصية رقم 151 لسنة 2020، يحق لك ممارسة الحقوق التالية على بياناتك الشخصية.
      </p>

      <div className="space-y-3 mb-8">
        {dsrActions.map((action) => (
          <button
            key={action.type}
            onClick={() => submitDSR(action.type)}
            disabled={loading}
            className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition disabled:opacity-50"
          >
            <action.icon className="w-5 h-5 text-blue-600" />
            <div className="text-right">
              <div className="font-medium">{action.label}</div>
              <div className="text-sm text-gray-500">{action.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Account deletion - requires extra confirmation */}
      <div className="border border-red-200 rounded-lg p-4 mb-8 bg-red-50">
        <h3 className="font-semibold text-red-700 mb-2">حذف الحساب</h3>
        <p className="text-sm text-red-600 mb-3">
          سيتم تقديم طلب حذف جميع بياناتك الشخصية. هذا الإجراء لا يمكن التراجع عنه بعد الموافقة.
        </p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            طلب حذف الحساب
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { submitDSR('deletion'); setConfirmDelete(false); }} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
              تأكيد الحذف
            </button>
            <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">
              إلغاء
            </button>
          </div>
        )}
      </div>

      {/* Previous requests */}
      {requests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">طلباتي السابقة</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                <span>{r.request_type} — {statusLabels[r.status] || r.status}</span>
                <span className="text-gray-400">{new Date(r.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>}
    </div>
  );
}
