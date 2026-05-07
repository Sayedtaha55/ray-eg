'use client';

import { useState, useEffect } from 'react';

export function useShopNotifications(shopId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = async (id: string) => {};
  const markAllAsRead = async () => {};

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
