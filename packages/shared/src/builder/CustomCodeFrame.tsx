'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ComponentNode } from './types';

// Ported from the dashboard's CustomCodeRenderer: custom HTML+CSS+JS run
// inside a sandboxed iframe (allow-scripts only) that reports its height.
export const CustomCodeFrame: React.FC<{ node: ComponentNode }> = ({ node }) => {
  const [iframeHeight, setIframeHeight] = useState<number>(180);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const customHtml: string =
    node.props.html ||
    node.props.customHtml ||
    node.customCode?.tsxSnippet ||
    node.customCode?.tsx ||
    '';

  const customCss = node.customCode?.css || node.customCode?.cssSnippet || '';
  const customJs = node.customCode?.js || node.customCode?.jsSnippet || '';

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

  if (!customHtml) return null;

  return (
    <div className="custom-code-node-wrapper relative w-full overflow-hidden">
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
    ${customJs}
  })();
</script>
</body>
</html>`}
      />
    </div>
  );
};
