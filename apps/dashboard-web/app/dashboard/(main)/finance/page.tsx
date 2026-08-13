'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Search, Loader2, Plus, Edit, Trash2, Eye, Download, Upload, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, MoreVertical, DollarSign, Calendar, Clock, User, CheckCircle2, XCircle, AlertTriangle, Printer, Mail, Send, Save, ArrowRight, FileDown } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type InvoiceLine = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type ReceiptTheme = {
  shopName: string;
  phone: string;
  city: string;
  address: string;
  logoDataUrl: string;
  footerNote: string;
  vatRatePercent: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export default function FinancePage() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  // Invoice Editor States
  const [view, setView] = useState<'manage' | 'edit'>('manage');
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [discountValue, setDiscountValue] = useState('0');
  const [receiptTheme, setReceiptTheme] = useState<ReceiptTheme>({
    shopName: '',
    phone: '',
    city: '',
    address: '',
    logoDataUrl: '',
    footerNote: '',
    vatRatePercent: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [isArabic, setIsArabic] = useState(false);

  // RTL Support
  useEffect(() => {
    const checkRTL = () => {
      const lang = document.documentElement.lang || 'en';
      setIsArabic(lang.toLowerCase().startsWith('ar'));
    };
    checkRTL();
    window.addEventListener('languagechange', checkRTL);
    return () => window.removeEventListener('languagechange', checkRTL);
  }, []);

  // Invoice Calculations
  const subtotal = useMemo(() => {
    return (lines || []).reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.quantity) || 0), 0);
  }, [lines]);

  const discount = useMemo(() => {
    const n = Number(discountValue);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(subtotal, n));
  }, [discountValue, subtotal]);

  const netBeforeVat = Math.max(0, subtotal - discount);

  const vatRate = Number(receiptTheme?.vatRatePercent || 0);
  const vatRatePct = Number.isFinite(vatRate) ? vatRate : 0;
  const vatAmount = netBeforeVat * (vatRatePct / 100);
  const total = netBeforeVat + vatAmount;
  const showVat = vatRatePct > 0;

  const formatMoney = (v: any) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return '0.00';
    return n.toFixed(2);
  };

  const resetEditor = () => {
    setSelectedInvoiceId('');
    setLines([]);
    setNewName('');
    setNewQty('1');
    setNewPrice('');
    setEditLineId('');
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setInvoiceDate(`${yyyy}-${mm}-${dd}`);
    setDiscountValue('0');
    setSaveError('');
    setSaveOk('');
  };

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/invoices/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setInvoices(data.map((i: any) => ({
        id: String(i.id),
        invoiceNumber: i.invoiceNumber || i.invoice_number || '---',
        customerId: i.customerId || i.customer_id || '---',
        customerName: i.customerName || i.customer_name || '---',
        customerEmail: i.customerEmail || i.customer_email || '---',
        status: i.status || 'draft',
        issueDate: i.issueDate || i.issue_date || new Date().toISOString(),
        dueDate: i.dueDate || i.due_date || '',
        paidDate: i.paidDate || i.paid_date || null,
        subtotal: Number(i.subtotal || 0),
        taxAmount: Number(i.taxAmount || i.tax_amount || 0),
        discountAmount: Number(i.discountAmount || i.discount_amount || 0),
        totalAmount: Number(i.totalAmount || i.total_amount || 0),
        paidAmount: Number(i.paidAmount || i.paid_amount || 0),
        notes: i.notes || '',
        createdBy: i.createdBy || i.created_by || '---',
        createdAt: i.createdAt || new Date().toISOString(),
        updatedAt: i.updatedAt || new Date().toISOString(),
      })));
    } catch { setInvoices([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  // Auto-open editor when ?action=new is present
  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'new') {
      resetEditor();
      setView('edit');
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = invoices.filter(i =>
      i.invoiceNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.customerEmail.includes(debouncedSearch)
    );

    if (filterStatus !== 'all') {
      result = result.filter(i => i.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'invoiceNumber' ? a.invoiceNumber : sortBy === 'issueDate' ? a.issueDate : sortBy === 'totalAmount' ? a.totalAmount : a.createdAt;
      const bVal = sortBy === 'invoiceNumber' ? b.invoiceNumber : sortBy === 'issueDate' ? b.issueDate : sortBy === 'totalAmount' ? b.totalAmount : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [invoices, debouncedSearch, filterStatus, sortBy, sortOrder]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedInvoices.length && paginatedInvoices.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedInvoices.map(i => i.id)));
    }
  }, [paginatedInvoices, selectedIds.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const bulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} فاتورة؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} فاتورة`);
      setSelectedIds(new Set());
      loadInvoices();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadInvoices]);

  const bulkSend = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      // TODO: Implement bulk send API call
      alert(`تم إرسال ${selectedIds.size} فاتورة`);
      setSelectedIds(new Set());
    } catch (error) {
      alert('حدث خطأ أثناء الإرسال');
    }
  }, [selectedIds]);

  const exportCSV = useCallback(() => {
    const headers = ['Invoice Number', 'Customer', 'Email', 'Status', 'Issue Date', 'Due Date', 'Paid Date', 'Subtotal', 'Tax', 'Discount', 'Total', 'Paid Amount', 'Created At'];
    const rows = filtered.map(i => [
      i.invoiceNumber,
      i.customerName,
      i.customerEmail,
      i.status,
      i.issueDate,
      i.dueDate || '-',
      i.paidDate || '-',
      i.subtotal,
      i.taxAmount,
      i.discountAmount,
      i.totalAmount,
      i.paidAmount,
      i.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoices.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
          status: 'draft',
        }),
      });
      setAddModal(false);
      setFormData({ customerId: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', notes: '' });
      loadInvoices();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة الفاتورة');
    }
  }, [formData, loadInvoices]);

  const handleEdit = useCallback(async () => {
    if (!editInvoice) return;
    try {
      await apiRequest(`/invoices/${editInvoice.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditInvoice(null);
      setFormData({ customerId: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', notes: '' });
      loadInvoices();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل الفاتورة');
    }
  }, [editInvoice, formData, loadInvoices]);

  // Invoice Line Management
  const removeLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const [editLineId, setEditLineId] = useState<string>('');

  const editLine = (id: string) => {
    const line = lines.find(l => l.id === id);
    if (!line) return;
    setNewName(line.name);
    setNewQty(String(line.quantity));
    setNewPrice(String(line.price));
    setEditLineId(id);
  };

  const addLine = () => {
    const name = String(newName || '').trim();
    const qtyRaw = Number(newQty);
    const priceRaw = Number(newPrice);
    if (!name) return;
    const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;
    const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;

    if (editLineId) {
      // Update existing line
      setLines(prev => prev.map(l => l.id === editLineId ? { ...l, name, quantity: qty, price } : l));
      setEditLineId('');
    } else {
      // Add new line
      setLines(prev => [...prev, {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name,
        quantity: qty,
        price,
      }]);
    }
    setNewName('');
    setNewQty('1');
    setNewPrice('');
  };

  const cancelEditLine = () => {
    setEditLineId('');
    setNewName('');
    setNewQty('1');
    setNewPrice('');
  };

  const openNewInvoice = () => {
    resetEditor();
    setView('edit');
  };

  const openInvoiceForEdit = async (id: string) => {
    const invoiceId = String(id || '').trim();
    if (!invoiceId) return;
    setSaveError('');
    setSaveOk('');
    setSaving(true);
    try {
      const inv = await apiRequest(`/invoices/${invoiceId}`);
      setSelectedInvoiceId(String(inv?.id || invoiceId));

      const dRaw = inv?.invoiceDate || inv?.invoice_date || inv?.date;
      const d = dRaw ? new Date(String(dRaw)) : new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setInvoiceDate(`${yyyy}-${mm}-${dd}`);

      const discountDb = typeof inv?.discount === 'number' ? inv.discount : Number(inv?.discount ?? 0);
      setDiscountValue(Number.isFinite(discountDb) ? String(discountDb) : '0');

      const items = Array.isArray(inv?.items) ? inv.items : [];
      setLines(
        items.map((it: any) => ({
          id: String(it?.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`),
          name: String(it?.name || '').trim(),
          quantity: Number(it?.quantity) || 1,
          price: Number(it?.unitPrice ?? it?.unit_price ?? it?.price) || 0,
        })).filter((it: any) => it.name),
      );

      setView('edit');
    } catch (e: any) {
      setSaveError(String(e?.message || 'Error opening invoice'));
      setView('manage');
    } finally {
      setSaving(false);
    }
  };

  const saveInvoice = async () => {
    if (lines.length === 0) {
      setSaveError(isArabic ? 'يجب إضافة بند واحد على الأقل' : 'Add at least one line item');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveOk('');
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) throw new Error('Shop ID not found');

      const payload = {
        shopId: sid,
        invoiceDate: invoiceDate,
        discount: Number(discountValue),
        items: lines.map(l => ({
          name: l.name,
          quantity: l.quantity,
          unitPrice: l.price,
        })),
        subtotal,
        taxAmount: vatAmount,
        discountAmount: discount,
        totalAmount: total,
        status: 'draft',
      };

      if (selectedInvoiceId) {
        await apiRequest(`/invoices/${selectedInvoiceId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSaveOk(isArabic ? 'تم تحديث الفاتورة بنجاح' : 'Invoice updated successfully');
      } else {
        const res = await apiRequest('/invoices', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSelectedInvoiceId(String(res?.id || ''));
        setSaveOk(isArabic ? 'تم إنشاء الفاتورة بنجاح' : 'Invoice created successfully');
      }

      setTimeout(() => {
        setSaveOk('');
        loadInvoices();
      }, 2000);
    } catch (e: any) {
      setSaveError(String(e?.message || isArabic ? 'خطأ في حفظ الفاتورة' : 'Error saving invoice'));
    } finally {
      setSaving(false);
    }
  };

  // Professional HTML Printing
  const printInvoice = () => {
    const escapeHtml = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmt = (n: any) => (Number.isFinite(Number(n)) ? Number(n).toFixed(2) : '0.00');

    const linesHtml = lines.map(l => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(l.name)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${l.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${fmt(l.price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${fmt(l.price * l.quantity)}</td>
      </tr>
    `).join('');

    const html = `<!doctype html>
    <html dir="${isArabic ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="utf-8"/>
      <title>${escapeHtml(receiptTheme.shopName || 'Invoice')}</title>
      <style>
        @page { margin: 10mm; size: A4; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #f5f5f5;
        }
        .invoice-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #BD00FF;
        }
        .logo img { max-height: 60px; max-width: 200px; }
        .shop-info h1 { margin: 0; color: #BD00FF; font-size: 24px; }
        .shop-info p { margin: 5px 0; color: #666; font-size: 14px; }
        .invoice-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
        }
        .meta-item { flex: 1; }
        .meta-label { font-weight: bold; color: #333; font-size: 12px; }
        .meta-value { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { 
          background: #BD00FF; 
          color: white; 
          padding: 12px; 
          text-align: ${isArabic ? 'right' : 'left'}; 
          font-weight: bold;
        }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .totals {
          margin-top: 20px;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.final {
          border-bottom: none;
          font-size: 18px;
          font-weight: bold;
          color: #BD00FF;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #BD00FF;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        @media print {
          body { background: white; }
          .invoice-container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo">
            ${receiptTheme.logoDataUrl ? `<img src="${escapeHtml(receiptTheme.logoDataUrl)}" alt="Logo">` : ''}
          </div>
          <div class="shop-info">
            <h1>${escapeHtml(receiptTheme.shopName || 'Shop Name')}</h1>
            <p>${escapeHtml(receiptTheme.address || '')}</p>
            <p>${escapeHtml(receiptTheme.city || '')} | ${escapeHtml(receiptTheme.phone || '')}</p>
          </div>
        </div>

        <div class="invoice-meta">
          <div class="meta-item">
            <div class="meta-label">${isArabic ? 'رقم الفاتورة' : 'Invoice #'}</div>
            <div class="meta-value">${escapeHtml(selectedInvoiceId || 'NEW')}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">${isArabic ? 'التاريخ' : 'Date'}</div>
            <div class="meta-value">${escapeHtml(invoiceDate)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>${isArabic ? 'الصنف' : 'Item'}</th>
              <th style="text-align: center;">${isArabic ? 'الكمية' : 'Qty'}</th>
              <th style="text-align: right;">${isArabic ? 'السعر' : 'Price'}</th>
              <th style="text-align: right;">${isArabic ? 'المجموع' : 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            ${linesHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>${isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span>${fmt(subtotal)}</span>
          </div>
          ${discount > 0 ? `
          <div class="total-row">
            <span>${isArabic ? 'الخصم' : 'Discount'}</span>
            <span>-${fmt(discount)}</span>
          </div>
          ` : ''}
          ${showVat ? `
          <div class="total-row">
            <span>${isArabic ? `ضريبة القيمة المضافة (${vatRatePct}%)` : `VAT (${vatRatePct}%)`}</span>
            <span>${fmt(vatAmount)}</span>
          </div>
          ` : ''}
          <div class="total-row final">
            <span>${isArabic ? 'الإجمالي' : 'Total'}</span>
            <span>${fmt(total)}</span>
          </div>
        </div>

        <div class="footer">
          <p>${escapeHtml(receiptTheme.footerNote || '')}</p>
          <p>${isArabic ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'}</p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      const w = window.open('', '_blank', 'width=800,height=1000');
      if (!w) return;
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => { try { w.print(); } catch {} }, 500);
    } catch (e) {
      console.error('Print error:', e);
    }
  };

  // PDF Export via iframe
  const exportPDF = () => {
    const escapeHtml = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmt = (n: any) => (Number.isFinite(Number(n)) ? Number(n).toFixed(2) : '0.00');

    const linesHtml = lines.map(l => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(l.name)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${l.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${fmt(l.price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${fmt(l.price * l.quantity)}</td>
      </tr>
    `).join('');

    const html = `<!doctype html>
    <html dir="${isArabic ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="utf-8"/>
      <title>${escapeHtml(receiptTheme.shopName || 'Invoice')}</title>
      <style>
        @page { margin: 10mm; size: A4; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px; 
        }
        .invoice-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          padding: 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #BD00FF;
        }
        .logo img { max-height: 60px; max-width: 200px; }
        .shop-info h1 { margin: 0; color: #BD00FF; font-size: 24px; }
        .shop-info p { margin: 5px 0; color: #666; font-size: 14px; }
        .invoice-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
        }
        .meta-item { flex: 1; }
        .meta-label { font-weight: bold; color: #333; font-size: 12px; }
        .meta-value { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { 
          background: #BD00FF; 
          color: white; 
          padding: 12px; 
          text-align: ${isArabic ? 'right' : 'left'}; 
          font-weight: bold;
        }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .totals {
          margin-top: 20px;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.final {
          border-bottom: none;
          font-size: 18px;
          font-weight: bold;
          color: #BD00FF;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #BD00FF;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo">
            ${receiptTheme.logoDataUrl ? `<img src="${escapeHtml(receiptTheme.logoDataUrl)}" alt="Logo">` : ''}
          </div>
          <div class="shop-info">
            <h1>${escapeHtml(receiptTheme.shopName || 'Shop Name')}</h1>
            <p>${escapeHtml(receiptTheme.address || '')}</p>
            <p>${escapeHtml(receiptTheme.city || '')} | ${escapeHtml(receiptTheme.phone || '')}</p>
          </div>
        </div>

        <div class="invoice-meta">
          <div class="meta-item">
            <div class="meta-label">${isArabic ? 'رقم الفاتورة' : 'Invoice #'}</div>
            <div class="meta-value">${escapeHtml(selectedInvoiceId || 'NEW')}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">${isArabic ? 'التاريخ' : 'Date'}</div>
            <div class="meta-value">${escapeHtml(invoiceDate)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>${isArabic ? 'الصنف' : 'Item'}</th>
              <th style="text-align: center;">${isArabic ? 'الكمية' : 'Qty'}</th>
              <th style="text-align: right;">${isArabic ? 'السعر' : 'Price'}</th>
              <th style="text-align: right;">${isArabic ? 'المجموع' : 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            ${linesHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>${isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span>${fmt(subtotal)}</span>
          </div>
          ${discount > 0 ? `
          <div class="total-row">
            <span>${isArabic ? 'الخصم' : 'Discount'}</span>
            <span>-${fmt(discount)}</span>
          </div>
          ` : ''}
          ${showVat ? `
          <div class="total-row">
            <span>${isArabic ? `ضريبة القيمة المضافة (${vatRatePct}%)` : `VAT (${vatRatePct}%)`}</span>
            <span>${fmt(vatAmount)}</span>
          </div>
          ` : ''}
          <div class="total-row final">
            <span>${isArabic ? 'الإجمالي' : 'Total'}</span>
            <span>${fmt(total)}</span>
          </div>
        </div>

        <div class="footer">
          <p>${escapeHtml(receiptTheme.footerNote || '')}</p>
          <p>${isArabic ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'}</p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('PDF export error:', e);
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 1000);
      };
    } catch (e) {
      console.error('PDF export error:', e);
    }
  };

  // Load Receipt Theme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const shopData = await apiRequest('/shops/me');
        const sid = shopData?.id;
        if (!sid) return;

        // Try to load receipt theme from local storage or API
        const stored = localStorage.getItem(`receipt_theme_${sid}`);
        if (stored) {
          const theme = JSON.parse(stored);
          setReceiptTheme({
            shopName: String(theme?.shopName || shopData?.name || ''),
            phone: String(theme?.phone || shopData?.phone || ''),
            city: String(theme?.city || shopData?.city || ''),
            address: String(theme?.address || shopData?.address || ''),
            logoDataUrl: String(theme?.logoDataUrl || shopData?.logoUrl || ''),
            footerNote: String(theme?.footerNote || ''),
            vatRatePercent: Number(theme?.vatRatePercent || 0),
          });
        } else {
          setReceiptTheme({
            shopName: String(shopData?.name || ''),
            phone: String(shopData?.phone || ''),
            city: String(shopData?.city || ''),
            address: String(shopData?.address || ''),
            logoDataUrl: String(shopData?.logoUrl || ''),
            footerNote: '',
            vatRatePercent: 0,
          });
        }
      } catch (e) {
        console.error('Error loading theme:', e);
      }
    };

    loadTheme();

    const handleThemeUpdate = () => {
      loadTheme();
    };

    window.addEventListener('receipt-theme-update', handleThemeUpdate);
    return () => window.removeEventListener('receipt-theme-update', handleThemeUpdate);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    try {
      await apiRequest(`/invoices/${id}`, { method: 'DELETE' });
      loadInvoices();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadInvoices]);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/invoices/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      loadInvoices();
    } catch (error) {
      alert('حدث خطأ أثناء تغيير الحالة');
    }
  }, [loadInvoices]);

  const handleSend = useCallback(async (id: string) => {
    try {
      await apiRequest(`/invoices/${id}/send`, { method: 'POST' });
      alert('تم إرسال الفاتورة بنجاح');
      loadInvoices();
    } catch (error) {
      alert('حدث خطأ أثناء الإرسال');
    }
  }, [loadInvoices]);

  const openEditModal = useCallback((invoice: Invoice) => {
    setEditInvoice(invoice);
    setFormData({
      customerId: invoice.customerId,
      issueDate: invoice.issueDate.split('T')[0],
      dueDate: invoice.dueDate,
      notes: invoice.notes,
    });
    setEditModal(true);
  }, []);

  const STATUS_CONFIG = {
    draft: { label: 'مسودة', color: 'bg-slate-50 text-slate-600', icon: <FileText size={12} /> },
    sent: { label: 'مرسلة', color: 'bg-blue-50 text-blue-600', icon: <Send size={12} /> },
    viewed: { label: 'تمت المشاهدة', color: 'bg-cyan-50 text-cyan-600', icon: <Eye size={12} /> },
    paid: { label: 'مدفوعة', color: 'bg-green-50 text-green-600', icon: <CheckCircle2 size={12} /> },
    overdue: { label: 'متأخرة', color: 'bg-red-50 text-red-700', icon: <AlertTriangle size={12} /> },
    cancelled: { label: 'ملغاة', color: 'bg-red-50 text-red-600', icon: <XCircle size={12} /> },
  };

  const stats = useMemo(() => {
    const total = invoices.length;
    const draft = invoices.filter(i => i.status === 'draft').length;
    const sent = invoices.filter(i => i.status === 'sent').length;
    const paid = invoices.filter(i => i.status === 'paid').length;
    const overdue = invoices.filter(i => i.status === 'overdue').length;
    const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const paidAmount = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    return [
      { label: 'إجمالي الفواتير', value: total, icon: FileText, color: 'bg-blue-50 text-blue-600' },
      { label: 'مسودة', value: draft, icon: FileText, color: 'bg-slate-50 text-slate-600' },
      { label: 'مرسلة', value: sent, icon: Send, color: 'bg-blue-50 text-blue-600' },
      { label: 'مدفوعة', value: paid, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'متأخرة', value: overdue, icon: AlertTriangle, color: 'bg-red-50 text-red-700' },
      { label: 'إجمالي القيمة', value: `ج.م ${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
      { label: 'المدفوع', value: `ج.م ${paidAmount.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    ];
  }, [invoices]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <FileText size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الفواتير</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة فواتير العملاء</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <button onClick={openNewInvoice} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
            <Plus size={18} />
            {isArabic ? 'فاتورة جديدة' : 'New Invoice'}
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
            <Download size={18} />
            {isArabic ? 'تصدير CSV' : 'Export CSV'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
            <Upload size={18} />
            {isArabic ? 'استيراد' : 'Import'}
          </button>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{selectedIds.size} محدد</span>
            <button onClick={bulkSend} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all">
              <Send size={14} />
              إرسال
            </button>
            <button onClick={bulkDelete} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition-all">
              <Trash2 size={14} />
              حذف
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      {view === 'manage' && (
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث برقم الفاتورة أو العميل...' : 'Search by invoice # or customer...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      )}

      {/* Invoice Editor View */}
      {view === 'edit' && (
        <div className="space-y-6">
          {/* Editor Header */}
          <div className="flex items-center justify-between">
            <button onClick={() => setView('manage')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all">
              <ArrowRight size={18} className={isArabic ? 'rotate-180' : ''} />
              {isArabic ? 'عودة' : 'Back'}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={printInvoice} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
                <Printer size={18} />
                {isArabic ? 'طباعة' : 'Print'}
              </button>
              <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-all">
                <FileDown size={18} />
                {isArabic ? 'تصدير PDF' : 'Export PDF'}
              </button>
              <button onClick={saveInvoice} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all disabled:opacity-50">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isArabic ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>

          {/* Save Status */}
          {saveError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
              {saveError}
            </div>
          )}
          {saveOk && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
              {saveOk}
            </div>
          )}

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{isArabic ? 'تاريخ الفاتورة' : 'Invoice Date'}</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{isArabic ? 'الخصم' : 'Discount'}</label>
              <input
                type="number"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* Invoice Lines */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">{isArabic ? 'بنود الفاتورة' : 'Invoice Items'}</h3>
            </div>
            
            {/* Add New Line */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={isArabic ? 'اسم الصنف' : 'Item name'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    value={newQty}
                    onChange={e => setNewQty(e.target.value)}
                    placeholder={isArabic ? 'الكمية' : 'Qty'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="col-span-4 md:col-span-3">
                  <input
                    type="number"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    placeholder={isArabic ? 'السعر' : 'Price'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="col-span-4 md:col-span-2 flex gap-1">
                  <button onClick={addLine} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${editLineId ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-[#00E5FF] text-slate-900 hover:bg-[#00B8CC]'}`} title={editLineId ? (isArabic ? 'تحديث' : 'Update') : (isArabic ? 'إضافة' : 'Add')}>
                    {editLineId ? <Save size={18} /> : <Plus size={18} />}
                  </button>
                  {editLineId && (
                    <button onClick={cancelEditLine} className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center" title={isArabic ? 'إلغاء' : 'Cancel'}>
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              {editLineId && (
                <div className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                  {isArabic ? 'وضع التعديل: سيتم تحديث البند المحدد' : 'Edit mode: updating selected item'}
                </div>
              )}
            </div>

            {/* Lines List */}
            <div className="divide-y divide-slate-100">
              {lines.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold text-sm">
                  {isArabic ? 'لا توجد بنود' : 'No items yet'}
                </div>
              ) : (
                lines.map((line, index) => (
                  <div key={line.id} className={`p-4 flex items-center gap-4 hover:bg-slate-50 transition-all ${editLineId === line.id ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}>
                    <div className="flex-1 grid grid-cols-12 gap-3">
                      <div className="col-span-12 md:col-span-5 font-medium text-slate-900">{line.name}</div>
                      <div className="col-span-4 md:col-span-2 text-sm text-slate-600">{line.quantity}x</div>
                      <div className="col-span-4 md:col-span-3 text-sm text-slate-600">{formatMoney(line.price)}</div>
                      <div className="col-span-4 md:col-span-2 font-bold text-slate-900">{formatMoney(line.price * line.quantity)}</div>
                    </div>
                    <button onClick={() => editLine(line.id)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-all" title={isArabic ? 'تعديل' : 'Edit'}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => { removeLine(line.id); if (editLineId === line.id) cancelEditLine(); }} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all" title={isArabic ? 'حذف' : 'Delete'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600">{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="text-lg font-bold text-slate-900">{formatMoney(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">{isArabic ? 'الخصم' : 'Discount'}</span>
                  <span className="text-lg font-bold text-red-600">-{formatMoney(discount)}</span>
                </div>
              )}
              {showVat && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">{isArabic ? `ضريبة القيمة المضافة (${vatRatePct}%)` : `VAT (${vatRatePct}%)`}</span>
                  <span className="text-lg font-bold text-slate-600">{formatMoney(vatAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200">
                <span className="text-lg font-bold text-slate-900">{isArabic ? 'الإجمالي' : 'Total'}</span>
                <span className="text-2xl font-black text-[#BD00FF]">{formatMoney(total)}</span>
              </div>
            </div>
          </div>

          {/* VAT Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">{isArabic ? 'إعدادات الضريبة' : 'Tax Settings'}</h3>
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-slate-700">{isArabic ? 'نسبة ضريبة القيمة المضافة (%)' : 'VAT Rate (%)'}</label>
              <input
                type="number"
                value={receiptTheme.vatRatePercent}
                onChange={e => setReceiptTheme({ ...receiptTheme, vatRatePercent: Number(e.target.value) || 0 })}
                min="0"
                max="100"
                step="0.1"
                className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Manage View */}
      {view === 'manage' && (
        <>
          {/* Advanced Filters */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">الحالة:</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">الكل</option>
                <option value="draft">مسودة</option>
                <option value="sent">مرسلة</option>
                <option value="viewed">تمت المشاهدة</option>
                <option value="paid">مدفوعة</option>
                <option value="overdue">متأخرة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">الترتيب:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="invoiceNumber">رقم الفاتورة</option>
                <option value="issueDate">تاريخ الإصدار</option>
                <option value="totalAmount">القيمة</option>
                <option value="createdAt">تاريخ الإنشاء</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {/* New Invoice Button in List */}
          <div className="flex justify-end">
            <button onClick={openNewInvoice} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
              <Plus size={18} />
              {isArabic ? 'فاتورة جديدة' : 'New Invoice'}
            </button>
          </div>

          {/* Invoices List */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400 font-bold text-sm">{isArabic ? 'لا توجد فواتير حالياً' : 'No invoices yet'}</p>
              <button onClick={openNewInvoice} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
                <Plus size={18} />
                {isArabic ? 'فاتورة جديدة' : 'New Invoice'}
              </button>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="space-y-3 md:hidden">
            {paginatedInvoices.map((invoice) => {
              const statusConfig = STATUS_CONFIG[invoice.status];
              return (
                <div key={invoice.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <button onClick={() => toggleSelect(invoice.id)} className="shrink-0 p-1">
                      {selectedIds.has(invoice.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</div>
                      <div className="text-slate-500 text-xs">{invoice.customerName}</div>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Calendar size={12} />
                    <span>{new Date(invoice.issueDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <DollarSign size={12} />
                    <span>ج.م {invoice.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openInvoiceForEdit(invoice.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-slate-100 transition-all">
                      <Edit size={12} />
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                    <button onClick={() => handleSend(invoice.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs hover:bg-blue-100 transition-all">
                      <Send size={12} />
                      {isArabic ? 'إرسال' : 'Send'}
                    </button>
                    <button onClick={() => handleDelete(invoice.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition-all">
                      <Trash2 size={12} />
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto touch-auto">
              <table className="w-full text-right border-collapse min-w-[1600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.size === paginatedInvoices.length && paginatedInvoices.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500">رقم الفاتورة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">العميل</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">البريد</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">تاريخ الإصدار</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">تاريخ الاستحقاق</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">القيمة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المدفوع</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((invoice) => {
                  const statusConfig = STATUS_CONFIG[invoice.status];
                  return (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <button onClick={() => toggleSelect(invoice.id)} className="p-1">
                          {selectedIds.has(invoice.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{invoice.customerName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{invoice.customerEmail}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(invoice.issueDate).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-EG') : '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">ج.م {invoice.totalAmount.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">ج.م {invoice.paidAmount.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openInvoiceForEdit(invoice.id)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title={isArabic ? 'تعديل' : 'Edit'}>
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleSend(invoice.id)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all" title={isArabic ? 'إرسال' : 'Send'}>
                            <Send size={14} />
                          </button>
                          <button onClick={() => handleDelete(invoice.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title={isArabic ? 'حذف' : 'Delete'}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs font-bold text-slate-500">
                {isArabic ? `عرض ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filtered.length)} من ${filtered.length}` : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filtered.length)} of ${filtered.length}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} className={isArabic ? 'rotate-180' : ''} />
                </button>
                <span className="text-xs font-bold text-slate-600 px-3">
                  {isArabic ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} className={isArabic ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">{isArabic ? 'دليل الفواتير' : 'Invoice Guide'}</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">{isArabic ? 'وظيفة الصفحة' : 'Page Function'}</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">{isArabic ? 'إدارة فواتير العملاء وتتبع المدفوعات مع محرر بنود كامل.' : 'Manage customer invoices and track payments with full line item editor.'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><FileText size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">{isArabic ? 'الميزات' : 'Features'}</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• {isArabic ? 'إنشاء فواتير جديدة مع محرر بنود كامل' : 'Create new invoices with full line item editor'}</li>
                  <li>• {isArabic ? 'إدارة البنود (إضافة/حذف/تعديل)' : 'Manage line items (add/delete/edit)'}</li>
                  <li>• {isArabic ? 'حسابات تلقائية (المجموع، الخصم، الضريبة، الإجمالي)' : 'Automatic calculations (subtotal, discount, tax, total)'}</li>
                  <li>• {isArabic ? 'طباعة احترافية مع تصميم HTML جميل' : 'Professional printing with beautiful HTML design'}</li>
                  <li>• {isArabic ? 'تصدير PDF عبر iframe' : 'PDF export via iframe'}</li>
                  <li>• {isArabic ? 'دعم RTL كامل للعربية والإنجليزية' : 'Full RTL support for Arabic and English'}</li>
                  <li>• {isArabic ? 'ضريبة القيمة المضافة (VAT) مع نسبة مئوية قابلة للتعديل' : 'VAT with adjustable percentage'}</li>
                  <li>• {isArabic ? 'تصميم الإيصال مع Receipt Theme' : 'Receipt design with Receipt Theme'}</li>
                  <li>• {isArabic ? 'تتبع الحالة (مسودة، مرسلة، مدفوعة، متأخرة)' : 'Status tracking (draft, sent, paid, overdue)'}</li>
                  <li>• {isArabic ? 'إحصائيات شاملة للفواتير' : 'Comprehensive invoice statistics'}</li>
                  <li>• {isArabic ? 'تصدير تقارير الفواتير' : 'Export invoice reports'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
