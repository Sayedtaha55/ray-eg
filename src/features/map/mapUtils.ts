export function buildShopMarkerHtml(name: string, city: string) {
  return `<div dir="rtl" style="display:flex; flex-direction:column; align-items:center; gap:7px; transform:translateZ(0);">
    <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.96); border:1px solid rgba(226,232,240,0.95); border-radius:999px; padding:8px 12px; box-shadow:0 14px 30px rgba(15,23,42,0.16); cursor:pointer; user-select:none; transition:transform 160ms ease, box-shadow 160ms ease;">
      <div style="display:flex; flex-direction:column; text-align:right; line-height:1.2; min-width:0;">
        <div style="font-weight:950; font-size:12px; color:#0f172a; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</div>
        <div style="font-weight:800; font-size:10px; color:#64748b; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${city}</div>
      </div>
      <div style="background:#0f172a; color:#ffffff; font-weight:950; font-size:10px; padding:5px 12px; border-radius:999px; white-space:nowrap; letter-spacing:0.2px;">زيارة</div>
    </div>
    <div style="width:10px; height:10px; background:#0f172a; border:2px solid #ffffff; border-radius:999px; box-shadow:0 10px 22px rgba(15,23,42,0.20);"></div>
  </div>`;
}

export function buildListingMarkerHtml(name: string, city: string) {
  return `<div dir="rtl" style="display:flex; flex-direction:column; align-items:center; gap:7px; transform:translateZ(0);">
    <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.96); border:1px solid rgba(234,179,8,0.45); border-radius:999px; padding:8px 12px; box-shadow:0 14px 30px rgba(15,23,42,0.16); cursor:pointer; user-select:none; transition:transform 160ms ease, box-shadow 160ms ease;">
      <div style="display:flex; flex-direction:column; text-align:right; line-height:1.2; min-width:0;">
        <div style="font-weight:950; font-size:12px; color:#0f172a; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</div>
        <div style="font-weight:800; font-size:10px; color:#64748b; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${city}</div>
      </div>
      <div style="background:#eab308; color:#ffffff; font-weight:950; font-size:10px; padding:5px 12px; border-radius:999px; white-space:nowrap; letter-spacing:0.2px;">نشاط</div>
    </div>
    <div style="width:10px; height:10px; background:#eab308; border:2px solid #ffffff; border-radius:999px; box-shadow:0 10px 22px rgba(15,23,42,0.20);"></div>
  </div>`;
}

export function escapeHtml(input: string) {
  const s = String(input ?? '');
  return s.replace(/[&<>"']/g, (ch) => {
    if (ch === '&') return '&amp;';
    if (ch === '<') return '&lt;';
    if (ch === '>') return '&gt;';
    if (ch === '"') return '&quot;';
    return '&#39;';
  });
}
