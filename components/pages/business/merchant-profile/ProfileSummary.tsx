import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, ExternalLink } from 'lucide-react';

const { Link } = ReactRouterDOM as any;

interface ProfileSummaryProps {
  user: any;
  shopSlug: string;
  buildDashboardUrl: (tab?: string) => string;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({ user, shopSlug, buildDashboardUrl }) => {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6 flex-row-reverse">
          <div className="w-20 h-20 rounded-[2.25rem] bg-slate-900 flex items-center justify-center text-[#00E5FF] shadow-lg shadow-cyan-500/10">
            <User className="w-9 h-9" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
              {user?.name || 'صاحب العمل'}
            </h1>
            <div className="flex items-center gap-3 justify-end mt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">تاجر</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="text-xs font-bold text-slate-500">{user?.email || ''}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={buildDashboardUrl('settings')}
            className="px-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm text-center hover:bg-black transition-all"
          >
            إعدادات المتجر
          </Link>

          {shopSlug ? (
            <Link
              to={`/shop/${shopSlug}`}
              className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm text-center hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              فتح صفحة المتجر
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfileSummary);
