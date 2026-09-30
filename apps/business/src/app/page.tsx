import type { Metadata, Viewport } from 'next';
import { NammyDesktop } from '@/components/nammy/NammyDesktop';
import ConsentBanner from '@ray-eg/shared/components/common/ConsentBanner';

/**
 * صفحة الهبوط الجديدة — «نمّي أعمالك» (متصفح الأعمال الذكي).
 * بديلة صفحة الهبوط القديمة اللي اتنقلت لـ '/legacy'.
 * اللوجو والاسم هيتضافوا في DesktopHeader لما ملف اللوجو الجديد يوصل.
 */
export const metadata: Metadata = {
  title: 'نمّي أعمالك — متصفح الأعمال الذكي',
  description:
    'قول لنمّي عايز تعمل إيه في تجارتك: كاشير سحابي، مخزون، فواتير ضريبية، متجر إلكتروني، وتطبيق من مكانك — في منظومة واحدة.',
};

export const viewport: Viewport = {
  themeColor: '#F8F9FD',
};

export default function NammyHomePage() {
  return (
    <>
      <NammyDesktop />
      {/* بانر الكوكيز كان في الصفحة الرئيسية القديمة — احتفظنا بيه في الجديدة */}
      <ConsentBanner />
    </>
  );
}
