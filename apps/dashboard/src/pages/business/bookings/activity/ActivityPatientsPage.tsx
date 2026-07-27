/**
 * ═══════════════════════════════════════════
 * activity/ActivityPatientsPage.tsx
 * إدارة ملفات المرضى / العملاء
 * يُستخدم في: عيادات
 * ═══════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, Phone, Mail, Calendar, Loader2, CreditCard, DollarSign, ScanLine, FlaskConical, Pill, AlertTriangle, Stethoscope, ChevronDown, ChevronUp, Image as ImageIcon, X } from 'lucide-react';

const compressImage = (dataUrl: string, maxDim = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
        else { width = Math.round(width * maxDim / height); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};
import type { BookingActivityType } from '../config';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';
import { useImageUpload } from '../shared/useImageUpload';

type Installment = {
  id: string;
  amount: number;
  paidAt?: string;
  note?: string;
};

type Payment = {
  id: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'installment';
  service: string;
  date: string;
  note?: string;
  bookingId?: string;
};

type XRayRecord = {
  id: string;
  url?: string;
  description: string;
  date: string;
};

type LabTest = {
  id: string;
  name: string;
  result?: string;
  date: string;
  fileUrl?: string;
};

type Prescription = {
  id: string;
  medication: string;
  dosage: string;
  duration?: string;
  date: string;
  notes?: string;
};

type Allergy = {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
};

type Patient = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female';
  bloodType?: string;
  caseType?: string;
  notes?: string;
  lastVisit?: string;
  totalVisits: number;
  hasInstallments?: boolean;
  installmentTotal?: number;
  installments?: Installment[];
  payments?: Payment[];
  xRays?: XRayRecord[];
  labTests?: LabTest[];
  prescriptions?: Prescription[];
  allergies?: Allergy[];
};

type Props = { activityType: BookingActivityType };

const ActivityPatientsPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const { upload: uploadImage } = useImageUpload();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', age: '', gender: 'male', bloodType: '', caseType: '', notes: '', hasInstallments: false, installmentTotal: '' });
  const [installmentPatientId, setInstallmentPatientId] = useState<string | null>(null);
  const [installmentForm, setInstallmentForm] = useState({ amount: '', note: '' });
  const [paymentPatientId, setPaymentPatientId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash', service: '', date: new Date().toISOString().slice(0, 10), note: '' });
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [medSection, setMedSection] = useState<'xRays' | 'labTests' | 'prescriptions' | 'allergies' | null>(null);
  const [medForm, setMedForm] = useState<Record<string, string>>({});
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formMedSection, setFormMedSection] = useState<'xRays' | 'labTests' | 'prescriptions' | 'allergies' | null>(null);
  const [formMed, setFormMed] = useState<Record<string, string>>({});
  const [formMedRecords, setFormMedRecords] = useState<{ xRays: XRayRecord[]; labTests: LabTest[]; prescriptions: Prescription[]; allergies: Allergy[] }>({ xRays: [], labTests: [], prescriptions: [], allergies: [] });
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) { setLoading(false); return; }
      const data = await ApiService.getBookingActivityData(shop.id, 'activityPatientsList');
      setPatients(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', age: '', gender: 'male', bloodType: '', caseType: '', notes: '', hasInstallments: false, installmentTotal: '' });
    setFormMedRecords({ xRays: [], labTests: [], prescriptions: [], allergies: [] });
    setFormMedSection(null);
    setFormMed({});
    setEditingPatient(null);
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender as 'male' | 'female',
        bloodType: form.bloodType || undefined,
        caseType: form.caseType || undefined,
        notes: form.notes || undefined,
        totalVisits: 0,
        hasInstallments: form.hasInstallments,
        installmentTotal: form.hasInstallments && form.installmentTotal ? Number(form.installmentTotal) : undefined,
        installments: form.hasInstallments ? [] : undefined,
        xRays: formMedRecords.xRays.length > 0 ? formMedRecords.xRays : undefined,
        labTests: formMedRecords.labTests.length > 0 ? formMedRecords.labTests : undefined,
        prescriptions: formMedRecords.prescriptions.length > 0 ? formMedRecords.prescriptions : undefined,
        allergies: formMedRecords.allergies.length > 0 ? formMedRecords.allergies : undefined,
      };
      const nextPatients = [newPatient, ...patients];
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', nextPatients);
      setPatients(nextPatients);
      resetForm();
      setShowForm(false);
    } catch {}
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || '',
      age: patient.age ? String(patient.age) : '',
      gender: patient.gender || 'male',
      bloodType: patient.bloodType || '',
      caseType: patient.caseType || '',
      notes: patient.notes || '',
      hasInstallments: patient.hasInstallments || false,
      installmentTotal: patient.installmentTotal ? String(patient.installmentTotal) : '',
    });
    setFormMedRecords({
      xRays: patient.xRays || [],
      labTests: patient.labTests || [],
      prescriptions: patient.prescriptions || [],
      allergies: patient.allergies || [],
    });
    setFormMedSection(null);
    setFormMed({});
    setShowForm(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPatient || !form.name.trim() || !form.phone.trim()) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const updatedPatient: Patient = {
        ...editingPatient,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender as 'male' | 'female',
        bloodType: form.bloodType || undefined,
        caseType: form.caseType || undefined,
        notes: form.notes || undefined,
        hasInstallments: form.hasInstallments,
        installmentTotal: form.hasInstallments && form.installmentTotal ? Number(form.installmentTotal) : undefined,
        xRays: formMedRecords.xRays.length > 0 ? formMedRecords.xRays : undefined,
        labTests: formMedRecords.labTests.length > 0 ? formMedRecords.labTests : undefined,
        prescriptions: formMedRecords.prescriptions.length > 0 ? formMedRecords.prescriptions : undefined,
        allergies: formMedRecords.allergies.length > 0 ? formMedRecords.allergies : undefined,
      };
      const nextPatients = patients.map(p => p.id === editingPatient.id ? updatedPatient : p);
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', nextPatients);
      setPatients(nextPatients);
      resetForm();
      setShowForm(false);
    } catch {}
  };

  const handleAddFormMedRecord = (section: 'xRays' | 'labTests' | 'prescriptions' | 'allergies') => {
    let newItem: any;
    if (section === 'xRays') {
      if (!formMed.description?.trim()) return;
      newItem = { id: `xr-${Date.now()}`, description: formMed.description, url: formMed.url || undefined, date: formMed.date || new Date().toISOString().slice(0, 10) };
    } else if (section === 'labTests') {
      if (!formMed.name?.trim()) return;
      newItem = { id: `lab-${Date.now()}`, name: formMed.name, result: formMed.result || undefined, date: formMed.date || new Date().toISOString().slice(0, 10), fileUrl: formMed.fileUrl || undefined };
    } else if (section === 'prescriptions') {
      if (!formMed.medication?.trim()) return;
      newItem = { id: `rx-${Date.now()}`, medication: formMed.medication, dosage: formMed.dosage || '', duration: formMed.duration || undefined, date: formMed.date || new Date().toISOString().slice(0, 10), notes: formMed.notes || undefined };
    } else {
      if (!formMed.name?.trim()) return;
      newItem = { id: `alg-${Date.now()}`, name: formMed.name, severity: formMed.severity || 'mild', notes: formMed.notes || undefined };
    }
    setFormMedRecords(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
    setFormMed({});
  };

  const handleDeleteFormMedRecord = (section: 'xRays' | 'labTests' | 'prescriptions' | 'allergies', itemId: string) => {
    setFormMedRecords(prev => ({ ...prev, [section]: prev[section].filter((item: any) => item.id !== itemId) }));
  };

  const handleAddPayment = async (patientId: string) => {
    if (!paymentForm.amount.trim() || Number(paymentForm.amount) <= 0) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        amount: Number(paymentForm.amount),
        method: paymentForm.method as Payment['method'],
        service: paymentForm.service || (isEn ? 'Session' : 'جلسة'),
        date: paymentForm.date,
        note: paymentForm.note || undefined,
      };
      const nextPatients = patients.map(p => p.id === patientId ? { ...p, payments: [...(p.payments || []), newPayment] } : p);
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', nextPatients);
      setPatients(nextPatients);
      setPaymentForm({ amount: '', method: 'cash', service: '', date: new Date().toISOString().slice(0, 10), note: '' });
      setPaymentPatientId(null);
    } catch {}
  };

  const handleDeletePayment = async (patientId: string, paymentId: string) => {
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const nextPatients = patients.map(p => p.id === patientId ? { ...p, payments: (p.payments || []).filter(pay => pay.id !== paymentId) } : p);
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', nextPatients);
      setPatients(nextPatients);
    } catch {}
  };

  const handleAddInstallment = async (patientId: string) => {
    if (!installmentForm.amount.trim()) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const nextPatients = patients.map(p => {
        if (p.id !== patientId) return p;
        const newInstallment: Installment = {
          id: `inst-${Date.now()}`,
          amount: Number(installmentForm.amount),
          paidAt: new Date().toISOString().slice(0, 10),
          note: installmentForm.note || undefined,
        };
        return { ...p, installments: [...(p.installments || []), newInstallment] };
      });
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', nextPatients);
      setPatients(nextPatients);
      setInstallmentForm({ amount: '', note: '' });
      setInstallmentPatientId(null);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isEn ? 'Are you sure you want to delete?' : 'هل أنت متأكد من الحذف؟')) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const nextPatients = patients.filter(p => p.id !== id);
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', nextPatients);
      setPatients(nextPatients);
    } catch {}
  };

  const savePatients = async (next: Patient[]) => {
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', next);
      setPatients(next);
    } catch {}
  };

  const handleAddMedRecord = (patientId: string, section: 'xRays' | 'labTests' | 'prescriptions' | 'allergies') => {
    const p = patients.find(x => x.id === patientId);
    if (!p) return;
    let newItem: any;
    if (section === 'xRays') {
      if (!medForm.description?.trim()) return;
      newItem = { id: `xr-${Date.now()}`, description: medForm.description, url: medForm.url || undefined, date: medForm.date || new Date().toISOString().slice(0, 10) };
    } else if (section === 'labTests') {
      if (!medForm.name?.trim()) return;
      newItem = { id: `lab-${Date.now()}`, name: medForm.name, result: medForm.result || undefined, date: medForm.date || new Date().toISOString().slice(0, 10), fileUrl: medForm.fileUrl || undefined };
    } else if (section === 'prescriptions') {
      if (!medForm.medication?.trim()) return;
      newItem = { id: `rx-${Date.now()}`, medication: medForm.medication, dosage: medForm.dosage || '', duration: medForm.duration || undefined, date: medForm.date || new Date().toISOString().slice(0, 10), notes: medForm.notes || undefined };
    } else {
      if (!medForm.name?.trim()) return;
      newItem = { id: `alg-${Date.now()}`, name: medForm.name, severity: medForm.severity || 'mild', notes: medForm.notes || undefined };
    }
    const next = patients.map(x => x.id === patientId ? { ...x, [section]: [...(x[section] || []), newItem] } : x);
    savePatients(next);
    setMedForm({});
  };

  const handleDeleteMedRecord = (patientId: string, section: 'xRays' | 'labTests' | 'prescriptions' | 'allergies', itemId: string) => {
    const next = patients.map(x => x.id === patientId ? { ...x, [section]: (x[section] || []).filter((item: any) => item.id !== itemId) } : x);
    savePatients(next);
  };

  const severityColors: Record<string, string> = { mild: 'bg-yellow-50 text-yellow-700', moderate: 'bg-orange-50 text-orange-700', severe: 'bg-red-50 text-red-700' };
  const severityLabels = (s: string) => isEn ? s : (s === 'mild' ? 'خفيف' : s === 'moderate' ? 'متوسط' : 'شديد');

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.phone.includes(q) || (p.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? 'Patient Records' : 'ملفات المرضى'}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{patients.length} {isEn ? 'registered patients' : 'مريض مسجل'}</p>
          </div>
        </div>
        <button type="button" onClick={() => { if (editingPatient) resetForm(); else { setForm({ name: '', phone: '', email: '', age: '', gender: 'male', bloodType: '', caseType: '', notes: '', hasInstallments: false, installmentTotal: '' }); setFormMedRecords({ xRays: [], labTests: [], prescriptions: [], allergies: [] }); setFormMedSection(null); setFormMed({}); } setShowForm(!showForm); }} title={isEn ? 'Add new patient' : 'إضافة مريض جديد'}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> {isEn ? 'Add Patient' : 'إضافة مريض'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">{editingPatient ? (isEn ? 'Edit Patient' : 'تعديل بيانات المريض') : (isEn ? 'Register New Patient' : 'تسجيل مريض جديد')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Full Name *' : 'الاسم الكامل *'}</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={isEn ? 'e.g. John Doe' : 'مثال: أحمد محمد'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Phone *' : 'رقم الهاتف *'}</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="05xxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Age' : 'العمر'}</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="25"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Gender' : 'الجنس'}</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300">
                <option value="male">{isEn ? 'Male' : 'ذكر'}</option>
                <option value="female">{isEn ? 'Female' : 'أنثى'}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Case Type' : 'نوع الحالة'}</label>
            <input type="text" value={form.caseType} onChange={e => setForm(f => ({ ...f, caseType: e.target.value }))}
              placeholder={isEn ? 'e.g. Filling, Extraction, Braces, Surgery, Cleaning...' : 'مثال: حشو، خلع، تقويم، عملية، تنظيف...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.hasInstallments} onChange={e => setForm(f => ({ ...f, hasInstallments: e.target.checked }))}
                className="w-4 h-4 accent-cyan-500 rounded" />
              <span className="text-xs font-black text-slate-700">{isEn ? 'Enable installments (Braces / Surgery / Long procedure)' : 'تفعيل نظام الأقساط (تقويم / عملية / إجراء طويل)'}</span>
            </label>
            {form.hasInstallments && (
              <div className="mt-3">
                <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Total Amount' : 'المبلغ الإجمالي'}</label>
                <input type="number" value={form.installmentTotal} onChange={e => setForm(f => ({ ...f, installmentTotal: e.target.value }))}
                  placeholder={isEn ? 'e.g. 5000' : 'مثال: 5000'}
                  className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Medical Notes' : 'ملاحظات طبية'}</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder={isEn ? 'Allergies, chronic conditions...' : 'حساسية، أمراض مزمنة...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300 resize-none" />
          </div>
          {/* Medical Records in Form */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope size={16} className="text-cyan-600" />
              <h4 className="text-sm font-black text-slate-800">{isEn ? 'Medical Records' : 'الملف الطبي'}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => { setFormMedSection('xRays'); setFormMed({ date: new Date().toISOString().slice(0, 10) }); }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${formMedSection === 'xRays' ? 'bg-cyan-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                <ScanLine size={12} /> {isEn ? 'X-Rays' : 'الأشعة'}
                {formMedRecords.xRays.length > 0 && <span className="bg-white/20 px-1 rounded">{formMedRecords.xRays.length}</span>}
              </button>
              <button type="button" onClick={() => { setFormMedSection('labTests'); setFormMed({ date: new Date().toISOString().slice(0, 10) }); }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${formMedSection === 'labTests' ? 'bg-cyan-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                <FlaskConical size={12} /> {isEn ? 'Lab Tests' : 'التحاليل'}
                {formMedRecords.labTests.length > 0 && <span className="bg-white/20 px-1 rounded">{formMedRecords.labTests.length}</span>}
              </button>
              <button type="button" onClick={() => { setFormMedSection('prescriptions'); setFormMed({ date: new Date().toISOString().slice(0, 10) }); }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${formMedSection === 'prescriptions' ? 'bg-cyan-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                <Pill size={12} /> {isEn ? 'Prescriptions' : 'الوصفات'}
                {formMedRecords.prescriptions.length > 0 && <span className="bg-white/20 px-1 rounded">{formMedRecords.prescriptions.length}</span>}
              </button>
              <button type="button" onClick={() => { setFormMedSection('allergies'); setFormMed({}); }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${formMedSection === 'allergies' ? 'bg-cyan-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                <AlertTriangle size={12} /> {isEn ? 'Allergies' : 'الحساسية'}
                {formMedRecords.allergies.length > 0 && <span className="bg-white/20 px-1 rounded">{formMedRecords.allergies.length}</span>}
              </button>
            </div>

            {/* Form X-Rays */}
            {formMedSection === 'xRays' && (
              <div className="space-y-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                {formMedRecords.xRays.map((xr) => (
                  <div key={xr.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                    {xr.url ? <img src={xr.url} alt={xr.description} className="w-10 h-10 rounded-lg object-cover cursor-pointer" onClick={() => setLightboxImage(xr.url!)} /> : <ImageIcon size={16} className="text-slate-400" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{xr.description}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{xr.date}</div>
                    </div>
                    <button type="button" onClick={() => handleDeleteFormMedRecord('xRays', xr.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 items-end">
                  <input type="text" placeholder={isEn ? 'Description' : 'الوصف'} value={formMed.description || ''}
                    onChange={e => setFormMed(f => ({ ...f, description: e.target.value }))}
                    className="flex-1 min-w-[120px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                  <label className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 cursor-pointer hover:border-cyan-300 transition-colors">
                    <ImageIcon size={14} className="text-slate-400" />
                    <span>{formMed.url ? (isEn ? 'Image selected ✓' : 'تم اختيار صورة ✓') : (isEn ? 'Upload image' : 'رفع صورة')}</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
                        const result = await uploadImage(file, {
                          maxWidth: 1000,
                          maxHeight: 1000,
                          quality: 0.82,
                          purpose: 'patient_medical',
                          shopId: shop?.id,
                        });
                        if (result?.url) {
                          setFormMed(f => ({ ...f, url: result.url }));
                        }
                      }} />
                  </label>
                  {formMed.url && <img src={formMed.url} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLightboxImage(formMed.url!)} />}
                  <input type="date" value={formMed.date || ''}
                    onChange={e => setFormMed(f => ({ ...f, date: e.target.value }))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-300" />
                  <button type="button" onClick={() => handleAddFormMedRecord('xRays')} disabled={!formMed.description?.trim()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black disabled:opacity-50"><Plus size={10} className="inline" /> {isEn ? 'Add' : 'إضافة'}</button>
                </div>
              </div>
            )}

            {/* Form Lab Tests */}
            {formMedSection === 'labTests' && (
              <div className="space-y-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                {formMedRecords.labTests.map((lt) => (
                  <div key={lt.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                    <FlaskConical size={16} className="text-cyan-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{lt.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{lt.date}{lt.result && ` • ${lt.result}`}</div>
                    </div>
                    <button type="button" onClick={() => handleDeleteFormMedRecord('labTests', lt.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 items-end">
                  <input type="text" placeholder={isEn ? 'Test name' : 'اسم التحليل'} value={formMed.name || ''}
                    onChange={e => setFormMed(f => ({ ...f, name: e.target.value }))}
                    className="flex-1 min-w-[100px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                  <input type="text" placeholder={isEn ? 'Result (optional)' : 'النتيجة (اختياري)'} value={formMed.result || ''}
                    onChange={e => setFormMed(f => ({ ...f, result: e.target.value }))}
                    className="w-full sm:w-28 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                  <input type="date" value={formMed.date || ''}
                    onChange={e => setFormMed(f => ({ ...f, date: e.target.value }))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-300" />
                  <button type="button" onClick={() => handleAddFormMedRecord('labTests')} disabled={!formMed.name?.trim()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black disabled:opacity-50"><Plus size={10} className="inline" /> {isEn ? 'Add' : 'إضافة'}</button>
                </div>
              </div>
            )}

            {/* Form Prescriptions */}
            {formMedSection === 'prescriptions' && (
              <div className="space-y-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                {formMedRecords.prescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                    <Pill size={16} className="text-violet-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{rx.medication} <span className="text-slate-400">{rx.dosage}</span></div>
                      <div className="text-[10px] text-slate-400 font-bold">{rx.date}{rx.duration && ` • ${rx.duration}`}{rx.notes && ` • ${rx.notes}`}</div>
                    </div>
                    <button type="button" onClick={() => handleDeleteFormMedRecord('prescriptions', rx.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 items-end">
                  <input type="text" placeholder={isEn ? 'Medication' : 'الدواء'} value={formMed.medication || ''}
                    onChange={e => setFormMed(f => ({ ...f, medication: e.target.value }))}
                    className="flex-1 min-w-[100px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                  <input type="text" placeholder={isEn ? 'Dosage' : 'الجرعة'} value={formMed.dosage || ''}
                    onChange={e => setFormMed(f => ({ ...f, dosage: e.target.value }))}
                    className="w-full sm:w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                  <input type="text" placeholder={isEn ? 'Duration' : 'المدة'} value={formMed.duration || ''}
                    onChange={e => setFormMed(f => ({ ...f, duration: e.target.value }))}
                    className="w-full sm:w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                  <input type="date" value={formMed.date || ''}
                    onChange={e => setFormMed(f => ({ ...f, date: e.target.value }))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-300" />
                  <button type="button" onClick={() => handleAddFormMedRecord('prescriptions')} disabled={!formMed.medication?.trim()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black disabled:opacity-50"><Plus size={10} className="inline" /> {isEn ? 'Add' : 'إضافة'}</button>
                </div>
              </div>
            )}

            {/* Form Allergies */}
            {formMedSection === 'allergies' && (
              <div className="space-y-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                {formMedRecords.allergies.map((alg) => (
                  <div key={alg.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{alg.name}</div>
                      {alg.notes && <div className="text-[10px] text-slate-400 font-bold">{alg.notes}</div>}
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${severityColors[alg.severity]}`}>{severityLabels(alg.severity)}</span>
                    <button type="button" onClick={() => handleDeleteFormMedRecord('allergies', alg.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 items-end">
                  <input type="text" placeholder={isEn ? 'Allergy name' : 'نوع الحساسية'} value={formMed.name || ''}
                    onChange={e => setFormMed(f => ({ ...f, name: e.target.value }))}
                    className="flex-1 min-w-[100px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                  <select value={formMed.severity || 'mild'} onChange={e => setFormMed(f => ({ ...f, severity: e.target.value }))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-300">
                    <option value="mild">{isEn ? 'Mild' : 'خفيف'}</option>
                    <option value="moderate">{isEn ? 'Moderate' : 'متوسط'}</option>
                    <option value="severe">{isEn ? 'Severe' : 'شديد'}</option>
                  </select>
                  <input type="text" placeholder={isEn ? 'Notes (optional)' : 'ملاحظات (اختياري)'} value={formMed.notes || ''}
                    onChange={e => setFormMed(f => ({ ...f, notes: e.target.value }))}
                    className="w-full sm:w-28 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                  <button type="button" onClick={() => handleAddFormMedRecord('allergies')} disabled={!formMed.name?.trim()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black disabled:opacity-50"><Plus size={10} className="inline" /> {isEn ? 'Add' : 'إضافة'}</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} title={isEn ? 'Cancel' : 'إلغاء'} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">{isEn ? 'Cancel' : 'إلغاء'}</button>
            <button type="button" onClick={editingPatient ? handleSaveEdit : handleAdd} disabled={!form.name.trim() || !form.phone.trim()} title={isEn ? 'Save patient data' : 'حفظ بيانات المريض'}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">{isEn ? 'Save' : 'حفظ'}</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder={isEn ? 'Search by name or phone...' : 'ابحث بالاسم أو الهاتف...'} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
          <p className="font-bold text-slate-400">{isEn ? 'Loading...' : 'جاري التحميل...'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <FileText className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{search ? (isEn ? `No results for "${search}"` : `لا نتائج لـ "${search}"`) : (isEn ? 'No patients registered yet' : 'لم تسجل مرضى بعد')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(p => {
            const paidTotal = (p.installments || []).reduce((sum, i) => sum + i.amount, 0);
            const remaining = (p.installmentTotal || 0) - paidTotal;
            return (
            <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-100 to-slate-100 flex items-center justify-center font-black text-slate-600 text-lg">
                  {p.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-slate-900 truncate">{p.name}</div>
                  <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                    {p.gender === 'male' ? (isEn ? 'Male' : 'ذكر') : (isEn ? 'Female' : 'أنثى')} {p.age && `• ${p.age} ${isEn ? 'yrs' : 'سنة'}`} {p.bloodType && `• ${p.bloodType}`}
                  </div>
                </div>
              </div>
              {p.caseType && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg">{p.caseType}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500"><Phone size={11} /> {p.phone}</div>
                {p.email && <div className="flex items-center gap-1 text-xs font-bold text-slate-400"><Mail size={11} /> {p.email}</div>}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{p.totalVisits} {isEn ? 'visits' : 'زيارة'}</span>
                {p.lastVisit && <span className="text-slate-400 flex items-center gap-1"><Calendar size={11} /> {isEn ? 'Last:' : 'آخر:'} {p.lastVisit}</span>}
              </div>

              {/* ── Payments / Financial Record ── */}
              <div className="bg-gradient-to-l from-emerald-50 to-white border border-emerald-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1"><DollarSign size={12} className="text-emerald-600" /> {isEn ? 'Payments' : 'المدفوعات'}</span>
                  <span className="text-sm font-black text-emerald-700">
                    {(p.payments || []).reduce((s, pay) => s + pay.amount, 0).toLocaleString()} {isEn ? 'EGP' : 'ج.م'}
                  </span>
                </div>
                {(p.payments || []).length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {(p.payments || []).map((pay, idx) => (
                      <div key={pay.id} className="flex items-center justify-between bg-white rounded-lg px-2 py-1.5 border border-slate-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-black text-slate-400 shrink-0">#{idx + 1}</span>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-700 truncate">{pay.service}</div>
                            <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                              <span>{pay.date}</span>
                              <span className={`px-1 rounded ${pay.method === 'cash' ? 'bg-green-50 text-green-600' : pay.method === 'card' ? 'bg-blue-50 text-blue-600' : pay.method === 'transfer' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                                {pay.method === 'cash' ? (isEn ? 'Cash' : 'كاش') : pay.method === 'card' ? (isEn ? 'Card' : 'بطاقة') : pay.method === 'transfer' ? (isEn ? 'Transfer' : 'تحويل') : (isEn ? 'Installment' : 'قسط')}
                              </span>
                              {pay.note && <span className="truncate">• {pay.note}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-black text-emerald-700">{pay.amount.toLocaleString()}</span>
                          <button type="button" onClick={() => handleDeletePayment(p.id, pay.id)} className="p-0.5 rounded hover:bg-red-50"><Trash2 size={10} className="text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {paymentPatientId === p.id ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-2 items-end">
                      <input type="number" placeholder={isEn ? 'Amount' : 'المبلغ'} value={paymentForm.amount}
                        onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                        className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-emerald-400" />
                      <select value={paymentForm.method} onChange={e => setPaymentForm(f => ({ ...f, method: e.target.value }))}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-emerald-400">
                        <option value="cash">{isEn ? 'Cash' : 'كاش'}</option>
                        <option value="card">{isEn ? 'Card' : 'بطاقة'}</option>
                        <option value="transfer">{isEn ? 'Transfer' : 'تحويل'}</option>
                        <option value="installment">{isEn ? 'Installment' : 'قسط'}</option>
                      </select>
                      <input type="text" placeholder={isEn ? 'Service' : 'الخدمة'} value={paymentForm.service}
                        onChange={e => setPaymentForm(f => ({ ...f, service: e.target.value }))}
                        className="flex-1 min-w-[80px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-emerald-400" />
                      <input type="date" value={paymentForm.date}
                        onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-emerald-400" />
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder={isEn ? 'Note (optional)' : 'ملاحظة (اختياري)'} value={paymentForm.note}
                        onChange={e => setPaymentForm(f => ({ ...f, note: e.target.value }))}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-emerald-400" />
                      <button type="button" onClick={() => handleAddPayment(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700">{isEn ? 'Record' : 'تسجيل'}</button>
                      <button type="button" onClick={() => setPaymentPatientId(null)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black text-slate-500 hover:bg-slate-50">✕</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => { setPaymentPatientId(p.id); setPaymentForm({ amount: '', method: 'cash', service: p.caseType || '', date: new Date().toISOString().slice(0, 10), note: '' }); }}
                    className="w-full py-1.5 rounded-lg border border-dashed border-emerald-300 text-[10px] font-black text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-1">
                    <DollarSign size={10} /> {isEn ? 'Record new payment' : 'تسجيل دفعة جديدة'}
                  </button>
                )}
              </div>

              {p.hasInstallments && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1"><CreditCard size={12} /> {isEn ? 'Installments' : 'نظام أقساط'}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${remaining <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {remaining <= 0 ? (isEn ? 'Completed' : 'مكتمل') : (isEn ? `Remaining: ${remaining}` : `متبقي: ${remaining}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                    <span>{isEn ? 'Total:' : 'الإجمالي:'} {p.installmentTotal}</span>
                    <span>{isEn ? 'Paid:' : 'المدفوع:'} {paidTotal}</span>
                    <span>{isEn ? 'Payments:' : 'الدفعات:'} {(p.installments || []).length}</span>
                  </div>
                  {(p.installments || []).length > 0 && (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {(p.installments || []).map((inst, idx) => (
                        <div key={inst.id} className="flex items-center justify-between text-[10px] font-bold text-slate-500 bg-white rounded-lg px-2 py-1">
                          <span>{isEn ? `Payment ${idx + 1}:` : `دفعة ${idx + 1}:`} {inst.amount}</span>
                          <span>{inst.paidAt} {inst.note && `• ${inst.note}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {remaining > 0 && (
                    installmentPatientId === p.id ? (
                      <div className="flex gap-2 items-end pt-1">
                        <input type="number" placeholder={isEn ? 'Amount' : 'المبلغ'} value={installmentForm.amount}
                          onChange={e => setInstallmentForm(f => ({ ...f, amount: e.target.value }))}
                          className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <input type="text" placeholder={isEn ? 'Note (optional)' : 'ملاحظة (اختياري)'} value={installmentForm.note}
                          onChange={e => setInstallmentForm(f => ({ ...f, note: e.target.value }))}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <button type="button" onClick={() => handleAddInstallment(p.id)} title={isEn ? 'Record payment' : 'تسجيل دفعة'}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black">{isEn ? 'Record' : 'تسجيل'}</button>
                        <button type="button" onClick={() => setInstallmentPatientId(null)} title={isEn ? 'Cancel' : 'إلغاء'}
                          className="px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black text-slate-500 hover:bg-slate-50">✕</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => { setInstallmentPatientId(p.id); setInstallmentForm({ amount: '', note: '' }); }}
                        title={isEn ? 'Record new payment' : 'تسجيل دفعة جديدة'}
                        className="w-full py-1.5 rounded-lg border border-dashed border-slate-300 text-[10px] font-black text-slate-500 hover:bg-white hover:border-cyan-300 flex items-center justify-center gap-1">
                        <DollarSign size={10} /> {isEn ? 'Record new payment' : 'تسجيل دفعة جديدة'}
                      </button>
                    )
                  )}
                </div>
              )}
              {p.notes && <p className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg">⚠ {p.notes}</p>}

              {/* Medical Record Section */}
              <button type="button" onClick={() => { setExpandedPatientId(expandedPatientId === p.id ? null : p.id); setMedSection(null); setMedForm({}); }}
                className="w-full py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <Stethoscope size={14} className="text-cyan-600" />
                {isEn ? 'Medical Record' : 'الملف الطبي'}
                {expandedPatientId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {expandedPatientId === p.id && (
                <div className="space-y-3 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  {/* Med section tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => { setMedSection('xRays'); setMedForm({ date: new Date().toISOString().slice(0, 10) }); }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${medSection === 'xRays' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      <ScanLine size={12} /> {isEn ? 'X-Rays' : 'الأشعة'}
                      {(p.xRays || []).length > 0 && <span className="bg-white/20 px-1 rounded">{(p.xRays || []).length}</span>}
                    </button>
                    <button onClick={() => { setMedSection('labTests'); setMedForm({ date: new Date().toISOString().slice(0, 10) }); }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${medSection === 'labTests' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      <FlaskConical size={12} /> {isEn ? 'Lab Tests' : 'التحاليل'}
                      {(p.labTests || []).length > 0 && <span className="bg-white/20 px-1 rounded">{(p.labTests || []).length}</span>}
                    </button>
                    <button onClick={() => { setMedSection('prescriptions'); setMedForm({ date: new Date().toISOString().slice(0, 10) }); }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${medSection === 'prescriptions' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      <Pill size={12} /> {isEn ? 'Prescriptions' : 'الوصفات'}
                      {(p.prescriptions || []).length > 0 && <span className="bg-white/20 px-1 rounded">{(p.prescriptions || []).length}</span>}
                    </button>
                    <button onClick={() => { setMedSection('allergies'); setMedForm({}); }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${medSection === 'allergies' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      <AlertTriangle size={12} /> {isEn ? 'Allergies' : 'الحساسية'}
                      {(p.allergies || []).length > 0 && <span className="bg-white/20 px-1 rounded">{(p.allergies || []).length}</span>}
                    </button>
                  </div>

                  {/* X-Rays section */}
                  {medSection === 'xRays' && (
                    <div className="space-y-2">
                      {(p.xRays || []).map((xr) => (
                        <div key={xr.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                          {xr.url ? <img src={xr.url} alt={xr.description} className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLightboxImage(xr.url!)} /> : <ImageIcon size={16} className="text-slate-400" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-700 truncate">{xr.description}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{xr.date}</div>
                          </div>
                          <button onClick={() => handleDeleteMedRecord(p.id, 'xRays', xr.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} className="text-red-400" /></button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2 items-end">
                        <input type="text" placeholder={isEn ? 'Description' : 'الوصف'} value={medForm.description || ''}
                          onChange={e => setMedForm(f => ({ ...f, description: e.target.value }))}
                          className="flex-1 min-w-[120px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <label className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 cursor-pointer hover:border-cyan-300 transition-colors">
                          <ImageIcon size={14} className="text-slate-400" />
                          <span>{medForm.url ? (isEn ? 'Image selected ✓' : 'تم اختيار صورة ✓') : (isEn ? 'Upload image' : 'رفع صورة')}</span>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
                              const result = await uploadImage(file, {
                                maxWidth: 1000,
                                maxHeight: 1000,
                                quality: 0.82,
                                purpose: 'patient_medical',
                                shopId: shop?.id,
                              });
                              if (result?.url) {
                                setMedForm(f => ({ ...f, url: result.url }));
                              }
                            }} />
                        </label>
                        {medForm.url && (
                          <img src={medForm.url} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLightboxImage(medForm.url!)} />
                        )}
                        <input type="date" value={medForm.date || ''}
                          onChange={e => setMedForm(f => ({ ...f, date: e.target.value }))}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-300" />
                        <button onClick={() => handleAddMedRecord(p.id, 'xRays')} disabled={!medForm.description?.trim()}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black disabled:opacity-50"><Plus size={10} className="inline" /> {isEn ? 'Add' : 'إضافة'}</button>
                      </div>
                    </div>
                  )}

                  {/* Lab Tests section */}
                  {medSection === 'labTests' && (
                    <div className="space-y-2">
                      {(p.labTests || []).map((lt) => (
                        <div key={lt.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                          <FlaskConical size={16} className="text-cyan-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-700 truncate">{lt.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{lt.date}{lt.result && ` • ${lt.result}`}</div>
                          </div>
                          <button onClick={() => handleDeleteMedRecord(p.id, 'labTests', lt.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} className="text-red-400" /></button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2 items-end">
                        <input type="text" placeholder={isEn ? 'Test name' : 'اسم التحليل'} value={medForm.name || ''}
                          onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))}
                          className="flex-1 min-w-[100px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <input type="text" placeholder={isEn ? 'Result (optional)' : 'النتيجة (اختياري)'} value={medForm.result || ''}
                          onChange={e => setMedForm(f => ({ ...f, result: e.target.value }))}
                          className="w-full sm:w-28 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <input type="date" value={medForm.date || ''}
                          onChange={e => setMedForm(f => ({ ...f, date: e.target.value }))}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-300" />
                        <button onClick={() => handleAddMedRecord(p.id, 'labTests')} disabled={!medForm.name?.trim()}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black disabled:opacity-50"><Plus size={10} className="inline" /> {isEn ? 'Add' : 'إضافة'}</button>
                      </div>
                    </div>
                  )}

                  {/* Prescriptions section */}
                  {medSection === 'prescriptions' && (
                    <div className="space-y-2">
                      {(p.prescriptions || []).map((rx) => (
                        <div key={rx.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                          <Pill size={16} className="text-violet-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-700 truncate">{rx.medication} <span className="text-slate-400">{rx.dosage}</span></div>
                            <div className="text-[10px] text-slate-400 font-bold">{rx.date}{rx.duration && ` • ${rx.duration}`}{rx.notes && ` • ${rx.notes}`}</div>
                          </div>
                          <button onClick={() => handleDeleteMedRecord(p.id, 'prescriptions', rx.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} className="text-red-400" /></button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2 items-end">
                        <input type="text" placeholder={isEn ? 'Medication' : 'الدواء'} value={medForm.medication || ''}
                          onChange={e => setMedForm(f => ({ ...f, medication: e.target.value }))}
                          className="flex-1 min-w-[100px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <input type="text" placeholder={isEn ? 'Dosage' : 'الجرعة'} value={medForm.dosage || ''}
                          onChange={e => setMedForm(f => ({ ...f, dosage: e.target.value }))}
                          className="w-full sm:w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <input type="text" placeholder={isEn ? 'Duration' : 'المدة'} value={medForm.duration || ''}
                          onChange={e => setMedForm(f => ({ ...f, duration: e.target.value }))}
                          className="w-full sm:w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <input type="date" value={medForm.date || ''}
                          onChange={e => setMedForm(f => ({ ...f, date: e.target.value }))}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-300" />
                        <button onClick={() => handleAddMedRecord(p.id, 'prescriptions')} disabled={!medForm.medication?.trim()}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black disabled:opacity-50"><Plus size={10} className="inline" /> {isEn ? 'Add' : 'إضافة'}</button>
                      </div>
                    </div>
                  )}

                  {/* Allergies section */}
                  {medSection === 'allergies' && (
                    <div className="space-y-2">
                      {(p.allergies || []).map((alg) => (
                        <div key={alg.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-700 truncate">{alg.name}</div>
                            {alg.notes && <div className="text-[10px] text-slate-400 font-bold">{alg.notes}</div>}
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${severityColors[alg.severity]}`}>{severityLabels(alg.severity)}</span>
                          <button onClick={() => handleDeleteMedRecord(p.id, 'allergies', alg.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} className="text-red-400" /></button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2 items-end">
                        <input type="text" placeholder={isEn ? 'Allergy name' : 'نوع الحساسية'} value={medForm.name || ''}
                          onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))}
                          className="flex-1 min-w-[100px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <select value={medForm.severity || 'mild'} onChange={e => setMedForm(f => ({ ...f, severity: e.target.value }))}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-300">
                          <option value="mild">{isEn ? 'Mild' : 'خفيف'}</option>
                          <option value="moderate">{isEn ? 'Moderate' : 'متوسط'}</option>
                          <option value="severe">{isEn ? 'Severe' : 'شديد'}</option>
                        </select>
                        <input type="text" placeholder={isEn ? 'Notes (optional)' : 'ملاحظات (اختياري)'} value={medForm.notes || ''}
                          onChange={e => setMedForm(f => ({ ...f, notes: e.target.value }))}
                          className="w-full sm:w-28 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-right focus:outline-none focus:border-cyan-300" />
                        <button onClick={() => handleAddMedRecord(p.id, 'allergies')} disabled={!medForm.name?.trim()}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black hover:bg-black disabled:opacity-50"><Plus size={10} className="inline" /> {isEn ? 'Add' : 'إضافة'}</button>
                      </div>
                    </div>
                  )}

                  {medSection === null && (
                    <p className="text-[10px] text-slate-400 font-bold text-center py-2">{isEn ? 'Select a section above to view or add records' : 'اختر قسماً بالأعلى للعرض أو الإضافة'}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => handleEdit(p)} title={isEn ? 'Edit patient data' : 'تعديل بيانات المريض'} className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                  <Edit2 size={12} /> {isEn ? 'Edit' : 'تعديل'}
                </button>
                <button type="button" onClick={() => handleDelete(p.id)} title={isEn ? 'Delete patient record' : 'حذف ملف المريض'}
                  className="py-2 px-3 rounded-xl border border-red-100 text-xs font-black text-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <button type="button" className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setLightboxImage(null)}>
            <X size={24} />
          </button>
          <img src={lightboxImage} alt="X-Ray" className="max-w-full max-h-full rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default ActivityPatientsPage;
