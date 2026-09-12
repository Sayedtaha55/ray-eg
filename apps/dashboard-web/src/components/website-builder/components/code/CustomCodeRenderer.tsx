import React, { useEffect, useRef, useState } from 'react';
import { ComponentNode } from '../../types/builder';
import { AlertCircle } from 'lucide-react';

interface CustomCodeRendererProps {
  node: ComponentNode;
  isInteractivePreview?: boolean;
}

export const CustomCodeRenderer: React.FC<CustomCodeRendererProps> = ({
  node,
  isInteractivePreview = false,
}) => {
  const [iframeHeight, setIframeHeight] = useState<number>(180);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Listen for height reports from the sandboxed iframe so the canvas
  // sizes the component correctly. Only trust messages from our own iframe.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data;
      if (d && d.type === 'custom-code-height' && d.id === node.id && typeof d.height === 'number') {
        setIframeHeight(Math.max(40, Math.min(d.height + 8, 4000)));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [node.id]);

  return (
    <div className="custom-code-node-wrapper relative w-full overflow-hidden">
      {/* Custom HTML+CSS+JS are rendered inside a sandboxed iframe so the
          code cannot access the parent page, cookies, or localStorage.
          sandbox="allow-scripts" (without allow-same-origin) keeps it
          isolated: scripts run but cannot touch our origin. */}
      <iframe
        ref={iframeRef}
        title={`custom-code-${node.id}`}
        sandbox="allow-scripts"
        className="w-full border-0 bg-transparent"
        style={{ height: iframeHeight }}
        srcDoc={`<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; overflow-x: hidden; }
  ${customCss}
</style>
</head>
<body>
${customHtml}
<script>
  (function () {
    function reportHeight() {
      try {
        parent.postMessage({ type: 'custom-code-height', id: '${node.id}', height: document.documentElement.scrollHeight }, '*');
      } catch (e) {}
    }
    window.addEventListener('load', reportHeight);
    window.addEventListener('resize', reportHeight);
    setTimeout(reportHeight, 50);
    setTimeout(reportHeight, 500);
    ${isInteractivePreview ? `
    try {
      (function (container, node) {
        ${customJs}
      })(document.body, ${JSON.stringify({ id: node.id, props: node.props || {} })});
    } catch (err) {
      console.warn('Custom Script Runtime:', err);
    }` : ''}
  })();
</script>
</body>
</html>`}
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
