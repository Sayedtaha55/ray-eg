import type { Metadata } from 'next';
import { NAMMY_PAGE_META } from '@/nammy/routes';
import MenMakanakView from './view';

export const metadata: Metadata = {
  title: NAMMY_PAGE_META['men-makanak'].ar.title,
  description: NAMMY_PAGE_META['men-makanak'].ar.badge,
};

export default function MenMakanakPage() {
  return <MenMakanakView />;
}
