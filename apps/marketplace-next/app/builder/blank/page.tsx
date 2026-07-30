import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createWebsite } from '@/lib/platform/services';

export const metadata: Metadata = {
  title: 'موقع جديد',
  robots: { index: false, follow: false },
};

export default async function BuilderBlankPage() {
  let websiteId = 'new';

  try {
    const website = await createWebsite('current', {
      name: 'موقعي الجديد',
      slug: `site-${Date.now()}`,
      status: 'draft',
    });
    websiteId = website.id;
  } catch {
    // fallback to editor with 'new' id
  }

  redirect(`/builder/edit/${websiteId}`);
}
