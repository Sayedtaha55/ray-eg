import re

with open('components/pages/business/POSSystem.tsx', 'r') as f:
    content = f.read()

# Improved regex to handle nested content
start_marker = '<AnimatePresence>\n        {isConfigOpen && configProduct && ('
end_marker = '      </AnimatePresence>'

start_index = content.find(start_marker)
end_index = content.find(end_marker, start_index) + len(end_marker)

if start_index != -1 and end_index != -1:
    new_modal = """      <AnimatePresence>
        {isConfigOpen && configProduct && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/40 flex items-center justify-center p-4">
            <MotionDiv initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-md bg-white rounded-[2rem] p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">{configProduct.name}</h3>
                <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-black">
                  <ChevronRight className="rotate-180" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Restaurant Types & Sizes */}
                {isRestaurant && (configProduct.menuVariants || configProduct.menu_variants)?.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-black text-sm text-slate-500 text-right">اختر النوع</p>
                    <div className="flex flex-wrap gap-2 justify-start flex-row-reverse">
                      {(configProduct.menuVariants || configProduct.menu_variants).map((t: any) => (
                        <button
                          key={t.id || t.typeId}
                          onClick={() => {
                            setSelectedMenuTypeId(t.id || t.typeId);
                            if (t.sizes?.length > 0) setSelectedMenuSizeId(t.sizes[0].id || t.sizes[0].sizeId);
                          }}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedMenuTypeId === (t.id || t.typeId) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>

                    {selectedMenuTypeId && (
                      <>
                        <p className="font-black text-sm text-slate-500 text-right">اختر الحجم</p>
                        <div className="flex flex-wrap gap-2 justify-start flex-row-reverse">
                          {(configProduct.menuVariants || configProduct.menu_variants)
                            .find((t: any) => (t.id || t.typeId) === selectedMenuTypeId)
                            ?.sizes?.map((s: any) => (
                              <button
                                key={s.id || s.sizeId}
                                onClick={() => setSelectedMenuSizeId(s.id || s.sizeId)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedMenuSizeId === (s.id || s.sizeId) ? 'bg-[#00E5FF] text-black' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {s.label} ({s.price} ج.م)
                              </button>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Fashion Colors & Sizes */}
                {isFashion && configProduct.colors?.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-black text-sm text-slate-500 text-right">اللون</p>
                    <div className="flex flex-wrap gap-3 justify-start flex-row-reverse">
                      {configProduct.colors.map((c: any) => (
                        <button
                          key={c.value}
                          onClick={() => setSelectedFashionColorValue(c.value)}
                          className={`w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all ${selectedFashionColorValue === c.value ? 'ring-slate-900 scale-110' : 'ring-transparent'}`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {isFashion && configProduct.sizes?.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-black text-sm text-slate-500 text-right">المقاس</p>
                    <div className="flex flex-wrap gap-2 justify-start flex-row-reverse">
                      {configProduct.sizes.map((s: any) => (
                        <button
                          key={s.label}
                          onClick={() => setSelectedFashionSize(s.label)}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedFashionSize === s.label ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {s.label} {s.price ? `(${s.price} ج.م)` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pack Options (Supermarket/Herbalist) */}
                {(configProduct.packOptions || configProduct.pack_options)?.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-black text-sm text-slate-500 text-right">اختر العبوة / الوزن</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(configProduct.packOptions || configProduct.pack_options).map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPackId(p.id)}
                          className={`p-3 rounded-xl border-2 text-right transition-all ${selectedPackId === p.id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100'}`}
                        >
                          <div className="font-bold text-xs">{p.qty} {configProduct.unit || ''}</div>
                          <div className="font-black text-[#00E5FF]">{p.price} ج.م</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Restaurant Addons */}
                {isRestaurant && shopAddonsDef.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-black text-sm text-slate-500 text-right">إضافات</p>
                    <div className="space-y-2">
                      {shopAddonsDef.map((group: any) => (
                        <div key={group.id} className="space-y-2">
                          {group.options?.map((opt: any) => (
                            <div key={opt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl flex-row-reverse">
                              <span className="font-bold text-sm">{opt.name}</span>
                              <div className="flex gap-1 flex-row-reverse">
                                {opt.variants?.map((v: any) => {
                                  const isSelected = selectedAddons.some(a => a.optionId === opt.id && a.variantId === v.id);
                                  return (
                                    <button
                                      key={v.id}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedAddons(prev => prev.filter(a => !(a.optionId === opt.id && a.variantId === v.id)));
                                        } else {
                                          setSelectedAddons(prev => [...prev.filter(a => a.optionId !== opt.id), { optionId: opt.id, variantId: v.id }]);
                                        }
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${isSelected ? 'bg-[#00E5FF] text-black' : 'bg-white text-slate-400 border'}`}
                                    >
                                      {v.label} (+{v.price})
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-2">
                <button
                  onClick={() => {
                    const lineId = `${configProduct.id}-${Date.now()}`;

                    let finalPrice = getProductEffectivePrice(configProduct);
                    let variantSelection: any = null;

                    if (isRestaurant && selectedMenuTypeId && selectedMenuSizeId) {
                      const type = (configProduct.menuVariants || configProduct.menu_variants).find((t: any) => (t.id || t.typeId) === selectedMenuTypeId);
                      const size = type?.sizes?.find((s: any) => (s.id || s.sizeId) === selectedMenuSizeId);
                      if (size) {
                        finalPrice = size.price;
                        variantSelection = {
                          typeId: type.id || type.typeId,
                          typeName: type.name,
                          sizeId: size.id || size.sizeId,
                          sizeLabel: size.label,
                          price: size.price
                        };
                      }
                    } else if (isFashion) {
                      const size = configProduct.sizes?.find((s: any) => s.label === selectedFashionSize);
                      if (size && size.price) finalPrice = size.price;
                      variantSelection = {
                        kind: 'fashion',
                        colorName: configProduct.colors?.find((c: any) => c.value === selectedFashionColorValue)?.name || '',
                        colorValue: selectedFashionColorValue,
                        size: selectedFashionSize
                      };
                    } else if (selectedPackId) {
                      const pack = (configProduct.packOptions || configProduct.pack_options).find((p: any) => p.id === selectedPackId);
                      if (pack) {
                        finalPrice = pack.price;
                        variantSelection = { kind: 'pack', packId: selectedPackId };
                      }
                    }

                    const addonsData: any[] = [];
                    selectedAddons.forEach(sa => {
                      const group = shopAddonsDef.find((g: any) => g.options?.some((o: any) => o.id === sa.optionId));
                      const opt = group?.options?.find((o: any) => o.id === sa.optionId);
                      const v = opt?.variants?.find((v: any) => v.id === sa.variantId);
                      if (v) {
                        finalPrice += v.price;
                        addonsData.push({
                          optionId: sa.optionId,
                          optionName: opt.name,
                          variantId: sa.variantId,
                          variantLabel: v.label,
                          price: v.price
                        });
                      }
                    });

                    setCart(prev => [...prev, {
                      id: lineId,
                      productId: configProduct.id,
                      name: configProduct.name,
                      price: finalPrice,
                      quantity: 1,
                      variantSelection,
                      addons: addonsData
                    }]);
                    setIsConfigOpen(false);
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl"
                >
                  إضافة للسلة
                </button>
                <button onClick={() => setIsConfigOpen(false)} className="w-full py-2 text-slate-400 font-bold">إلغاء</button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )
      }
      </AnimatePresence>"""
    content = content[:start_index] + new_modal + content[end_index:]
    with open('components/pages/business/POSSystem.tsx', 'w') as f:
        f.write(content)
else:
    print("Could not find markers")
    print("Start index:", start_index)
    print("End index:", end_index)
