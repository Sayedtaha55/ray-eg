# 🤖 خطة دمج الذكاء الصناعي في التطبيق — AI Integration Master Plan

> **الهدف**: مساعد ذكي قوي داخل لوحة تحكم التاجر يقدر يفهم أوامر باللغة العادية، يغير التصميم، يضيف مكونات، يكتب أكواد، وينفذ كل حاجة التاجر محتاجها — بأمان وفي وقت حقيقي.

---

# 📚 الجزء الأول: البحوثات المطولة

## 1. بحث: منصات موجودة بتستخدم AI في التصميم

### Shopify Magic + Sidekick
- **Shopify Magic**: محرك AI مدمج داخل الأدمن، بيساعد في:
  - توليد وصف منتجات تلقائي
  - اقتراحات تسويقية (email copy, subject lines)
  - دعم عملاء بالشات
  - توصيات شخصية للزباين
  - ترجمة وتوليد محتوى متعدد اللغات
- **Sidekick**: مساعد AI داخل الأدمن بيعمل كـ "24/7 consultant":
  - بيسأل التاجر سؤال باللغة العادية → Sidekick بيحلل بيانات المتجر → بينفذ الأوامر
  - مثال: "أي عملاء من القاهرة؟" → بيستعلم تلقائي وبيعرض النتائج
  - بيعمل "Agentic Loop": Input → LLM Reasoning → Action → Feedback → Loop
  - **المشكلة اللي واجهوها**: لما زادت الـ Tools من 20 لـ 50+، الـ System Prompt بقى ضخم ومش ممكن يتعمل له maintain
  - **الحل**: JIT (Just-in-Time) Instructions — بيرجع التعليمات المناسبة مع كل tool call مش كلها في prompt واحد
  - **النتيجة**: أداء أحسن، cache أحسن، modular أكثر

### Wix ADI → Wix Harmony
- **Wix ADI** (2016): أول جيل — بيسأل أسئلة بسيطة وبينشئ موقع كامل
- **Wix Harmony** (الجيل الجديد): AI متطور أكتر:
  - بيسأل أسئلة عن نوع الموقع والستايل
  - بينشئ layout كامل مع ألوان وصور
  - بيسمح بالتعديل بالـ prompts
  - بيدعم إضافة مكونات بالوصف
- **الفرق عننا**: Wix بيولد موقع من الصفر، إحنا محتاجين AI يشتغل **فوق** تصميم موجود ويعدّل عليه

### Figma AI
- توليد تصميمات من وصف نصي
- إعادة تلوين تلقائية (Auto-recolor)
- إعادة ترتيب العناصر (Auto-layout)
- توليد نص بديل (Content generation)
- **Figma Make**: بيولد components من prompts مع احترام الـ design system الموجود

### Vercel v0
- بياخد وصف نصي → بيولد React component شغال
- بيدعم iteration: عدّل اللون، غيّر الـ layout، إضافة feature
- بيستخدم shadcn/ui + TailwindCSS
- **النموذج المناسب لنا**: v0 قريب جداً من اللي إحنا محتاجين — وصف → كود → integration

### Framer AI
- Wireframer: بيولد layouts من prompts
- Workshop: بيولد React components مخصصة بالـ AI
- بيسمح بـ 3rd party AI plugins (OpenAI, Anthropic, Gemini)
- **القدرة المميزة**: AI code generation في الـ Workshop مع sandboxing

---

## 2. بحث: أنماط معمارية الـ AI Agent

### ReAct Pattern (Reasoning + Acting)
```
Thought → Action → Observation → Thought → Action → Observation → ... → Answer
```
- **المميزات**: Explainable، debuggable، adaptable
- **العيوب**: بطيء (sequential)، مكلف (tokens كتير في CoT)
- **الاستخدام**: المهام اللي محتاجة بحث وتحليل متعدد الخطوات

### ReWOO Pattern (Reasoning Without Observation)
```
Plan all steps first → Execute all in parallel → Synthesize
```
- **المميزات**: أسرع (parallel execution)، أقل tokens
- **العيوب**: مش مرن لو في خطوة فشلت
- **الاستخدام**: المهام المتوقعة والمعروفة مسبقاً

### CodeAct Pattern (Code as Action)
```
Reason → Generate Code → Execute in Sandbox → Observe/Debug → Loop
```
- **المميزات**: مش محدود بـ tools ثابتة — بيولد tool جديد كـ code
- **العيوب**: خطير أمنياً — محتاج sandbox قوي
- **الاستخدام**: المهام المعقدة اللي محتاجة منطق مخصص (تحليل بيانات، calculations معقدة)

### Hybrid Pattern (الأفضل لنا)
```
ReAct للأوامر البسيطة (غيّر اللون، إضافة منتج)
CodeAct للأوامر المعقدة (إضافة مكون مخصص، تحليل بيانات)
```

---

## 3. بحث: Function Calling + Tool Use

### OpenAI Function Calling
- تعريف tools كـ JSON Schema
- الـ LLM بيقرر أي tool يستخدم ومع أي parameters
- **Structured Outputs**: إخراج مضمون 100% يطابق الـ schema
- **الاستخدام في حالتنا**:
  - `changeThemeColor(primaryColor: string)`
  - `updateLayout(section: string, layout: string)`
  - `addProduct(name: string, price: number, image: string)`
  - `toggleModule(moduleId: string, enabled: boolean)`
  - `generateCode(component: string, requirements: string)`

### Vercel AI SDK
- Unified API لـ 25+ AI provider
- `generateText()`, `streamText()`, `generateObject()`
- Tool calling مدمج: `tools` parameter مع `execute` function
- **المناسبة**: مشروعنا Next.js + React — Vercel AI SDK هو الأنسب

### RAG (Retrieval Augmented Generation)
- بدل ما ندرب model جديد، بنجيب context من قاعدة بيانات ونضيفه للـ prompt
- **الاستخدام في حالتنا**:
  - RAG على design templates المتاحة
  - RAG على shop data (products, customers, orders)
  - RAG على code snippets وcomponents المتاحة

---

## 4. بحث: أمان الـ AI Code Generation

### المخاطر
1. **Prompt Injection**: مستخدم يكتب prompt خبيث يخلي الـ AI ينفذ كود خطير
2. **Data Leakage**: الـ AI يكشف بيانات حساسة في الـ generated code
3. **XSS**: كود JavaScript خبيث في الـ generated components
4. **Resource Abuse**: كود يستهلك CPU/Memory بشكل مفرط
5. **Supply Chain**: الـ AI يستخدم library مش آمنة

### حلول Sandboxing

| الحل | الوصف | السرعة | الأمان |
|------|-------|--------|--------|
| **iframe sandbox** | CSP + sandbox attribute | ⚡ سريع | ⭐⭐⭐ متوسط |
| **E2B** | Firecracker microVM | ⚡ 80ms startup | ⭐⭐⭐⭐⭐ ممتاز |
| **Web Workers** | Isolated JS thread | ⚡ فوري | ⭐⭐ ضعيف |
| **Daytona** | Cloud sandbox | ⚡ 90ms | ⭐⭐⭐⭐⭐ ممتاز |
| **Shopify Theme App Extensions** | Scoped Liquid + JS | ⚡ سريع | ⭐⭐⭐⭐ جيد |

### المقاربة المقترحة (Multi-Layer)

```
Layer 1: Content Security Policy (CSP) — منع external scripts
Layer 2: iframe sandbox — عزل الـ rendering
Layer 3: AST Validation — تحليل الكود قبل التنفيذ
Layer 4: Allowlist APIs — فقط APIs مسموح بها
Layer 5: Rate Limiting — حدود على الاستخدام
```

### Shopify Theme App Extensions كـ Model
- Shopify منعت الـ apps من تعديل theme.liquid مباشرة
- بدلاً من كده: Theme App Extensions — كل app ليه scope خاص
- App Embed Blocks: بنتحقن قبل `</head>` و `</body>` بس
- **الدرس**: إحنا كمان نعمل "Custom Code Extensions" scoped ومحدودة مش تعديل مباشر

---

## 5. بحث: معمارية الـ LLM-Powered Shopping Agents

### معمارية FaMA (Facebook Marketplace Assistant)
```
User Input → ASR (لو صوت) → Pre-processor → Reasoner/Planner (LLM)
    ↓
ReAct Scratchpad (Thought/Action separation)
    ↓
Tool Calls → API Wrappers → Domain Operations
    ↓
Observations → Scratchpad → User Response
```

### Multi-Agent Architecture
```
Orchestrator Agent
    ├── Design Agent (يتعامل مع الألوان، الـ layout، الصور)
    ├── Content Agent (يتعامل مع النصوص، الوصف، SEO)
    ├── Commerce Agent (يتعامل مع المنتجات، الطلبات، العملاء)
    └── Code Agent (يتعامل مع الـ custom code generation)
```

### Memory Management
- **Short-term**: Session-scoped (الconversation الحالي)
- **Long-term**: Shop context (الdesign الحالي، الـ modules المفعلة، الـ brand)
- **Working**: Scratchpad للـ agent (الـ thoughts والـ actions)

---

# 🗺️ الجزء الثاني: الخطة الشاملة

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    التاجر (Merchant)                          │
│         "عايز أغير لون المتجر للأزرق"                         │
│         "ضيفلي سكشن آراء العملاء"                            │
│         "اعمللي عرض خصم 20% على كل المنتجات"                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Natural Language
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              🤖 AI Assistant (Sidekick-like)                 │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Intent   │→ │ Reasoner │→ │ Tool     │→ │ Response │   │
│  │ Parser   │  │ (ReAct)  │  │ Executor │  │ Builder  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       │              │              │              │         │
│       ▼              ▼              ▼              ▼         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Tool Registry (JIT Instructions)        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │ Design  │ │Commerce │ │ Content │ │  Code   │   │   │
│  │  │ Tools   │ │ Tools   │ │ Tools   │ │ Tools   │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Tool Calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Layer                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Theme    │  │ Shop     │  │ Product  │  │ Code     │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Sandbox  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                Database + PageBuilder Store                   │
└─────────────────────────────────────────────────────────────┘
```

---

## المرحلة 1: الأساس — AI Chat Assistant (4-6 أسابيع)

### الهدف
مساعد ذكي في الـ dashboard يفهم أوامر بسيطة وينفذها

### المكونات

#### 1.1 Backend: AI Gateway Service
```
backend/src/ai/
├── ai.module.ts              # NestJS module
├── ai.controller.ts          # POST /api/v1/ai/chat
├── ai.service.ts             # Core orchestration
├── tools/
│   ├── tool-registry.ts      # Tool definitions + JIT instructions
│   ├── design-tools.ts       # Theme/layout/color tools
│   ├── commerce-tools.ts     # Product/order/promotion tools
│   ├── content-tools.ts      # Text/SEO/translation tools
│   └── code-tools.ts         # Code generation tools (Phase 2)
├── prompts/
│   ├── system-prompt.ts      # Base system prompt
│   ├── design-instructions.ts # JIT design instructions
│   └── commerce-instructions.ts
└── providers/
    ├── openai.provider.ts    # OpenAI GPT-4o / GPT-4.1
    ├── anthropic.provider.ts # Claude (fallback)
    └── ai-provider.interface.ts
```

#### 1.2 AI Chat API
```typescript
// POST /api/v1/ai/chat
interface AiChatRequest {
  message: string;           // "غيّر اللون للأزرق"
  shopId: string;
  context?: {
    currentPage?: string;    // 'dashboard' | 'products' | 'builder'
    selectedElement?: string; // element ID in PageBuilder
    locale?: string;         // 'ar' | 'en'
  };
  conversationId?: string;   // for multi-turn
}

interface AiChatResponse {
  reply: string;              // "تم تغيير اللون الأساسي إلى #3B82F6"
  actions?: AiAction[];       // actions executed
  suggestions?: string[];    // follow-up suggestions
}

interface AiAction {
  type: 'theme_change' | 'module_toggle' | 'product_update' | 'layout_change' | 'code_generate';
  payload: any;
  confirmed: boolean;        // needs merchant confirmation?
}
```

#### 1.3 Frontend: AI Assistant Panel
```typescript
// components/ai/
├── AiAssistant.tsx           # Main floating panel
├── AiChat.tsx                # Chat interface
├── AiMessage.tsx             # Message bubble (user/assistant)
├── AiActionPreview.tsx       # Preview of action before execution
├── AiSuggestionChips.tsx    # Quick suggestion buttons
└── hooks/
    ├── useAiChat.ts          # Chat state management
    └── useAiActions.ts       # Action execution
```

#### 1.4 Design Tools (المرحلة الأولى)
| Tool | الوصف | المعاملات |
|------|-------|-----------|
| `changeThemeColor` | تغيير لون الثيم | `color: string, target: 'primary' \| 'secondary' \| 'accent'` |
| `changeFont` | تغيير الخط | `fontFamily: string, target: 'heading' \| 'body'` |
| `toggleModule` | تفعيل/تعطيل module | `moduleId: string, enabled: boolean` |
| `updateShopInfo` | تحديث بيانات المتجر | `field: string, value: string` |
| `updateLayout` | تغيير ترتيب السكشنات | `sectionId: string, position: number` |
| `addProduct` | إضافة منتج | `name, price, image, category` |
| `createPromotion` | إنشاء عرض | `discount, products, startDate, endDate` |

### التقنيات
- **Vercel AI SDK** (`ai` package) — streaming, tool calling, multi-provider
- **OpenAI GPT-4.1** — primary model (best function calling)
- **Structured Outputs** — ضمان إن الـ tool calls تطابق الـ schema
- **Streaming** — الرد يظهر حرف بحرف (UX أحسن)

---

## المرحلة 2: PageBuilder AI — تعديل التصميم بالكلام (6-8 أسابيع)

### الهدف
التاجر يقول "ضيفلي سكشن آراء العملاء" أو "غيّر الـ layout لـ 3 أعمدة" والـ AI بينفذ

### المكونات

#### 2.1 PageBuilder Context Provider
```typescript
// الـ AI بيعرف الـ PageBuilder state بالكامل
interface PageBuilderContext {
  sections: Section[];        // كل السكشنات في الصفحة
  theme: ThemeConfig;         // الألوان، الخطوط، الـ spacing
  enabledModules: string[];   // الـ modules المفعلة
  shopCategory: string;       // restaurant, pharmacy, etc.
  currentLayout: LayoutConfig;// الـ layout الحالي
}
```

#### 2.2 Design Tools المتقدمة
| Tool | الوصف |
|------|-------|
| `addSection` | إضافة سكشن جديد (testimonials, FAQ, gallery, etc.) |
| `removeSection` | حذف سكشن |
| `reorderSections` | إعادة ترتيب السكشنات |
| `changeSectionLayout` | تغيير layout سكشن (grid, list, carousel) |
| `updateSectionContent` | تعديل محتوى سكشن (نص، صور، بيانات) |
| `applyDesignPreset` | تطبيق preset كامل (modern, classic, minimal) |
| `suggestDesign` | اقتراح تصميم بناءً على نوع النشاط |

#### 2.3 Design Presets System
```typescript
// كل preset = تصميم كامل جاهز
interface DesignPreset {
  id: string;               // 'modern-cafe', 'pharmacy-clean', 'boutique-luxury'
  name: string;
  category: string[];        // ['restaurant', 'cafe']
  theme: ThemeConfig;
  sections: SectionTemplate[];
  layout: LayoutConfig;
}

// الـ AI بيختار الـ preset المناسب بناءً على:
// 1. نوع النشاط (shop.category)
// 2. الـ modules المفعلة
// 3. تفضيلات التاجر (من الـ conversation)
```

#### 2.4 Visual Preview قبل التنفيذ
```
التاجر: "غيّر التصميم يبقى مودرن"
    ↓
AI: "اقتراح: تصميم Modern Cafe 🎨"
    ↓
[Preview Modal يعرض التصميم الجديد بـ before/after]
    ↓
التاجر: "عجبني" أو "عدّل اللون لأزرق"
    ↓
AI ينفذ التعديل
```

---

## المرحلة 3: AI Code Generation — أكواد مخصصة بأمان (8-10 أسابيع)

### الهدف
التاجر يقول "عايز سكشن فيه عداد تنازلي" أو "ضيفلي popup لما الزبون يخرج" والـ AI بيولد الكود بأمان

### معمارية الأمان (Multi-Layer)

```
┌─────────────────────────────────────────────────────────┐
│                  Merchant Request                         │
│         "ضيفلي عداد تنازلي في صفحة العروض"               │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 1: LLM Code Generation                           │
│  - GPT-4.1 يولد React component                        │
│  - Restricted to allowed APIs only                       │
│  - System prompt يحدد الـ constraints                   │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: AST Validation + Sanitization                  │
│  - Parse الـ code كـ AST                                │
│  - Check: no eval(), no Function(), no import من مصادر  │
│    خارجية                                                │
│  - Check: only allowed APIs used                        │
│  - Remove: inline event handlers, data URIs             │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Sandbox Execution (iframe)                     │
│  - CSP: script-src 'self' فقط                           │
│  - sandbox="allow-scripts" (بدون allow-same-origin)     │
│  - postMessage للـ communication مع الـ parent          │
│  - Time limit: 5 seconds max                            │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Visual Preview + Merchant Approval             │
│  - التاجر يشوف الـ component في الـ preview             │
│  - يوافق أو يرفض                                        │
│  - لو وافق → يتم حفظه كـ Custom Code Extension         │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Persistent Storage (Scoped)                    │
│  - Custom Code Extension = scoped snippet               │
│  - مرتبط بـ shopId + position + scope                   │
│  - يمكن حذفه/تعديله في أي وقت                           │
│  - Rate limited: max 10 custom extensions per shop       │
└─────────────────────────────────────────────────────────┘
```

#### 3.1 Custom Code Extension Model
```typescript
interface CustomCodeExtension {
  id: string;
  shopId: string;
  name: string;                // "عداد تنازلي"
  description: string;        // AI-generated description
  code: string;               // The validated React code
  position: 'header' | 'body' | 'footer' | 'section';
  scope: 'all_pages' | 'home' | 'product' | 'checkout';
  status: 'active' | 'disabled' | 'pending_review';
  createdAt: Date;
  aiGenerated: boolean;       // true = generated by AI
  approvedBy: string | null;  // merchant who approved
}
```

#### 3.2 Allowed APIs للـ Generated Code
```typescript
const ALLOWED_APIS = {
  // UI
  'React.createElement', 'useState', 'useEffect',
  // Data (read-only)
  'ShopAPI.getProducts', 'ShopAPI.getPromotions',
  // Events (via postMessage)
  'postMessage', 'addEventListener',
  // Styling
  'CSS properties', 'Tailwind classes',
};

const FORBIDDEN_PATTERNS = [
  /eval\s*\(/, /Function\s*\(/, /document\.cookie/,
  /window\.location/, /XMLHttpRequest/, /fetch\s*\(/,
  /import\s+/, /require\s*\(/, /process\./,
  /__proto__/, /constructor\[/,
];
```

#### 3.3 Code Generation Flow
```
Merchant: "ضيفلي عداد تنازلي لحد نهاية العرض"
    ↓
AI generates code with restricted APIs only
    ↓
AST Validator checks code
    ↓ (pass)          ↓ (fail)
Sandbox Preview      AI re-generates with fix
    ↓
Merchant sees preview
    ↓ (approve)       ↓ (reject)
Save as Extension    AI adjusts based on feedback
```

---

## المرحلة 4: Multi-Agent System — مساعد متعدد الوكلاء (6-8 أسابيع)

### الهدف
كل نوع مهمة ليه Agent متخصص — أسرع وأدق

### المعمارية
```
┌─────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                     │
│  (يحلل الطلب وبعته للـ agent المناسب)                    │
└────┬──────────┬──────────┬──────────┬───────────────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Design  │ │Commerce │ │ Content │ │  Code   │
│ Agent   │ │ Agent   │ │ Agent   │ │ Agent   │
│         │ │         │ │         │ │         │
│ ألوان   │ │ منتجات  │ │ نصوص    │ │ أكواد   │
│ خطوط    │ │ طلبات   │ │ SEO     │ │ sandbox │
│ layout  │ │ عروض    │ │ ترجمة   │ │ AST     │
│ صور     │ │ عملاء   │ │ وصف     │ │ preview │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

#### Orchestrator Logic
```typescript
// الـ Orchestrator بيحلل الطلب وبيدفعه للـ agent المناسب
function routeRequest(message: string): AgentType {
  if (mentionsDesign(message)) return 'design';    // ألوان، layout، صور
  if (mentionsCommerce(message)) return 'commerce'; // منتجات، طلبات، عروض
  if (mentionsContent(message)) return 'content';   // نصوص، SEO، ترجمة
  if (mentionsCode(message)) return 'code';         // كود مخصص، component
  return 'general'; // سؤال عام
}
```

#### Agent Memory
```typescript
interface AgentMemory {
  shortTerm: Message[];           // المحادثة الحالية
  longTerm: ShopContext;          // بيانات المتجر والتصميم
  working: ReActScratchpad;       // thoughts/actions/observations
}
```

---

## المرحلة 5: Proactive AI — اقتراحات استباقية (4-6 أسابيع)

### الهدف
الـ AI يبادر باقتراحات بدون ما التاجر يسأل

### أنواع الاقتراحات
| النوع | مثال | التريجر |
|-------|-------|---------|
| **تصميم** | "ممكن نضيف سكشن آراء العملاء؟ ده بيزود الـ conversion 23%" | أول زيارة بعد 3 أيام |
| **تجاري** | "عندك 5 منتجات بدون صور — دي بتقلل المبيعات 40%" | منتجات بدون صور |
| **محتوى** | "وصف المنتج ده قصير — عايز أكتبلك وصف أفضل؟" | وصف أقل من 50 حرف |
| **عروض** | "الشهر ده فيه Eid — عايز تعمل عرض خاص؟" | مناسبة قريبة |
| **تحليل** | "المبيعات نزلت 15% الأسبوع ده — عايز تشوف السبب؟" | انخفاض مفاجئ |

### Implementation
```typescript
// Background job بتشيك كل يوم
@Cron('0 9 * * *')  // كل يوم الساعة 9
async generateProactiveSuggestions(shopId: string) {
  const shop = await this.getShopContext(shopId);
  const analytics = await this.getAnalytics(shopId);

  const suggestions = await this.aiService.generate({
    prompt: PROACTIVE_SUGGESTIONS_PROMPT,
    context: { shop, analytics },
    tools: [/* suggestion tools */],
  });

  // إرسال الإشعارات
  await this.notificationService.send(shopId, suggestions);
}
```

---

# 📊 الجدول الزمني

```
الشهر 1-2    │ المرحلة 1: AI Chat Assistant الأساسي
الشهر 2-4    │ المرحلة 2: PageBuilder AI + Design Tools
الشهر 4-6    │ المرحلة 3: Code Generation + Sandbox
الشهر 6-8    │ المرحلة 4: Multi-Agent System
الشهر 8-10   │ المرحلة 5: Proactive AI + Analytics
```

---

# 🔧 التقنيات المطلوبة

| التقنية | الاستخدام | البديل |
|---------|-----------|--------|
| **Vercel AI SDK** | Chat streaming, tool calling, multi-provider | LangChain |
| **OpenAI GPT-4.1** | Primary LLM (best function calling) | Claude 4, Gemini 2.5 |
| **Prisma** | تخزين conversations + custom extensions | موجود |
| **NestJS** | AI Gateway API endpoints | موجود |
| **Redis** | Conversation cache + rate limiting | موجود |
| **iframe sandbox** | Code execution isolation | E2B (cloud) |
| **AST Parser (acorn)** | Code validation before execution | esprima |
| **Zod** | Tool schema validation | موجود |

---

# 💰 تقدير التكاليف

| البند | الشهر | السنة |
|-------|-------|-------|
| OpenAI API (GPT-4.1) | $200-500 | $2,400-6,000 |
| Redis Cloud | $10 | $120 |
| E2B Sandbox (optional) | $50 | $600 |
| **الإجمالي** | **~$300-600** | **~$3,500-7,000** |

---

# 🛡️ مبادئ الأمان

1. **Never trust AI output** — كل كود لازم يتـ validate قبل التنفيذ
2. **Principle of least privilege** — كل tool ليها صلاحيات محدودة
3. **Merchant confirmation** — أي تغيير جوهري لازم يوافق عليه التاجر
4. **Audit trail** — كل AI action يتسجل في log
5. **Rate limiting** — حد أقصى 50 طلب/ساعة لكل متجر
6. **No direct DB access** — الـ AI بيمر بالـ API layer فقط
7. **Sandbox everything** — أي كود مخصص يتشغل في sandbox
8. **Rollback** — أي تغيير يمكن التراجع عنه

---

# 🎯 أول خطوة عملية (Quick Win)

## Sprint 1: AI Chat MVP (أسبوعين)

1. **Backend**: NestJS endpoint `POST /api/v1/ai/chat`
   - OpenAI integration مع 3 tools بس:
     - `changeThemeColor`
     - `toggleModule`
     - `updateShopInfo`
2. **Frontend**: Floating chat bubble في الـ dashboard
   - Chat UI بسيط
   - Streaming responses
   - Action preview قبل التنفيذ
3. **Testing**: 5 scenarios
   - "غيّر اللون للأزرق"
   - "فعّل module الحجوزات"
   - "غيّر اسم المتجر لـ XYZ"
   - "اعمل عرض خصم 20%"
   - "إيه أحسن تصميم لمطعم؟"

ده هيديك MVP شغال في أسبوعين والتاجر يقدر يتكلم مع الـ AI!
