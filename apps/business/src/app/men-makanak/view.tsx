'use client';

import { NammyPageClient } from '@/components/nammy/NammyPageClient';
import { MenMakanakPageView } from '@/components/nammy/pages/MenMakanakPageView';

export default function MenMakanakView() {
  return (
    <NammyPageClient>
      {({ lang, openSignup }) => <MenMakanakPageView lang={lang} onOpenDemo={openSignup} />}
    </NammyPageClient>
  );
}
