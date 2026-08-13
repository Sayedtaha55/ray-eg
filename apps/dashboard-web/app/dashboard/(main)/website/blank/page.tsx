import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'موقع جديد',
  robots: { index: false, follow: false },
};

export default async function BuilderBlankPage() {
  // TODO: Replace with actual API call to create website
  // const website = await createWebsite('current', {
  //   name: 'موقعي الجديد',
  //   slug: `site-${Date.now()}`,
  //   status: 'draft',
  // });
  // redirect(`/dashboard/website/edit/${website.id}`);
  
  // Fallback
  redirect('/dashboard/commercial/builder');
}