'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Save, RefreshCw } from 'lucide-react';

const apiBase = '/api/v1';

interface Policy {
  type: string;
  content: string;
  is_active: boolean;
}

const policyLabels: Record<string, string> = {
  refund: 'سياسة الاسترداد والاستبدال',
  exchange: 'سياسة الاستبدال',
  shipping: 'سياسة الشحن والتوصيل',
};

const policyDefaults: Record<string, string> = {
  refund: 'يحق للعميل استرداد المنتج خلال 14 يوماً من تاريخ الاستلام وفقاً للائحة التنفيذية لقانون حماية المستهلك رقم 181 لسنة 2018. يجب أن يكون المنتج في حالته الأصلية مع العبوة.',
  exchange: 'يمكن استبدال المنتج خلال 14 يوماً من تاريخ الاستلام بمنتج آخر من نفس المتجر.',
  shipping: 'تختلف تكلفة الشحن حسب المنطقة الجغرافية. يتم التوصيل خلال 1-3 أيام عمل داخل المدينة و3-7 أيام للمحافظات.',
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Record<string, string>>({
    refund: policyDefaults.refund,
    exchange: policyDefaults.exchange,
    shipping: policyDefaults.shipping,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    try {
      const token = localStorage.getItem('ray_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/shops/me/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const loaded: Record<string, string> = {};
        (data.data || []).forEach((p: Policy) => { loaded[p.type] = p.content; });
        setPolicies((prev) => ({ ...prev, ...loaded }));
      }
    } catch {}
  }

  async function savePolicy(type: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem('ray_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/shops/me/policies/${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: policies[type] }),
      });
      if (res.ok) {
        setToast('تم حفظ السياسة بنجاح');
      }
    } catch {}
    setLoading(false);
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div className="max-w-3xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-7 h-7" /> سياسات المتجر
      </h1>

      <p className="text-gray-600 mb-6 text-sm">
        حدد سياسات متجرك بوضوح. سياسة الاسترداد إلزامية وفقاً لقانون حماية المستهلك (14 يوماً حق استرداد).
      </p>

      <div className="space-y-6">
        {Object.entries(policyLabels).map(([type, label]) => (
          <div key={type} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{label}</h3>
              <button
                onClick={() => savePolicy(type)}
                disabled={loading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Save className="w-4 h-4" /> حفظ
              </button>
            </div>
            <textarea
              value={policies[type] || ''}
              onChange={(e) => setPolicies((prev) => ({ ...prev, [type]: e.target.value }))}
              rows={4}
              className="w-full border rounded-lg p-3 text-sm resize-y"
              dir="rtl"
            />
            {type === 'refund' && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ تأكد من ذكر حق الاسترداد خلال 14 يوماً وفقاً لقانون 181/2018 ولائحته التنفيذية
              </p>
            )}
          </div>
        ))}
      </div>

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>}
    </div>
  );
}
