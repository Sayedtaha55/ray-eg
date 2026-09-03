import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  Loader2,
  CheckCircle2,
  Globe,
  Wand2,
  Zap,
  ArrowRight,
  Flame,
  Copy,
  Target,
  Send,
  Layers,
  Palette,
  Layout,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { StructuredAiPatch, PatchScope } from '../../types/ai';
import {
  generateStructuredAiPatch,
  generateCompleteAiWebsite,
} from '../../services/aiGeneratorService';
import { Website, ComponentNode } from '../../types/builder';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  patch?: StructuredAiPatch;
  applied?: boolean;
  timestamp: string;
}

export const AiAssistantModal: React.FC = () => {
  const {
    isAiModalOpen,
    setIsAiModalOpen,
    selectedNode,
    activePage,
    currentTenant,
    website,
    applyAiPatch,
    loadCustomWebsite,
  } = useBuilder();

  // Mode Selection: 'patch' (Surgical edit) | 'full_site' (Complete new site) | 'prompt_guide' (Prompting Masterclass)
  const [activeTab, setActiveTab] = useState<'patch' | 'full_site' | 'prompt_guide'>('patch');

  // Patch Mode State
  const [prompt, setPrompt] = useState('');
  const [scope, setScope] = useState<PatchScope>('element');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPatch, setGeneratedPatch] = useState<StructuredAiPatch | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [justApplied, setJustApplied] = useState(false);

  // Full Site Generator State
  const [fullSitePrompt, setFullSitePrompt] = useState('');
  const [animationStyle, setAnimationStyle] = useState<string>('modern_glass');
  const [isBuildingFullSite, setIsBuildingFullSite] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<Website | null>(null);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  // Sync default scope and initialize greeting when modal opens with a selected node
  useEffect(() => {
    if (isAiModalOpen) {
      setJustApplied(false);
      if (selectedNode) {
        setScope('element');
        // If chat history is empty, add welcome message acknowledging the selected element
        if (chatHistory.length === 0) {
          setChatHistory([
            {
              id: 'init_msg',
              sender: 'ai',
              text: `مرحباً! لقد قمت بتحديد المكون: "${selectedNode.name}" (${selectedNode.type}). يمكنك طلب أي تعديل نصي، لوني، إضافة روابط، أو إضافة أقسام وسأقوم بتطبيقها فوراً على هذا المكون!`,
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else {
        setScope('section');
      }
    }
  }, [isAiModalOpen, selectedNode?.id]);

  if (!isAiModalOpen) return null;

  // Determine node characteristics for dynamic smart prompt suggestions
  const nodeType = selectedNode?.type || 'hero';
  const nodeId = selectedNode?.id || '';
  const isHeader = nodeType === 'header' || nodeId.includes('header') || nodeId.includes('nav');
  const isHero = nodeType === 'hero' || nodeId.includes('hero');
  const isBentoOrFeatures = nodeType === 'bento' || nodeType === 'features' || nodeId.includes('bento') || nodeId.includes('feature');
  const isCommerce = nodeType === 'products' || nodeType === 'pricing' || nodeId.includes('product') || nodeId.includes('price');
  const isFaq = nodeType === 'faq' || nodeId.includes('faq');
  const isContact = nodeType === 'form' || nodeId.includes('contact');

  // Dynamic Type-Specific Smart Quick Action Prompts
  const getContextualPrompts = (): string[] => {
    if (isHeader) {
      return [
        'أضف روابط لأقسام العروض، الأسطول، والأسعار في الهيدر',
        'اجعل الهيدر شفافاً زجاجياً ومثبتاً في الأعلى (Sticky Glass)',
        'أضف زر واتساب أخضر مباشر في الهيدر',
        'غير اسم الشعار إلى "مجموعة القمة للاستثمار VIP"',
        'حول خلفية الهيدر إلى الوضع الليلي الداكن الفاخر (#0b0f19)',
        'أضف قسم مميزات وبطاقات حصرية أسفل الهيدر',
      ];
    }
    if (isHero) {
      return [
        'أضف شريط إحصائيات حي (99% رضا، +1850 عميل، ضمان 5 سنوات)',
        'غير العنوان الرئيسي إلى "أرقى أسطول وموديلات حصرية 2026"',
        'أضف شارة "عروض حصرية 2026 ✨" مع تحسين الوصف التسويقي',
        'حول الخلفية إلى تدرج نيون بنفسجي داكن (#0b0f19) مع زر ذهبي',
        'أضف قسم حاسبة أسعار وباقات تفاعلية أسفل الهيرو',
      ];
    }
    if (isBentoOrFeatures) {
      return [
        'أضف بطاقة جديدة عن الضمان الشامل 5 سنوات مع فحص كمبيوتر',
        'حول بطاقات الميزات إلى نمط زجاجي 3D متوهج ناعم',
        'أضف ميزة "خدمة مستشار مبيعات VIP وتسهيلات سداد فورية"',
        'غير الألوان إلى طابع داكن فاخر مع حواف 24px وظلال عميقة',
      ];
    }
    if (isCommerce) {
      return [
        'أضف باقة VIP الشاملة بسعر 4,900 ر.س مع خصم 25%',
        'فعل كود كوبون التخفيض المباشر (VIP2026)',
        'حول بطاقات الأسعار إلى نمط ذهبي فاخر مع شارة "الأكثر طلباً"',
      ];
    }
    if (isFaq) {
      return [
        'أضف أسئلة شائعة جديدة عن الضمان وطرق الدفع وتسهيلات التقسيط',
        'حول قسم الأسئلة إلى نمط بطاقات زجاجية فاخرة',
      ];
    }
    if (isContact) {
      return [
        'أضف حقل رقم الواتساب وحقل اختيار نوع الخدمة والمدينة',
        'اجعل النموذج بتصميم فاخر مع زر إرسال ذهبي متوهج',
      ];
    }
    return [
      'تحويل خلفية العنصر إلى اللون الداكن الفاخر (#0b0f19) مع نصوص بيضاء',
      'زيادة استدارة الحواف إلى 24px وإضافة ظل سحابي عميق وبارز',
      'تطبيق اللون الذهبي الملكي (#d97706) للعناصر التفاعلية',
      'تغيير النص وإضافة شارة "عروض حصرية 2026 ✨"',
      'أضف قسم مميزات وباقات أسفل هذا المكون',
    ];
  };

  const contextualPrompts = getContextualPrompts();

  const fullSiteExamples = [
    {
      title: 'مجمع معارض ومقاولات وديكورات عقارية VIP',
      prompt: 'صمم موقعاً شاملاً يجمع بين العقارات الفاخرة، معارض الديكور، ومقاولي البناء والتشطيب مع باقات حاسبة الأسعار وبطاقات 3D تفاعلية.',
      style: 'luxury_gold',
      badge: 'شامل ومتكامل',
    },
    {
      title: 'معرض سيارات فارهة وخدمات صيانة وتأمين فوري',
      prompt: 'موقع حديث وفخم لوكالة سيارات سوبركار مع حجز تجربة قيادة VIP، وعروض تمويل بدون دفعة أولى، وشريط إحصائيات حي.',
      style: 'cyberpunk_neon',
      badge: 'أنيميشن نيون',
    },
    {
      title: 'منصة تسوق عصرية ومتاجر تجارية متعددة',
      prompt: 'متجر إلكتروني فائق السرعة مع سلة مشتريات موحدة، خصومات كوبونات حية، وزر واتساب عائم للاستشارات الفورية.',
      style: 'modern_glass',
      badge: 'تجارة إلكترونية',
    },
  ];

  const promptMasterFormulas = [
    {
      id: 'formula_luxury',
      name: 'صيغة البرومبت للمواقع الفاخرة مع أنيميشن',
      template: `صمم موقعاً إلكترونياً متكاملاً لنشاط [أدخل النشاط مثل: معرض سيارات / شركة عقارات وتطوير / عيادة VIP]:
1. الهوية البصرية: طابع داكن فاخر (Luxury Dark) مع ألوان ثانوية ذهبية ملكية (#d97706) وحواف ناعمة 24px.
2. الهيكل والمكونات: شريط تنقل علوي زجاجي، وقسم Hero مع شارة "حصري 2026"، وشبكة مميزات Bento Grid ثلاثية، ومعرض منتجات تفاعلي مع أسعار وضمان.
3. التفاعل والأنيميشن: بطاقات تفاعلية مع تأثيرات حركية عند التحويم، ونموذج حجز واستشارة فورية مع زر واتساب ذكي.
4. الصفحات: الرئيسية، العروض والأسطول، تواصل معنا.`,
    },
    {
      id: 'formula_cyberpunk',
      name: 'صيغة البرومبت للأنيميشن النيون والمواقع التقنية',
      template: `صمم منصة ويب حديثة بتقنيات الويب المستقبلية:
1. الهوية: خلفية فحمية داكنة (#080811) مع إضاءات نيون متوهجة بالوردي والبنفسجي (#ec4899 و #8b5cf6).
2. الأقسام: بانر رئيسي تفاعلي مع زر CTA متوهج، وعداد إحصائيات حي للعملاء والطلبات المكتملة، وجدول باقات مع كوبون خصم مباشر.
3. النصوص: أسلوب ترويجي قوي يركز على السرعة الفائقة والاعتمادية وضمان 5 سنوات.`,
    },
  ];

  // 1. Handle Surgical AI Patch
  const handleGeneratePatch = (userPromptText?: string) => {
    const activeText = userPromptText || prompt;
    if (!activeText.trim()) return;

    const userMsgId = `user_${Date.now()}`;
    const newChat: ChatMessage[] = [
      ...chatHistory,
      {
        id: userMsgId,
        sender: 'user',
        text: activeText,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setChatHistory(newChat);
    setIsGenerating(true);
    setJustApplied(false);

    setTimeout(() => {
      const patch = generateStructuredAiPatch(activeText, scope, {
        selectedNode,
        activePage,
        website,
        currentTenant,
      });
      setGeneratedPatch(patch);
      setIsGenerating(false);

      const aiMsgId = `ai_${Date.now()}`;
      setChatHistory([
        ...newChat,
        {
          id: aiMsgId,
          sender: 'ai',
          text: `تم تجهيز التعديلات المطلوبة بنجاح على المكون "${selectedNode?.name || 'القسم'}"! يمكنك مراجعة ملخص التغييرات بالأسفل والضغط على "تطبيق على الكانفاس" لتنفيذها فوراً.`,
          patch: patch,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setPrompt('');
    }, 500);
  };

  const handleApplyPatch = (patchToApply?: StructuredAiPatch, closeModal = true) => {
    const patch = patchToApply || generatedPatch;
    if (patch) {
      applyAiPatch(patch);
      setJustApplied(true);
      setGeneratedPatch(null);
      if (closeModal) {
        setIsAiModalOpen(false);
      }
    }
  };

  // 2. Handle Full Website Generation from Prompt
  const handleGenerateFullSite = () => {
    if (!fullSitePrompt.trim()) return;
    setIsBuildingFullSite(true);

    setTimeout(() => {
      const newSite = generateCompleteAiWebsite(fullSitePrompt, animationStyle);
      setGeneratedSite(newSite);
      setIsBuildingFullSite(false);
    }, 800);
  };

  const handleApplyFullSite = () => {
    if (generatedSite) {
      loadCustomWebsite(generatedSite);
      setIsAiModalOpen(false);
      setGeneratedSite(null);
      setFullSitePrompt('');
    }
  };

  const handleCopyFormula = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  مساعد الذكاء الاصطناعي الذكي (AI Assistant)
                </h2>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  سياق ذكي
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                تعديل ذكي موجه للعنصر المحدد أو تصميم وبناء موقع إلكتروني كامل من البرومبت
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 sm:px-6 pt-2 gap-2 select-none overflow-x-auto">
          <button
            onClick={() => setActiveTab('patch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'patch'
                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>تعديل المكون المحدد (Smart AI Patch)</span>
          </button>

          <button
            onClick={() => setActiveTab('full_site')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'full_site'
                ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>تصميم موقع كامل جديد (Full AI Site)</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt_guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'prompt_guide'
                ? 'bg-white text-purple-600 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>صيغ البرومبت والأنيميشن (Prompt Guide)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SURGICAL CONTEXTUAL PATCH */}
          {activeTab === 'patch' && (
            <div className="space-y-4">
              {/* TARGET CAPTURED COMPONENT CARD */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 rounded-2xl border border-slate-700/80 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/80 border border-indigo-400/40 text-white flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                          العنصر المستهدف للتعديل:
                        </span>
                        <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/50">
                          {selectedNode ? selectedNode.type : 'section'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                        <span>{selectedNode ? selectedNode.name : `قسم الصفحة (${activePage.name})`}</span>
                        {selectedNode?.id && (
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            #{selectedNode.id}
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>

                  {/* Scope Switcher Badges */}
                  <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setScope('element')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        scope === 'element'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      العنصر فقط
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('section')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        scope === 'section'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      القسم
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('page')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        scope === 'page'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      الصفحة
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('theme')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        scope === 'theme'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      السمة
                    </button>
                  </div>
                </div>

                {/* Target Element Quick Properties Snapshot */}
                <div className="pt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  <span className="text-slate-400">الخصائص الحالية:</span>
                  {selectedNode?.props?.text && (
                    <span className="bg-slate-800/90 px-2 py-0.5 rounded text-slate-200 truncate max-w-[200px]">
                      النص: "{selectedNode.props.text}"
                    </span>
                  )}
                  {selectedNode?.props?.title && (
                    <span className="bg-slate-800/90 px-2 py-0.5 rounded text-slate-200 truncate max-w-[200px]">
                      العنوان: "{selectedNode.props.title}"
                    </span>
                  )}
                  {selectedNode?.props?.badgeText && (
                    <span className="bg-slate-800/90 px-2 py-0.5 rounded text-amber-300">
                      الشارة: {selectedNode.props.badgeText}
                    </span>
                  )}
                  {isHeader && (
                    <span className="bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 px-2 py-0.5 rounded">
                      شريط تنقل + شعار + روابط
                    </span>
                  )}
                  <span className="text-slate-400 mr-auto text-[10px]">
                    جاهز لاستقبال أوامرك وتطبيقها مباشرة ⚡
                  </span>
                </div>
              </div>

              {/* CONVERSATIONAL CHAT TIMELINE */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-3 max-h-56 overflow-y-auto">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white font-medium rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-bl-xs'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 opacity-75 text-[10px]">
                        <span>{msg.sender === 'user' ? 'أنت' : 'مساعد الذكاء الاصطناعي'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p>{msg.text}</p>

                      {/* If message has generated patch, show rich diff summary */}
                      {msg.patch && msg.patch.diffSummary && msg.patch.diffSummary.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 font-sans">
                          <span className="text-[11px] font-bold text-indigo-700 block">
                            ملخص التعديلات التي تم تجهيزها:
                          </span>
                          <div className="space-y-1">
                            {msg.patch.diffSummary.map((diff, dIdx) => (
                              <div key={dIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{diff}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-xs text-indigo-700 font-bold max-w-[80%] animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>جاري تحليل العنصر وتوليد التعديل الذكي...</span>
                  </div>
                )}
              </div>

              {/* PROMPT INPUT & SEND */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGeneratePatch();
                      }
                    }}
                    placeholder={`اطلب أي تعديل على "${selectedNode ? selectedNode.name : 'المكون'}" (مثال: غير اللوجو، أضف روابط جديدة، غير الخلفية لأسود وأزرار ذهبية، أضف قسم تحته...)`}
                    className="w-full bg-white border-2 border-slate-200 hover:border-indigo-300 focus:border-indigo-600 rounded-2xl p-3 pl-12 text-xs outline-none transition-all resize-none shadow-xs leading-relaxed text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleGeneratePatch()}
                    disabled={isGenerating || !prompt.trim()}
                    className="absolute left-2.5 bottom-3 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all cursor-pointer shadow-sm"
                    title="إرسال وتوليد"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DYNAMIC CONTEXTUAL QUICK ACTION PROMPTS */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>اقتراحات فورية مخصصة لـ ({selectedNode ? selectedNode.name : 'هذا المكون'}):</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {contextualPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleGeneratePatch(qp)}
                      className="text-right text-[11px] bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-xl transition-all border border-slate-200 hover:border-indigo-300 cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>{qp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* JUST APPLIED FEEDBACK BANNER */}
              {justApplied && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 text-emerald-800 text-xs animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">تم تطبيق التعديلات بنجاح على الكانفاس والمعاينة الحية!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    إغلاق والعودة للكانفاس
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FULL SITE GENERATION */}
          {activeTab === 'full_site' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-2xl text-blue-900 text-xs leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-sm text-blue-950">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>توليد موقع كامل من الصفر بأحدث تقنيات 2026</span>
                </div>
                اكتب فكرة موقعك بالتفصيل (مثل: موقع يجمع بين العقارات، معارض الديكور، والمقاولات)، وسيتم بناء شريط تنقل، وقسم ترحيبي، وشبكة ميزات Bento Grid، ومعرض خدمات، وتقييمات، ونموذج حجز متكامل.
              </div>

              {/* Animation Style Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  نمط الأنيميشن والمظهر البصري:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAnimationStyle('modern_glass')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      animationStyle === 'modern_glass'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ✨ زجاجي عصري (Modern Glass)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimationStyle('luxury_gold')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      animationStyle === 'luxury_gold'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👑 أسود وذهبي فاخر (Luxury Gold)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimationStyle('cyberpunk_neon')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      animationStyle === 'cyberpunk_neon'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ⚡ نيون متوهج (Cyberpunk Neon)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimationStyle('minimal_clean')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      animationStyle === 'minimal_clean'
                        ? 'bg-slate-100 border-slate-500 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🤍 أبيض نقي بسيط (Minimal Clean)
                  </button>
                </div>
              </div>

              {/* Full Site Prompt */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  برومبت تصميم الموقع الكامل:
                </label>
                <textarea
                  rows={4}
                  value={fullSitePrompt}
                  onChange={(e) => setFullSitePrompt(e.target.value)}
                  placeholder="صف موقع أحلامك، مثال: صمم موقعاً يربط بين معارض السيارات والعقارات والمقاولات والديكورات، مع بطاقات ثلاثية الأبعاد، وحاسبة أسعار ذكية، ونموذج حجز VIP..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Ready Prompt Presets */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  قوالب برومبت متقدمة جاهزة للتوليد
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {fullSiteExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setFullSitePrompt(ex.prompt);
                        setAnimationStyle(ex.style);
                      }}
                      className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl text-right transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{ex.title}</span>
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                          {ex.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {ex.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Site Summary */}
              {generatedSite && (
                <div className="p-4 bg-slate-950 rounded-2xl text-slate-200 space-y-3 font-mono text-xs border border-blue-500/40 animate-in fade-in">
                  <div className="flex items-center justify-between text-emerald-400 pb-2 border-b border-slate-800">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>تم توليد هيكل الموقع الكامل بنجاح ({generatedSite.name})</span>
                    </span>
                    <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                      {generatedSite.pages.length} صفحات + {Object.keys(generatedSite.components).length} مكونات
                    </span>
                  </div>
                  <div className="text-slate-300 text-xs font-sans space-y-1">
                    <p className="text-blue-300 font-bold">المكونات المتضمنة في الموقع:</p>
                    <p className="text-[11px] text-slate-400">
                      ✓ شريط تنقل ذكي • قسم Hero ترحيبي • شبكة Bento Grid • معرض عروض وأسطول • آراء وتقييمات العملاء • أسئلة شائعة FAQ • استمارة حجز • فوتر متعدد القنوات
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROMPTING GUIDE */}
          {activeTab === 'prompt_guide' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-purple-900 text-xs leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-sm text-purple-950">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>دليل كتابة البرومبت الاحترافي للحصول على أفضل النتائج</span>
                </div>
                للحصول على موقع متكامل بأنيميشن وحركات جديدة، ركز دائماً على تحديد: (1) الهوية والألوان، (2) هيكل المكونات المطلوبة، (3) نوعية التفاعل والأنيميشن، (4) الصفحات الفرعية.
              </div>

              <div className="space-y-3">
                {promptMasterFormulas.map((formula) => (
                  <div
                    key={formula.id}
                    className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-300">{formula.name}</span>
                      <button
                        onClick={() => handleCopyFormula(formula.template, formula.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-slate-200 text-xs transition-colors cursor-pointer"
                      >
                        {copiedFormula === formula.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ الصيغة</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed select-text">
                      {formula.template}
                    </pre>

                    <button
                      onClick={() => {
                        setFullSitePrompt(formula.template);
                        setActiveTab('full_site');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>استخدام هذه الصيغة في التوليد المباشر</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-right w-full sm:w-auto">
            {activeTab === 'patch'
              ? 'تعديل فوري وسلس مع حفظ تلقائي وتاريخ تراجع (Ctrl+Z)'
              : 'يتم تطبيق الموقع فوراً مع الحفاظ على سرعة الاستجابة'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* TAB 1 ACTION BUTTONS */}
            {activeTab === 'patch' && (
              <>
                {generatedPatch ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setGeneratedPatch(null)}
                      className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-200 cursor-pointer font-bold"
                    >
                      تعديل البرومبت
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPatch(generatedPatch, false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>تطبيق ومتابعة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPatch(generatedPatch, true)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>تطبيق على الكانفاس فوراً 🚀</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGeneratePatch()}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التحليل وتوليد التعديل...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>تنفيذ التعديل الذكي</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* TAB 2 ACTION BUTTONS */}
            {activeTab === 'full_site' && (
              <>
                {!generatedSite ? (
                  <button
                    type="button"
                    onClick={handleGenerateFullSite}
                    disabled={isBuildingFullSite || !fullSitePrompt.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isBuildingFullSite ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري بناء الموقع والصفحات والمكونات...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>توليد وبناء الموقع الكامل</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setGeneratedSite(null)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-200 cursor-pointer font-bold"
                    >
                      إعادة التوليد
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFullSite}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>تطبيق الموقع الجديد على الكانفاس 🚀</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* TAB 3 ACTION BUTTON */}
            {activeTab === 'prompt_guide' && (
              <button
                type="button"
                onClick={() => setActiveTab('full_site')}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>الانتقال لتوليد الموقع</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
