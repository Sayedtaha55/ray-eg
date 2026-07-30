import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BuilderEditor from '@/components/builder/BuilderEditor';
import { getWebsite } from '@/lib/platform/services';

export const metadata: Metadata = {
  title: 'محرر الموقع',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BuilderEditPage({ params }: Props) {
  const { id } = await params;

  let website = null;
  try {
    website = await getWebsite(id);
  } catch {
    // website fetch failed — use defaults
  }

  return (
    <BuilderEditor
      websiteId={id}
      initialDesignTokens={website?.designTokens}
      initialPageSchema={website?.pageSchema}
      shopName={website?.name || 'موقعي الجديد'}
    />
  );
}
