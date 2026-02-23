import React, { useEffect, useMemo, useState, memo } from 'react';
import { CheckCircle2, Eye, XCircle, Clock, Loader2, MoreVertical } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import Modal from '@/components/common/ui/Modal';

type Props = { sales: any[] };

const OrderRow = memo(({ 
  sale, 
  updatingId, 
  openMenuId, 
  setOpenMenuId, 
  updateStatus, 
  openDetails, 
  statusMeta, 
  renderDeliveryFee 
}: any) => {
  const id = String(sale?.id || '').trim();
  const meta = statusMeta(sale?.status);
  const status = String(sale?.status || '').toUpperCase();
  const busy = updatingId === id;
  const canAccept = status === 'PENDING';
  const canInProgress = status === 'PENDING' || status === 'CONFIRMED';
  const canReject = status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING';

  return (
    <div className="border border-slate-100 rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-black text-slate-900">#{String(sale.id).slice(0, 8).toUpperCase()}</div>
          <div className="text-slate-500 font-bold text-xs mt-1">
            {new Date(sale.created_at || sale.createdAt).toLocaleString('ar-EG')}
          </div>
        </div>
        <span className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black ${meta.cls}`}>{meta.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التعداد</div>
          <div className="mt-2 font-black text-slate-900 text-sm">{sale.items?.length || 0} صنف</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</div>
          <div className="mt-2 font-black text-slate-900 text-sm">ج.م {Number(sale.total || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-slate-500 font-bold text-xs">رسوم التوصيل: {renderDeliveryFee(sale)}</div>

        <div className="flex items-center gap-2" data-sales-actions-menu="1">
          <button
            onClick={() => openDetails(sale)}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <Eye size={18} />
          </button>

          <div className="relative" data-sales-actions-menu="1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === id ? '' : id);
              }}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
              data-sales-actions-menu="1"
            >
              <MoreVertical size={18} />
            </button>

            {openMenuId === id && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-10"
                data-sales-actions-menu="1"
              >
                <button
                  disabled={!canAccept || busy}
                  onClick={() => {
                    setOpenMenuId('');
                    updateStatus(id, 'CONFIRMED');
                  }}
                  className={`w-full text-right px-4 py-3 font-black text-xs ${!canAccept || busy ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-700 hover:bg-emerald-50'}`}
                  data-sales-actions-menu="1"
                >
                  {busy && canAccept ? '...' : 'قبول'}
                </button>
                <button
                  disabled={!canInProgress || busy}
                  onClick={() => {
                    setOpenMenuId('');
                    updateStatus(id, 'PREPARING');
                  }}
                  className={`w-full text-right px-4 py-3 font-black text-xs ${!canInProgress || busy ? 'text-slate-300 cursor-not-allowed' : 'text-amber-700 hover:bg-amber-50'}`}
                  data-sales-actions-menu="1"
                >
                  {busy && canInProgress ? '...' : 'قيد التنفيذ'}
                </button>
                <button
                  disabled={!canReject || busy}
                  onClick={() => {
                    setOpenMenuId('');
                    updateStatus(id, 'CANCELLED');
                  }}
                  className={`w-full text-right px-4 py-3 font-black text-xs ${!canReject || busy ? 'text-slate-300 cursor-not-allowed' : 'text-red-700 hover:bg-red-50'}`}
                  data-sales-actions-menu="1"
                >
                  {busy && canReject ? '...' : 'رفض'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const OrderTableRow = memo(({ 
  sale, 
  updatingId, 
  updateStatus, 
  openDetails, 
  statusMeta, 
  renderDeliveryFee 
}: any) => {
  const id = String(sale?.id || '').trim();
  const meta = statusMeta(sale?.status);
  const status = String(sale?.status || '').toUpperCase();
  const busy = updatingId === id;
  const canAccept = status === 'PENDING';
  const canInProgress = status === 'PENDING' || status === 'CONFIRMED';
  const canReject = status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING';

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="p-6 font-black text-slate-900">#{String(sale.id).slice(0, 8).toUpperCase()}</td>
      <td className="p-6 text-slate-500 font-bold text-sm">{new Date(sale.created_at || sale.createdAt).toLocaleString('ar-EG')}</td>
      <td className="p-6 text-slate-500 font-black text-sm">{sale.items?.length || 0} صنف</td>
      <td className="p-6">
        <span className={`px-4 py-2 rounded-full text-[10px] font-black ${meta.cls}`}>{meta.label}</span>
      </td>
      <td className="p-6 text-slate-500 font-black text-sm">
        {renderDeliveryFee(sale)}
      </td>
      <td className="p-6">
        <span className="text-xl font-black text-[#00E5FF]">ج.م {Number(sale.total || 0).toLocaleString()}</span>
      </td>
      <td className="p-6">
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            disabled={!canAccept || busy}
            onClick={() => updateStatus(id, 'CONFIRMED')}
            className={`px-4 py-2 rounded-xl font-black text-[10px] ${!canAccept || busy ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
          >
            {busy && canAccept ? <Loader2 size={14} className="animate-spin inline" /> : 'قبول'}
          </button>
          <button
            disabled={!canInProgress || busy}
            onClick={() => updateStatus(id, 'PREPARING')}
            className={`px-4 py-2 rounded-xl font-black text-[10px] ${!canInProgress || busy ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'}`}
          >
            {busy && canInProgress ? <Loader2 size={14} className="animate-spin inline" /> : 'قيد التنفيذ'}
          </button>
          <button
            disabled={!canReject || busy}
            onClick={() => updateStatus(id, 'CANCELLED')}
            className={`px-4 py-2 rounded-xl font-black text-[10px] ${!canReject || busy ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'}`}
          >
            {busy && canReject ? <Loader2 size={14} className="animate-spin inline" /> : 'رفض'}
          </button>
        </div>
      </td>
      <td className="p-6 text-left">
        <button
          onClick={() => openDetails(sale)}
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
});

const SalesTab: React.FC<Props> = ({ sales }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'successful' | 'rejected'>('all');
  const [localSales, setLocalSales] = useState<any[]>(Array.isArray(sales) ? sales : []);
  const [updatingId, setUpdatingId] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string>('');

  useEffect(() => {
    setLocalSales(Array.isArray(sales) ? sales : []);
  }, [sales]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-sales-actions-menu="1"]')) return;
      setOpenMenuId('');
    };

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const statusMeta = (status: any) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DELIVERED') return { label: 'تم التوصيل', cls: 'bg-green-50 text-green-600' };
    if (s === 'READY') return { label: 'جاهز', cls: 'bg-blue-50 text-blue-600' };
    if (s === 'PREPARING') return { label: 'قيد التنفيذ', cls: 'bg-amber-50 text-amber-600' };
    if (s === 'CONFIRMED') return { label: 'تم القبول', cls: 'bg-emerald-50 text-emerald-600' };
    if (s === 'CANCELLED') return { label: 'مرفوض', cls: 'bg-red-50 text-red-600' };
    if (s === 'REFUNDED') return { label: 'مسترجع', cls: 'bg-red-50 text-red-600' };
    return { label: 'قيد المراجعة', cls: 'bg-slate-50 text-slate-600' };
  };

  const isSuccessful = (o: any) => {
    const s = String(o?.status || '').toUpperCase();
    return s === 'CONFIRMED' || s === 'PREPARING' || s === 'READY' || s === 'DELIVERED';
  };

  const isRejected = (o: any) => String(o?.status || '').toUpperCase() === 'CANCELLED';
  const isPending = (o: any) => String(o?.status || '').toUpperCase() === 'PENDING';

  const counts = useMemo(() => {
    const total = localSales.length;
    const successful = localSales.filter(isSuccessful).length;
    const rejected = localSales.filter(isRejected).length;
    const pending = localSales.filter(isPending).length;
    return { total, successful, rejected, pending };
  }, [localSales]);

  const filteredSales = useMemo(() => {
    if (filter === 'successful') return localSales.filter(isSuccessful);
    if (filter === 'rejected') return localSales.filter(isRejected);
    if (filter === 'pending') return localSales.filter(isPending);
    return localSales;
  }, [filter, localSales]);

  const updateStatus = async (id: string, status: string) => {
    const orderId = String(id || '').trim();
    if (!orderId) return;
    setUpdatingId(orderId);
    try {
      const updated = await ApiService.updateOrder(orderId, { status });
      setLocalSales((prev) => prev.map((o) => (String(o?.id) === String(updated?.id) ? { ...o, ...updated } : o)));
      try {
        window.dispatchEvent(new Event('orders-updated'));
      } catch {
      }
    } finally {
      setUpdatingId('');
    }
  };

  const openDetails = (sale: any) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedSale(null);
  };

  const renderDeliveryFee = (sale: any) => {
    const raw = typeof sale?.notes === 'string' ? sale.notes : '';
    const lines = raw
      .split(/\r?\n/)
      .map((l: any) => String(l).trim())
      .filter(Boolean);
    const feeLine = lines.find((l: any) => String(l).toUpperCase().startsWith('DELIVERY_FEE:'));
    if (!feeLine) return '-';
    const value = String(feeLine).split(':').slice(1).join(':').trim();
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return '-';
    return `ج.م ${n}`;
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-10 flex-row-reverse">
        <h3 className="text-3xl font-black">سجل الفواتير والعمليات</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('successful')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'successful' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}
          >
            <CheckCircle2 size={16} /> {counts.successful} عملية ناجحة
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}
          >
            <XCircle size={16} /> {counts.rejected} عملية مرفوضة
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}
          >
            <Clock size={16} /> {counts.pending} قيد المراجعة
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
          >
            الكل ({counts.total})
          </button>
        </div>
      </div>

      <div className="md:hidden space-y-4" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}>
        {filteredSales.map((sale) => (
          <OrderRow
            key={sale.id}
            sale={sale}
            updatingId={updatingId}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            updateStatus={updateStatus}
            openDetails={openDetails}
            statusMeta={statusMeta}
            renderDeliveryFee={renderDeliveryFee}
          />
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto no-scrollbar" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
        <table className="w-full text-right border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الفاتورة</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ والوقت</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">التعداد</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">رسوم التوصيل</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجراءات</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <OrderTableRow
                key={sale.id}
                sale={sale}
                updatingId={updatingId}
                updateStatus={updateStatus}
                openDetails={openDetails}
                statusMeta={statusMeta}
                renderDeliveryFee={renderDeliveryFee}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={detailsOpen} onClose={closeDetails} title="تفاصيل الطلب" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الفاتورة</div>
              <div className="mt-2 text-white font-black">#{String(selectedSale?.id || '').slice(0, 8).toUpperCase()}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</div>
              <div className="mt-2 text-white font-black">{statusMeta(selectedSale?.status).label}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ والوقت</div>
              <div className="mt-2 text-white font-black">
                {selectedSale ? new Date(selectedSale?.created_at || selectedSale?.createdAt).toLocaleString('ar-EG') : '-'}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</div>
              <div className="mt-2 text-white font-black">ج.م {Number(selectedSale?.total || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">بيانات العميل</div>
            <div className="mt-3 text-white font-bold text-sm space-y-1">
              <div>الاسم: {selectedSale?.user?.fullName || selectedSale?.user?.name || '-'}</div>
              <div>الهاتف: {selectedSale?.user?.phone || selectedSale?.phone || '-'}</div>
              <div>العنوان: {selectedSale?.address || selectedSale?.user?.address || '-'}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المنتجات</div>
            <div className="mt-3 space-y-2">
              {(Array.isArray(selectedSale?.items) ? selectedSale.items : []).map((it: any, idx: number) => {
                const name = it?.product?.name || it?.name || it?.title || `منتج ${idx + 1}`;
                const qty = Number(it?.quantity || it?.qty || 1);
                const price = Number(it?.price || it?.unitPrice || 0);
                const lineTotal = Number.isFinite(price) ? price * (Number.isFinite(qty) ? qty : 1) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 bg-black/20 border border-white/10 rounded-xl p-3">
                    <div className="text-white font-bold text-sm truncate">{name}</div>
                    <div className="text-slate-200 font-black text-xs shrink-0">
                      {qty} x ج.م {price} = ج.م {Number(lineTotal || 0).toLocaleString()}
                    </div>
                  </div>
                );
              })}
              {!Array.isArray(selectedSale?.items) || selectedSale?.items?.length === 0 ? (
                <div className="text-slate-300 font-bold text-sm">لا توجد منتجات</div>
              ) : null}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ملاحظات</div>
            <div className="mt-3 text-slate-200 font-bold text-sm whitespace-pre-wrap">{selectedSale?.notes || '-'}</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesTab;
