import React from 'react';
import { AppShell } from '@/components/AppShell';
import AppRoutes from './core/AppRoutes';
import { OfflineIndicator } from '@/components/common/feedback/OfflineIndicator';

const App: React.FC = () => {
  return (
    <AppShell>
      <AppRoutes />
      <OfflineIndicator />
    </AppShell>
  );
};

export default App;
