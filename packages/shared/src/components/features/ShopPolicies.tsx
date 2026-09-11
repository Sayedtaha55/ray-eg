'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Truck, RefreshCw, Package } from 'lucide-react';

interface Policy {
  type: string;
  title: string;
  content: string;
}

interface ShopPoliciesProps {
  shopSlug: string;
}

const policyIcons: Record<string, React.ElementType> = {
  refund: RefreshCw,
  exchange: Package,
  shipping: Truck,
};

const policyDefaultTitles: Record<string, string> = {
  refund: 'سياسة الاسترداد',
  exchange: 'سياسة الاستبدال',
  shipping: 'سياسة الشحن',
};

export default function ShopPolicies({ shopSlug }: ShopPoliciesProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/v1/shops/${shopSlug}/policies`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setPolicies(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shopSlug]);

  if (loading) {
    return (
      <div className="space-y-3" dir="rtl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (policies.length === 0) return null;

  return (
    <div className="space-y-2" dir="rtl">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">سياسات المتجر</h3>
      {policies.map((policy, index) => {
        const Icon = policyIcons[policy.type] || Package;
        const title = policy.title || policyDefaultTitles[policy.type] || policy.type;
        const isOpen = openIndex === index;

        return (
          <div
            key={policy.type}
            className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[#00E5FF]" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">{title}</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {policy.content}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
