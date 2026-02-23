import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface FormFooterProps {
  loading: boolean;
  isCompressing: boolean;
  compressionProgress: number;
  submitLabel: string;
  processingLabel: string;
}

const FormFooter: React.FC<FormFooterProps> = ({
  loading,
  isCompressing,
  compressionProgress,
  submitLabel,
  processingLabel
}) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 -mx-4 sm:mx-0 bg-white pt-4 pb-4 sm:pb-0 border-t border-slate-100">
      {isCompressing && (
        <div className="mb-4 px-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-slate-500">جاري معالجة ورفع الوسائط...</span>
            <span className="text-xs font-black text-[#00E5FF]">{compressionProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#00E5FF] h-full transition-all duration-300" 
              style={{ width: `${compressionProgress}%` }}
            />
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 disabled:bg-slate-200"
      >
        {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} className="text-[#00E5FF]" />}
        {loading ? processingLabel : submitLabel}
      </button>
    </div>
  );
};

export default FormFooter;
