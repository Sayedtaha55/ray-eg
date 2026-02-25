import re

with open('components/pages/business/pos/POSCart.tsx', 'r') as f:
    content = f.read()

# Using regex with dots matching newlines to find the price and variant block
pattern = re.compile(r'<p className="text-\[#BD00FF\] font-black text-sm">ج\.م {item\.price\.toFixed\(2\)}</p>')

replacement = """<p className="text-[#BD00FF] font-black text-sm">ج.م {item.price.toFixed(2)}</p>
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

new_content = pattern.sub(replacement, content)

with open('components/pages/business/pos/POSCart.tsx', 'w') as f:
    f.write(new_content)
