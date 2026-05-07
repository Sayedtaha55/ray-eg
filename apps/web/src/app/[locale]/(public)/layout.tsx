import PublicLayoutClient from '@/components/client/public/PublicLayoutClient';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayoutClient>{children}</PublicLayoutClient>;
}
