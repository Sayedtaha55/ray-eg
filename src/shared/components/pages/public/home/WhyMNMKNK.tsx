import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, MapPin, Star, Calendar, MessageCircle } from 'lucide-react';

const WhyMNMKNK: React.FC = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: Store,
            title: 'مكان واحد لكل الأنشطة',
            description: 'مطاعم، كافيهات، جيم، عيادات، والمزيد في منصة واحدة',
            color: 'cyan',
        },
        {
            icon: MapPin,
            title: 'بحث سريع وذكي',
            description: 'اعثر على الأماكن القريبة منك في ثواني',
            color: 'purple',
        },
        {
            icon: Star,
            title: 'تقييمات حقيقية',
            description: 'آراء المستخدمين الحقيقيين لمساعدتك في اتخاذ القرار',
            color: 'cyan',
        },
        {
            icon: Calendar,
            title: 'حجز بسهولة',
            description: 'احجز موعدك أونلاين بدون مكالمات',
            color: 'purple',
        },
        {
            icon: MessageCircle,
            title: 'تواصل مباشر',
            description: 'تحدث مع الأماكن مباشرة عبر المحادثة الفورية',
            color: 'cyan',
        },
    ];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-5 sm:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">
                        لماذا <span className="text-[#0097A7]">MNMKNK</span>؟
                    </h2>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        منصة تجمع لك كل الأماكن في مكان واحد
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group p-6 md:p-8 rounded-2xl md:rounded-3xl bg-[#FAFAF7] border border-slate-100 hover:border-[#00E5FF]/30 hover:shadow-xl transition-all"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${feature.color === 'cyan' ? 'bg-[#00E5FF]/10 text-[#0097A7]' : 'bg-[#BD00FF]/10 text-[#9C27B0]'
                                }`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyMNMKNK;