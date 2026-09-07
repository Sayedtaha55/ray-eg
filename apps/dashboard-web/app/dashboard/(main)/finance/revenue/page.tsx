'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Loader2, Download, Info, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type StatementLine = { code: string; name: string; amount: number };
type IncomeStatement = { shop_id: string; from_date: string; to_date: string; revenue: StatementLine[]; expenses: StatementLine[]; total_revenue: number; net_profit: number; };

function periodRange(p: 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all'): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (dt: Date) => dt.toISOString().split('T')[0];
  switch (p) {
    case 'this_month': return { from: d(new Date(y, m, 1)), to: d(new Date(y, m + 1, 0)) };
    case 'last_month': return { from: d(new Date(y, m - 1, 1)), to: d(new Date(y, m, 0)) };
    case 'this_year': return { from: d(new Date(y, 0, 1)), to: d(new Date(y, 11, 31)) };
    case 'last_year': return { from: d(new Date(y - 1, 0, 1)), to: d(new Date(y - 1, 11, 31)) };
    default: return { from: '', to: d(now) };
  }
}

type PeriodKey = 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all';

export default function RevenuePage() {
  const [current, setCurrent] = useState<IncomeStatement | null>(null);
  const [previous, setPrevious] = useState<IncomeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>('this_year');

  const load = useCallback(async (p: PeriodKey) => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const cur = periodRange(p);
      const q = (f: string, t: string) => { const ps = new URLSearchParams(); if (f) ps.set('from', f); if (t) ps.set('to', t); return ps.toString(); };
      let prev: { from: string; to: string } | null = null;
      if (cur.from && cur.to) {
        const [fy, fm, fd] = cur.from.split('-').map(Number);
        const [ty, tm, td] = cur.to.split('-').map(Number);
        const len = Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000) + 1;
        const pe = new Date(Date.UTC(fy, fm - 1, fd - 1));
        const ps = new Date(pe.getTime() - (len - 1) * 86400000);
        prev = { from: ps.toISOString().split('T')[0], to: pe.toISOString().split('T')[0] };
      }
      const [curRes, prevRes] = await Promise.all([
        apiRequest(`/accounting/reports/income-statement/shop/${sid}?${q(cur.from, cur.to)}`),
        prev ? apiRequest(`/accounting/reports/income-statement/shop/${sid}?${q(prev.from, prev.to)}`).catch(() => null) : Promise.resolve(null),
      ]);
      setCurrent(curRes?.data || curRes || null);
      setPrevious(prevRes ? (prevRes?.data || prevRes) : null);
    } catch { setCurrent(null); setPrevious(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(period); }, [period]);

  const revenueLines = useMemo(() => current?.revenue || [], [current]);
  const totalRevenue = revenueLines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const prevRevenue = (previous?.revenue || []).reduce((s, l) => s + Number(l.amount || 0), 0);
  const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const maxLine = Math.max(1, ...revenueLines.map(l => Math.abs(Number(l.amount || 0))));
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCSV = () => {
    const rows = [['Code', 'Account', 'Amount'], ...revenueLines.map(l => [l.code, l.name, l.amount])];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'revenue.csv'; link.click();
  };
