import type { Metadata } from 'next';
import { GrowthPage } from './GrowthPage';
import './growth.css';

export const metadata: Metadata = {
  title: 'نمي أعمالك | كل ما تحتاجه في مكان واحد',
  description: 'منصة متكاملة لإدارة وتنمية أعمالك بسهولة، من المتجر والدفع إلى الشحن والذكاء الاصطناعي.',
};

export default function NewPage() {
  return <GrowthPage />;
}