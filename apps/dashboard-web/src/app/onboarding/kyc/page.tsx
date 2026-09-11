'use client';

import React, { useState } from 'react';
import { CheckCircle, Upload, ArrowLeft, ArrowRight, Building, CreditCard, FileCheck } from 'lucide-react';

const apiBase = '/api/v1';

type Step = 1 | 2 | 3;

export default function KYCOnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    tax_registration_number: '',
    commercial_registry_number: '',
    id_document_url: '',
    bank_name: '',
    bank_account_number: '',
    bank_iban: '',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const token = localStorage.getItem('ray_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/shops/me/kyc`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {}
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center" dir="rtl">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">تم تقديم بيانات التحقق</h2>
        <p className="text-gray-600">
          سيتم مراجعة بياناتك والرد عليك خلال 48 ساعة عمل. ستتلقى إشعاراً عند الموافقة.
        </p>
      </div>
    );
  }

  const steps = [
    { num: 1, icon: Building, label: 'البيانات التجارية' },
    { num: 2, icon: FileCheck, label: 'وثيقة الهوية' },
    { num: 3, icon: CreditCard, label: 'الحساب البنكي' },
  ];

  return (
    <div className="max-w-lg mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">التحقق من هوية التاجر</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s.num}
            </div>
            <span className={`text-sm ${step >= s.num ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Tax + Commercial */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">الرقم الضريبي <span className="text-red-500">*</span></label>
            <input
              value={form.tax_registration_number}
              onChange={(e) => update('tax_registration_number', e.target.value)}
              placeholder="3000000000"
              className="w-full border rounded-lg p-3 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">إلزامي للموافقة على المتجر وفقاً لمصلحة الضرائب المصرية</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم السجل التجاري</label>
            <input
              value={form.commercial_registry_number}
              onChange={(e) => update('commercial_registry_number', e.target.value)}
              placeholder="12345"
              className="w-full border rounded-lg p-3 text-sm"
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!form.tax_registration_number}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            التالي <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: ID document */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">صورة بطاقة الهوية / جواز السفر</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">اضغط لرفع الصورة أو اسحبها هنا</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> السابق
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              التالي <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Bank info */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم البنك</label>
            <input value={form.bank_name} onChange={(e) => update('bank_name', e.target.value)} className="w-full border rounded-lg p-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الحساب</label>
            <input value={form.bank_account_number} onChange={(e) => update('bank_account_number', e.target.value)} className="w-full border rounded-lg p-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IBAN</label>
            <input value={form.bank_iban} onChange={(e) => update('bank_iban', e.target.value)} placeholder="EG..." className="w-full border rounded-lg p-3 text-sm" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> السابق
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> تقديم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
