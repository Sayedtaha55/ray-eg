import React from 'react';
import { useTranslation } from 'react-i18next';

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
    order: number;
}

const HomeBanners: React.FC = () => {
    const { t } = useTranslation();

    // Placeholder banners - will be managed from admin panel
    const banners: Banner[] = [
        {
            id: '1',
            title: 'اكتشف أفضل الأماكن',
            subtitle: 'مطاعم، كافيهات، والمزيد',
            imageUrl: '/images/banners/banner-1.jpg',
            linkUrl: '/map',
            order: 1,
        },
        {
            id: '2',
            title: 'عروض حصرية',
            subtitle: 'خصومات تصل إلى 50%',
            imageUrl: '/images/banners/banner-2.jpg',
            linkUrl: '/offers',
            order: 2,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-20">
            {banners.map((banner) => (
                <div
                    key={banner.id}
                    className="relative aspect-[16/9] md:aspect-[2/1] rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 group cursor-pointer"
                >
                    {/* Placeholder gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
                            {banner.title}
                        </h3>
                        <p className="text-sm md:text-base text-slate-700 font-medium">
                            {banner.subtitle}
                        </p>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
            ))}
        </div>
    );
};

export default HomeBanners;