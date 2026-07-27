import { redirect } from 'next/navigation';
import { siteConfig } from '@/lib/config';

export default async function BusinessRedirect() {
  redirect(`${siteConfig.dashboardUrl}/#/business/dashboard`);
}
