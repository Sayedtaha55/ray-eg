import re

with open('components/pages/business/pos/POSCart.tsx', 'r') as f:
    content = f.read()

search_pattern = r'<p className="text-\[#BD00FF\] font-black text-sm">ج\.م {item\.price\.toFixed\(2\)}</p>'
replace_text = """<p className="text-[#BD00FF] font-black text-sm">ج.م {item.price.toFixed(2)}</p>
                  {item.variantSelection && (
                    <div className="text-[10px] font-bold text-slate-400 mt-1">
                      {item.variantSelection.typeName && `${item.variantSelection.typeName} - `}
                      {item.variantSelection.sizeLabel || item.variantSelection.size || ''}
                      {item.variantSelection.colorName && ` (${item.variantSelection.colorName})`}
                    </div>
                  )}
                  {item.addons?.length > 0 && (
                    <div className="text-[10px] font-bold text-emerald-500 mt-0.5">
                      + {item.addons.map((a: any) => a.optionName || a.variantLabel).join(', ')}
                    </div>
                  )}"""

content = content.replace(search_pattern, replace_text)

with open('components/pages/business/pos/POSCart.tsx', 'w') as f:
    f.write(content)
