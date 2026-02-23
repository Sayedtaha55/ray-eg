import React from 'react';

interface InfoPreviewProps {
  config: any;
  shop: any;
  logoDataUrl: string;
}

const InfoPreview: React.FC<InfoPreviewProps> = ({ config }) => {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between flex-row-reverse">
        <h2 className="text-lg md:text-xl font-black text-slate-900">معلومات المتجر</h2>
        <span className="text-xs font-black text-slate-400">PREVIEW</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-slate-100 bg-white space-y-3 text-right">
          <div className="flex items-center justify-between flex-row-reverse text-sm">
            <span className="font-black text-slate-900">العنوان</span>
            <span className="font-bold text-slate-500">القاهرة، مصر</span>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex items-center justify-between flex-row-reverse text-sm">
            <span className="font-black text-slate-900">ساعات العمل</span>
            <span className="font-bold text-slate-500">يوميًا 10ص - 10م</span>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex items-center justify-between flex-row-reverse text-sm">
            <span className="font-black text-slate-900">التواصل</span>
            <span className="font-bold text-slate-500">0100 000 0000</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100 bg-white">
          <div className="aspect-video rounded-2xl bg-slate-100 border border-slate-200" />
          <p className="mt-3 text-xs font-bold text-slate-400 text-right">مكان الخريطة هنا (معاينة)</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(InfoPreview);
