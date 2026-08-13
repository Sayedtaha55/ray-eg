'use client';

import React from 'react';
import ModulesTab from './ModulesTab';

interface UpgradeTabProps {
  shop: any;
  onSaved: () => void;
}

// Upgrade tab reuses the ModulesTab component (same as React app)
export default function UpgradeTab({ shop, onSaved }: UpgradeTabProps) {
  return <ModulesTab shop={shop} onSaved={onSaved} />;
}
