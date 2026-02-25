import re

with open('components/pages/public/product/ProductDetails.tsx', 'r') as f:
    content = f.read()

target = """        {/* Addons Selection - simplified */}
        {addonsDef.length > 0 && (
          <div className="space-y-4">
            <p className="font-black text-slate-900">الإضافات</p>
            <div className="space-y-3">
              {/* Simplified Addons UI */}
            </div>
          </div>
        )}"""

new_addons_ui = """        {/* Addons Selection */}
        {addonsDef.length > 0 && (
          <div className="space-y-6 text-right">
            <p className="font-black text-slate-900 text-lg">الإضافات المتاحة</p>
            <div className="space-y-4">
              {addonsDef.map((group: any) => (
                <div key={group.id} className="space-y-3">
                  {group.title && group.title !== 'addons' && (
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{group.title}</p>
                  )}
                  <div className="grid grid-cols-1 gap-3">
                    {group.options?.map((opt: any) => (
                      <div key={opt.id} className="p-4 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse gap-4">
                        <div className="flex items-center gap-4 flex-row-reverse">
                          {opt.imageUrl && (
                            <img src={opt.imageUrl} alt={opt.name} className="w-12 h-12 rounded-2xl object-cover bg-white" />
                          )}
                          <div className="text-right">
                            <p className="font-black text-slate-900">{opt.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-start">
                          {opt.variants?.map((v: any) => {
                            const isSelected = selectedAddons.some((a: any) => a.optionId === opt.id && a.variantId === v.id);
                            return (
                              <button
                                key={v.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedAddons((prev: any[]) => prev.filter((a: any) => !(a.optionId === opt.id && a.variantId === v.id)));
                                  } else {
                                    setSelectedAddons((prev: any[]) => [...prev.filter((a: any) => a.optionId !== opt.id), { optionId: opt.id, variantId: v.id }]);
                                  }
                                }}
                                className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${isSelected ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'}`}
                              >
                                {v.label} (+{v.price} ج)
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}"""

if target in content:
    content = content.replace(target, new_addons_ui)
    with open('components/pages/public/product/ProductDetails.tsx', 'w') as f:
        f.write(content)
else:
    print("Target not found exactly")
