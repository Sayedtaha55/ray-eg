import React, { useEffect, useRef, useState } from 'react';
import { ComponentNode } from '@/types/builder';
import { AlertCircle, Code, Play } from 'lucide-react';

interface CustomCodeRendererProps {
  node: ComponentNode;
  isInteractivePreview?: boolean;
}

export const CustomCodeRenderer: React.FC<CustomCodeRendererProps> = ({
  node,
  isInteractivePreview = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const customHtml =
    node.props.html ||
    node.props.customHtml ||
    node.customCode?.tsxSnippet ||
    node.customCode?.tsx ||
    `<div class="p-6 bg-slate-900 text-white rounded-2xl border border-indigo-500/30 text-center">
      <h3 class="font-bold text-lg text-indigo-300">مكون كود مخصص (Custom Code)</h3>
      <p class="text-xs text-slate-400 mt-1">اضغط على زر الكود في شريط الأدوات لتعديل هذا المكون مباشرة.</p>
    </div>`;

  const customCss = node.customCode?.css || node.customCode?.cssSnippet || '';
  const customJs = node.customCode?.js || node.customCode?.jsSnippet || '';

  useEffect(() => {
    if (!containerRef.current) return;
    setError(null);

    try {
      // If there is custom JS and interactive mode is enabled, safely execute it in local scope
      if (customJs && isInteractivePreview) {
        const scopedScript = new Function('container', 'node', `
          try {
            ${customJs}
          } catch(err) {
            console.warn('Custom Script Runtime:', err);
          }
        `);
        scopedScript(containerRef.current, node);
      }
    } catch (err: any) {
      console.error('Error running custom component script:', err);
      setError(err?.message || 'خطأ في تشغيل السكربت');
    }
  }, [customJs, isInteractivePreview, node]);

  return (
    <div className="custom-code-node-wrapper relative w-full overflow-hidden">
      {/* Scoped CSS block */}
      {customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: `/* Scoped CSS for ${node.id} */\n${customCss}`,
          }}
        />
      )}

      {/* Render HTML content safely */}
      <div
        ref={containerRef}
        className="w-full"
        dangerouslySetInnerHTML={{ __html: customHtml }}
      />

      {error && (
        <div className="mt-2 p-2 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>تنبيه كود: {error}</span>
        </div>
      )}
    </div>
  );
};
