import React from 'react';
import { AppShell } from '@/components/AppShell';
import AppRoutes from './core/AppRoutes';

const App: React.FC = () => {
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
};

export default App;
